-- Plans that cannot be shared or save nothing when split (docs/research-predplatne.md §3, red list).
-- chatgpt-team stays for now: one existing group still uses it (groups_service_slug_fkey is RESTRICT).
delete from public.services
where slug in ('xbox-game-pass', 'playstation-plus', 'ea-play', 'ubisoft-plus',
               'midjourney', 'perplexity', 'elevenlabs', 'netflix-standard')
  and not exists (select 1 from public.groups g where g.service_slug = services.slug);
