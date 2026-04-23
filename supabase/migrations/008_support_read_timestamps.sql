-- Track per-role read markers on threads to compute unread
alter table public.support_threads
  add column if not exists last_read_by_user timestamptz,
  add column if not exists last_read_by_admin timestamptz;
