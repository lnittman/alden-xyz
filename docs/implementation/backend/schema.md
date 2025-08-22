# Database Schema & Implementation

## Overview

The enso backend uses Supabase PostgreSQL with the following key features:
- Vector embeddings (pgvector) for semantic search
- Real-time subscriptions for live updates
- Row Level Security (RLS) for fine-grained access control
- Edge Functions for AI processing

## Core Tables (Matching DB schema in supabase/scripts/)

### Profiles
```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Chats
```sql
create table public.chats (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('personal', 'direct', 'group')),
  title text,
  created_by uuid references public.profiles(id) not null,
  is_archived boolean default false,
  pinned boolean default false,
  last_viewed_at timestamptz,
  labels text[] default array[]::text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Chat Participants
```sql
create table public.chat_participants (
  chat_id uuid references public.chats(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  last_read_at timestamptz default now(),
  primary key (chat_id, user_id)
);
```

### Messages
```sql
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid references public.chats(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Files
```sql
create table public.files (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid references public.chats(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  path text not null,
  type text not null,
  embedding vector(1536),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
```

### Contexts
```sql
create table public.contexts (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  content jsonb not null,
  metadata jsonb default '{}'::jsonb,
  embedding vector(1536),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Message Contexts
```sql
create table public.message_contexts (
  message_id uuid references public.messages(id) on delete cascade,
  context_id uuid references public.contexts(id) on delete cascade,
  similarity float,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  primary key (message_id, context_id)
);
```

### Embedding Queue
```sql
create table public.embedding_queue (
  id uuid primary key default uuid_generate_v4(),
  content_id uuid not null,
  content_type text not null,
  status text not null default 'pending',
  attempts int not null default 0,
  last_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Indexes

### Performance Indexes
```sql
-- Message lookups
create index idx_messages_chat_id on public.messages(chat_id);

-- Chat organization
create index idx_chats_archived on public.chats(is_archived) where is_archived = true;
create index idx_chats_pinned on public.chats(pinned) where pinned = true;
create index idx_chats_labels on public.chats using gin(labels);

-- Context lookups
create index idx_contexts_type on public.contexts(type);
create index idx_message_contexts_message_id on public.message_contexts(message_id);
create index idx_message_contexts_context_id on public.message_contexts(context_id);

-- Queue management
create index idx_embedding_queue_status on public.embedding_queue(status, created_at);
```

### Vector Indexes
```sql
-- Message embeddings
create index idx_messages_embedding on public.messages 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- File embeddings
create index idx_files_embedding on public.files 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Context embeddings
create index idx_contexts_embedding on public.contexts 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
```

## Functions

### Similarity Search
```sql
create or replace function match_messages (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  included_chats uuid[] default null
)
returns table (
  id uuid,
  chat_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    messages.id,
    messages.chat_id,
    messages.content,
    messages.metadata,
    1 - (messages.embedding <=> query_embedding) as similarity
  from messages
  where 1 - (messages.embedding <=> query_embedding) > match_threshold
    and (included_chats is null or messages.chat_id = any(included_chats))
  order by messages.embedding <=> query_embedding
  limit match_count;
$$;

create or replace function match_files (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  included_chats uuid[] default null
)
returns table (
  id uuid,
  chat_id uuid,
  path text,
  type text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    files.id,
    files.chat_id,
    files.path,
    files.type,
    files.metadata,
    1 - (files.embedding <=> query_embedding) as similarity
  from files
  where 1 - (files.embedding <=> query_embedding) > match_threshold
    and (included_chats is null or files.chat_id = any(included_chats))
  order by files.embedding <=> query_embedding
  limit match_count;
$$;
```

## Row Level Security (RLS)

### Chat Access
```sql
-- View access
create policy "Users can view their chats"
  on public.chats for select
  using (
    exists (
      select 1 from public.chat_participants
      where chat_id = id and user_id = auth.uid()
    )
  );

-- Creation access
create policy "Users can create chats"
  on public.chats for insert
  with check (auth.uid() = created_by);
```

### Message Access
```sql
-- View access
create policy "Users can view messages in their chats"
  on public.messages for select
  using (
    exists (
      select 1 from public.chat_participants
      where chat_id = messages.chat_id 
      and user_id = auth.uid()
    )
  );

-- Send access
create policy "Users can send messages to their chats"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.chat_participants
      where chat_id = messages.chat_id 
      and user_id = auth.uid()
    )
  );
```

### Context Access
```sql
-- View access
create policy "Users can view contexts in their chats"
  on public.contexts for select
  using (
    exists (
      select 1 from public.message_contexts mc
      join public.messages m on m.id = mc.message_id
      join public.chat_participants cp on cp.chat_id = m.chat_id
      where mc.context_id = contexts.id
      and cp.user_id = auth.uid()
    )
  );

create policy "Users can view message contexts in their chats"
  on public.message_contexts for select
  using (
    exists (
      select 1 from public.messages m
      join public.chat_participants cp on cp.chat_id = m.chat_id
      where m.id = message_contexts.message_id
      and cp.user_id = auth.uid()
    )
  );

create policy "System can manage embedding queue"
  on public.embedding_queue for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
```

## Real-time Subscriptions

### Messages
```sql
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime 
add table public.chats, public.messages;
```

## Edge Functions

### Embedding Generation
- `generate-embedding/`: Text embedding generation using Vertex AI
- Input: Text content
- Output: 1536-dimensional vector

### Context Detection
- `detect-context/`: Real-time context detection in messages
- Input: Message text and chat ID
- Output: List of detected contexts with metadata

### Knowledge Extraction
- `extract-knowledge/`: Extract structured knowledge from messages
- Input: Message content
- Output: Extracted knowledge in JSON format

## Migrations

See the full migration files in `migrations/` for detailed schema evolution:
- `20240202_init.sql`: Initial schema setup
- `20240203_fix_chat_policies.sql`: Enhanced RLS policies
- `20240204_references.sql`: Reference system
- `20240205_chat_organization.sql`: Chat organization features

## Related Documentation
- [@ai_architecture.md](../architecture/ai_architecture.md): AI system design
- [@ai_flow.md](../architecture/ai_flow.md): Data flow diagrams
- [@implementation_web.md](../implementation/web/implementation_web.md): Web integration 
