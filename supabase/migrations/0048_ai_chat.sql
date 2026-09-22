-- AI assistant chat history (slice 2). Per-user RLS, deletable, cascades on
-- account deletion via the user_id FK. The chat works without this (persistence
-- is best-effort in the route); applying it turns on saved conversations.

create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text,
  exhibition_id uuid references exhibitions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  citations jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_conversations_user_idx on ai_conversations(user_id, updated_at desc);
create index if not exists ai_messages_conversation_idx on ai_messages(conversation_id, created_at);

alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;

create policy "own ai_conversations" on ai_conversations for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own ai_messages" on ai_messages for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
