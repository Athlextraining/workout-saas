-- ============================================
-- Support messaging: threaded conversations between users and admins
-- ============================================

alter table public.profiles add column if not exists is_admin boolean default false;

create table public.support_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (char_length(subject) between 3 and 120),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index support_threads_user_id_idx on public.support_threads(user_id);
create index support_threads_updated_at_idx on public.support_threads(updated_at desc);

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.support_threads(id) on delete cascade,
  author text not null check (author in ('user', 'admin')),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz default now()
);

create index support_messages_thread_id_idx on public.support_messages(thread_id, created_at);

-- ============================================
-- RLS
-- ============================================

alter table public.support_threads enable row level security;
alter table public.support_messages enable row level security;

-- Threads: user sees own, admin sees all; both insert
create policy "users read own threads"
  on public.support_threads for select
  using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "users insert own threads"
  on public.support_threads for insert
  with check (auth.uid() = user_id);

create policy "owner or admin update threads"
  on public.support_threads for update
  using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- Messages: readable if thread readable; insert by owner (author user) or admin (author admin)
create policy "read messages of accessible thread"
  on public.support_messages for select
  using (
    exists (
      select 1 from public.support_threads t
      where t.id = thread_id
        and (
          t.user_id = auth.uid()
          or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
        )
    )
  );

create policy "user inserts own thread messages"
  on public.support_messages for insert
  with check (
    author = 'user'
    and exists (
      select 1 from public.support_threads t
      where t.id = thread_id and t.user_id = auth.uid()
    )
  );

create policy "admin inserts admin messages"
  on public.support_messages for insert
  with check (
    author = 'admin'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- Touch thread.updated_at when a new message is inserted
create or replace function public.touch_support_thread()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.support_threads
    set updated_at = now()
    where id = new.thread_id;
  return new;
end;
$$;

create trigger support_messages_touch_thread
  after insert on public.support_messages
  for each row execute function public.touch_support_thread();
