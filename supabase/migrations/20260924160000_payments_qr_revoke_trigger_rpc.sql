-- Trigger functions are not an API: keep them off /rest/v1/rpc like the older guards.
revoke execute on function public.guard_payment_insert() from public, anon, authenticated;
revoke execute on function public.guard_payment_update() from public, anon, authenticated;
