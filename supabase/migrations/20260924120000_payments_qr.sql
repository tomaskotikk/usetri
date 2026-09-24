-- supabase/migrations/20260924120000_payments_qr.sql
-- QR payments between members. Spec: docs/superpowers/specs/2026-09-24-qr-platby-design.md
-- The mobile app writes to these tables directly, so RLS and triggers are the only guard.

-- Today's date where our users live, not UTC.
create or replace function public.prague_today()
returns date
language sql
stable
set search_path to ''
as $$ select (now() at time zone 'Europe/Prague')::date $$;

-- Mirrors dueDateFor in lib/billing.ts: `start + k months` clamps to the month end
-- and is always computed from the start, so 31. 1. → 28. 2. → 31. 3.
create or replace function public.is_billing_date(start date, d date)
returns boolean
language sql
immutable
set search_path to ''
as $$
  select d >= start
     and (start + make_interval(months =>
            ((extract(year from d) - extract(year from start)) * 12
             + extract(month from d) - extract(month from start))::int))::date = d
$$;

-- ── Payout accounts ────────────────────────────────────────────────────────────
-- Never on profiles: those are readable by every signed-in user.
create table public.payout_accounts (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  iban text not null check (iban ~ '^CZ[0-9]{22}$'),
  account_display text not null,
  updated_at timestamptz not null default now()
);

alter table public.payout_accounts enable row level security;

create policy "Owners and their members read the payout account"
  on public.payout_accounts for select to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1
      from public.groups g
      join public.group_members m on m.group_id = g.id
      where g.owner_id = payout_accounts.user_id
        and m.user_id = (select auth.uid())
    )
  );

create policy "Users write their own payout account"
  on public.payout_accounts for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update their own payout account"
  on public.payout_accounts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete their own payout account"
  on public.payout_accounts for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ── Billing columns on members ─────────────────────────────────────────────────
create sequence public.payment_ref_seq start 40000001;

-- The defaults fill existing rows: billing starts today, so nobody owes backwards.
alter table public.group_members
  add column billing_start date not null default public.prague_today(),
  add column payment_ref bigint not null default nextval('public.payment_ref_seq');

alter table public.group_members
  add constraint group_members_payment_ref_key unique (payment_ref);

-- Backfill done. From now on only the trigger assigns it: a column default would run
-- as the joining user (needing sequence rights) and burn two numbers per insert.
alter table public.group_members alter column payment_ref drop default;

-- Clients insert memberships directly, so both values are always overwritten here.
create or replace function public.guard_seat_capacity()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  g public.groups%rowtype;
begin
  select * into g from public.groups where id = new.group_id for update;
  if g.closed then
    raise exception 'Tahle nabídka je uzavřená.' using errcode = 'check_violation';
  end if;
  if (select count(*) from public.group_members m where m.group_id = new.group_id) >= g.seats_total then
    raise exception 'Skupina je plná.' using errcode = 'check_violation';
  end if;

  new.billing_start := public.prague_today();
  new.payment_ref := nextval('public.payment_ref_seq');
  return new;
end;
$function$;

-- ── Payments ───────────────────────────────────────────────────────────────────
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  period_start date not null,
  amount integer not null,
  status text not null check (status in ('reported', 'confirmed')),
  reported_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (group_id, user_id, period_start)
);

create index payments_user_idx on public.payments (user_id);

create or replace function public.guard_payment_insert()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  starts date;
begin
  select m.billing_start into starts
  from public.group_members m
  where m.group_id = new.group_id and m.user_id = new.user_id and m.role = 'member';

  if starts is null then
    raise exception 'Platit můžou jen členové skupiny.' using errcode = 'check_violation';
  end if;
  if not public.is_billing_date(starts, new.period_start) then
    raise exception 'Tohle není den splatnosti.' using errcode = 'check_violation';
  end if;
  if new.period_start > public.prague_today() + 7 then
    raise exception 'Tak daleko dopředu platit nejde.' using errcode = 'check_violation';
  end if;

  -- The client never decides the amount.
  new.amount := (select g.price_per_seat from public.groups g where g.id = new.group_id);

  if new.status = 'reported' then
    new.reported_at := now();
    new.confirmed_at := null;
  else
    new.reported_at := null;
    new.confirmed_at := now();
  end if;
  new.created_at := now();
  return new;
end;
$function$;

create trigger payments_guard_insert
  before insert on public.payments
  for each row execute function public.guard_payment_insert();

-- The only allowed change is reported → confirmed; everything else stays as it was.
create or replace function public.guard_payment_update()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if old.status <> 'reported' or new.status <> 'confirmed' then
    raise exception 'Platbu jde jen potvrdit.' using errcode = 'check_violation';
  end if;

  new.id := old.id;
  new.group_id := old.group_id;
  new.user_id := old.user_id;
  new.period_start := old.period_start;
  new.amount := old.amount;
  new.reported_at := old.reported_at;
  new.created_at := old.created_at;
  new.confirmed_at := now();
  return new;
end;
$function$;

create trigger payments_guard_update
  before update on public.payments
  for each row execute function public.guard_payment_update();

alter table public.payments enable row level security;

create policy "Payer and group owner read payments"
  on public.payments for select to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (select 1 from public.groups g where g.id = payments.group_id and g.owner_id = (select auth.uid()))
  );

create policy "Members report, owners mark paid"
  on public.payments for insert to authenticated
  with check (
    ((select auth.uid()) = user_id and status = 'reported')
    or (
      status = 'confirmed'
      and exists (select 1 from public.groups g where g.id = payments.group_id and g.owner_id = (select auth.uid()))
    )
  );

create policy "Owners confirm payments"
  on public.payments for update to authenticated
  using (exists (select 1 from public.groups g where g.id = payments.group_id and g.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.groups g where g.id = payments.group_id and g.owner_id = (select auth.uid())));

grant select, insert, update, delete on public.payout_accounts, public.payments to authenticated;

-- Owners may also delete a confirmed payment: that is undoing "Označit jako zaplacené".
create policy "Owners reject, payers take back a report"
  on public.payments for delete to authenticated
  using (
    exists (select 1 from public.groups g where g.id = payments.group_id and g.owner_id = (select auth.uid()))
    or ((select auth.uid()) = user_id and status = 'reported')
  );
