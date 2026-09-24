-- What an invite link shows to anyone holding it, signed in or not.
-- Groups are only readable when signed in, so this hands out exactly the card and
-- nothing more: no member list, no note, no owner id, only the owner's first name.
create or replace function public.get_invite(p_group uuid)
returns table (
  id uuid,
  service_slug text,
  service_name text,
  service_plan text,
  service_color text,
  full_price integer,
  price_per_seat integer,
  seats_total integer,
  seats_taken integer,
  closed boolean,
  owner_first_name text,
  owner_avatar_url text
)
language sql
stable
security definer
set search_path to ''
as $$
  select g.id, s.slug, s.name, s.plan, s.color, s.full_price, g.price_per_seat,
         g.seats_total, g.seats_taken, g.closed,
         nullif(split_part(trim(coalesce(p.full_name, '')), ' ', 1), ''),
         p.avatar_url
  from public.groups g
  join public.services s on s.slug = g.service_slug
  join public.profiles p on p.id = g.owner_id
  where g.id = p_group
$$;

revoke execute on function public.get_invite(uuid) from public;
grant execute on function public.get_invite(uuid) to anon, authenticated;
