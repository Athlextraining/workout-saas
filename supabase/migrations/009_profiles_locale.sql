-- 009_profiles_locale.sql
alter table public.profiles
  add column locale text not null default 'es'
  check (locale in ('es', 'en'));

comment on column public.profiles.locale is
  'User language preference. Drives email language and any server-side transactional copy. UI follows URL/cookie, not this column.';
