-- ============================================================
-- JUPITER — data model v0.2 (Supabase / Postgres)
-- Supersedes v0.1. Changes:
--   * posts.visibility ('private' | 'public'), private by default
--   * auto-generated pseudonyms on first sign-in (changeable later)
--   * sanitized lineage() function for the inspiration tree
--   * RLS and resonance updated for privacy
--
-- Run in the Supabase SQL editor on a fresh project.
-- Assumes Supabase Auth with the Google provider is enabled.
-- ============================================================

create extension if not exists vector;

-- ------------------------------------------------------------
-- 1. SETTINGS
-- ------------------------------------------------------------
create table app_settings (
  key   text primary key,
  value jsonb not null
);

insert into app_settings (key, value) values
  ('base_daily_cap',      '3'),     -- applies to ALL posts, private included
  ('max_post_chars',      '480'),
  ('max_context_chars',   '120'),
  ('tiers', '[
    {"name": "io",       "min_points": 0,   "cap_bonus": 0},
    {"name": "europa",   "min_points": 50,  "cap_bonus": 1},
    {"name": "ganymede", "min_points": 150, "cap_bonus": 2},
    {"name": "callisto", "min_points": 400, "cap_bonus": 3}
  ]'),
  ('resonance_threshold', '0.25');

-- ------------------------------------------------------------
-- 2. PROFILES + AUTO-GENERATED PSEUDONYMS
-- ------------------------------------------------------------
create table profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  pseudonym  text not null unique
             check (char_length(pseudonym) between 3 and 24)
             check (pseudonym ~ '^[a-zA-Z0-9_]+$'),
  created_at timestamptz not null default now()
);

create or replace function generate_pseudonym()
returns text language plpgsql as $$
declare
  adjectives text[] := array[
    'quiet','drifting','amber','distant','patient','luminous',
    'wandering','still','tidal','slow','pale','gentle'];
  nouns text[] := array[
    'io','europa','ganymede','callisto','orbit','aurora',
    'comet','tide','ring','storm','moonrise','horizon'];
  candidate text;
begin
  loop
    candidate := adjectives[1 + floor(random() * array_length(adjectives, 1))]
              || '_' || nouns[1 + floor(random() * array_length(nouns, 1))]
              || '_' || (10 + floor(random() * 90))::text;
    exit when not exists (select 1 from profiles where pseudonym = candidate);
  end loop;
  return candidate;
end $$;

-- Create a profile automatically when a user first signs in via Google.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, pseudonym)
  values (new.id, generate_pseudonym());
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ------------------------------------------------------------
-- 3. POSTS
-- ------------------------------------------------------------
create table posts (
  id             uuid primary key default gen_random_uuid(),
  author_id      uuid not null references profiles (id),
  body           text not null check (char_length(body) <= 480),
  context_note   text check (char_length(context_note) <= 120),
  image_path     text,                          -- Supabase Storage path; null = text-only
  inspired_by_id uuid references posts (id),    -- single inspirer; immutable; null = original
  visibility     text not null default 'private'
                 check (visibility in ('private','public')),
  embedding      vector(384),                   -- gte-small via Edge Function
  created_at     timestamptz not null default now(),
  deleted_at     timestamptz                    -- soft delete: lineage survives
);

create index posts_author_idx    on posts (author_id, created_at);
create index posts_inspirer_idx  on posts (inspired_by_id);
create index posts_public_idx    on posts (created_at)
  where visibility = 'public' and deleted_at is null;
create index posts_embedding_idx on posts
  using hnsw (embedding vector_cosine_ops);

create or replace function forbid_inspirer_change()
returns trigger language plpgsql as $$
begin
  if new.inspired_by_id is distinct from old.inspired_by_id then
    raise exception 'inspired_by_id is immutable';
  end if;
  return new;
end $$;

create trigger posts_inspirer_immutable
  before update on posts
  for each row execute function forbid_inspirer_change();

-- ------------------------------------------------------------
-- 4. POINT LEDGER
-- ------------------------------------------------------------
create table point_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references profiles (id),
  post_id    uuid references posts (id),
  kind       text not null check (kind in ('inspired_someone')),
  amount     int  not null,
  created_at timestamptz not null default now()
);

create index point_events_user_idx on point_events (user_id);

create or replace function user_points(p_user uuid)
returns int language sql stable as $$
  select coalesce(sum(amount), 0)::int
  from point_events where user_id = p_user;
$$;

create or replace function user_tier(p_user uuid)
returns text language sql stable as $$
  select t->>'name'
  from app_settings s,
       jsonb_array_elements(s.value) t
  where s.key = 'tiers'
    and (t->>'min_points')::int <= user_points(p_user)
  order by (t->>'min_points')::int desc
  limit 1;
$$;

create or replace function user_daily_cap(p_user uuid)
returns int language sql stable as $$
  select (select value::text::int from app_settings where key = 'base_daily_cap')
       + coalesce((
           select (t->>'cap_bonus')::int
           from app_settings s, jsonb_array_elements(s.value) t
           where s.key = 'tiers' and t->>'name' = user_tier(p_user)
         ), 0);
$$;

-- ------------------------------------------------------------
-- 5. POSTING RULES — cap + point award (insert trigger)
--    Cap counts private AND public posts (contemplative discipline).
--    A private post still awards its public inspirer a point.
-- ------------------------------------------------------------
create or replace function on_post_insert()
returns trigger language plpgsql security definer as $$
declare
  todays_count int;
  inspirer_author uuid;
begin
  select count(*) into todays_count
  from posts
  where author_id = new.author_id
    and created_at >= date_trunc('day', now())   -- UTC days
    and deleted_at is null;

  if todays_count >= user_daily_cap(new.author_id) then
    raise exception 'Daily post limit reached';
  end if;

  if new.inspired_by_id is not null then
    select author_id into inspirer_author
    from posts where id = new.inspired_by_id;

    if inspirer_author is not null
       and inspirer_author <> new.author_id then
      insert into point_events (user_id, post_id, kind, amount)
      values (inspirer_author, new.id, 'inspired_someone', 1);
    end if;
  end if;

  return new;
end $$;

create trigger posts_on_insert
  before insert on posts
  for each row execute function on_post_insert();

-- ------------------------------------------------------------
-- 6. RESONANCE — only PUBLIC posts can resonate outward.
--    Your own private post may still find public kin (p1 may be
--    private); private posts never appear as results (p2 public).
-- ------------------------------------------------------------
create or replace function resonant_posts(p_post uuid, p_limit int default 5)
returns table (post_id uuid, distance float) language sql stable as $$
  select p2.id, p2.embedding <=> p1.embedding as distance
  from posts p1
  join posts p2
    on p2.id <> p1.id
   and p2.visibility = 'public'
   and p2.deleted_at is null
   and p2.embedding is not null
   and p2.author_id <> p1.author_id
  where p1.id = p_post
    and p1.embedding is not null
    and (p2.embedding <=> p1.embedding) <
        (select value::text::float from app_settings
         where key = 'resonance_threshold')
  order by distance
  limit p_limit;
$$;

-- ------------------------------------------------------------
-- 7. LINEAGE — the inspiration tree, sanitized.
--    Walks up to the root, then returns the whole tree.
--    Private / deleted nodes (other than the caller's own)
--    come back as hidden placeholders with no content.
-- ------------------------------------------------------------
create or replace function lineage(p_post uuid)
returns table (
  post_id        uuid,
  inspired_by_id uuid,
  pseudonym      text,
  body           text,
  created_at     timestamptz,
  hidden         boolean
) language sql stable security definer set search_path = public as $$
  with recursive up as (              -- climb to the root
    select p.* from posts p where p.id = p_post
    union all
    select p.* from posts p join up on p.id = up.inspired_by_id
  ),
  root as (
    select id from up where inspired_by_id is null
    union all                          -- fallback: topmost reachable node
    select id from up order by created_at asc limit 1
  ),
  tree as (                            -- descend from the root
    select p.* from posts p where p.id = (select id from root limit 1)
    union all
    select p.* from posts p join tree t on p.inspired_by_id = t.id
  )
  select
    t.id,
    t.inspired_by_id,
    case when visible then pr.pseudonym else null end,
    case when visible then t.body      else null end,
    t.created_at,
    not visible
  from tree t
  join profiles pr on pr.id = t.author_id
  cross join lateral (
    select (t.deleted_at is null
            and (t.visibility = 'public' or t.author_id = auth.uid()))
           as visible
  ) v;
$$;

-- ------------------------------------------------------------
-- 8. ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table profiles     enable row level security;
alter table posts        enable row level security;
alter table point_events enable row level security;
alter table app_settings enable row level security;

create policy profiles_read   on profiles for select to authenticated using (true);
create policy profiles_update on profiles for update to authenticated
  using (id = auth.uid());

-- posts: public+undeleted readable by all members; your own always readable
create policy posts_read on posts for select to authenticated
  using ((visibility = 'public' and deleted_at is null)
         or author_id = auth.uid());
create policy posts_insert on posts for insert to authenticated
  with check (author_id = auth.uid());
-- own posts only: used for soft delete and private->public toggle
create policy posts_update on posts for update to authenticated
  using (author_id = auth.uid());

create policy points_read on point_events for select to authenticated
  using (user_id = auth.uid());

create policy settings_read on app_settings for select to authenticated
  using (true);
