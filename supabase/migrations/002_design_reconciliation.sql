-- ============================================================
-- JUPITER — migration 002: design reconciliation
-- Reconciles the v0.2 schema with the Europa-ice design bundle
-- (design_handoff_jupiter/). Additive; leaves 001 intact.
--
-- Changes (design wins; see ARCHITECTURE.md "Changes from v0.2"):
--   1. Sigils replace image attachments — add posts.sigil; the
--      allowed set lives in app_settings.sigils (kept flexible);
--      image_path stays but is unused (backlog).
--   2. Edit locked once a post has descendants (delete still allowed);
--      admins bypass. Withdrawn-vs-gone is positional (no new column).
--   3. Admin = backend-configured admins table + is_admin() + RLS;
--      admins may edit/soft-delete any public post.
--   4. Tier thresholds: Ganymede 150->140, Callisto 400->300.
--   5. lineage() returns hidden_reason ('private'|'withdrawn'|null)
--      so the UI can pick the right placeholder copy.
--
-- Run in the Supabase SQL editor after 001.
-- ============================================================

-- ------------------------------------------------------------
-- 1. SIGILS — replace image attachments
--    The set is tunable; keep it as initial state, not a hard enum.
-- ------------------------------------------------------------
alter table posts add column if not exists sigil text;

insert into app_settings (key, value) values
  ('sigils', '["moon","citrus","music","cup","book","candle","leaf","wave","paw","window"]')
on conflict (key) do update set value = excluded.value;

create or replace function valid_sigil(p_sigil text)
returns boolean language sql stable as $$
  select p_sigil is null
      or exists (
        select 1
        from app_settings s,
             jsonb_array_elements_text(s.value) g
        where s.key = 'sigils' and g = p_sigil
      );
$$;

create or replace function check_post_sigil()
returns trigger language plpgsql as $$
begin
  if not valid_sigil(new.sigil) then
    raise exception 'invalid sigil: %', new.sigil;
  end if;
  return new;
end $$;

create trigger posts_sigil_check
  before insert or update on posts
  for each row execute function check_post_sigil();

-- ------------------------------------------------------------
-- 2. TIER THRESHOLDS — match the design's orbit math
--    Caps unchanged: Io 3 / Europa 4 / Ganymede 5 / Callisto 6.
-- ------------------------------------------------------------
update app_settings set value = '[
    {"name": "io",       "min_points": 0,   "cap_bonus": 0},
    {"name": "europa",   "min_points": 50,  "cap_bonus": 1},
    {"name": "ganymede", "min_points": 140, "cap_bonus": 2},
    {"name": "callisto", "min_points": 300, "cap_bonus": 3}
  ]'::jsonb
where key = 'tiers';

-- ------------------------------------------------------------
-- 3. ADMINS — backend-configured moderation list
--    Membership is managed out-of-band (service role / SQL editor),
--    NEVER from the client. To grant admin:
--      insert into admins (user_id) values ('<profile uuid>');
--    A user may read only their own row (to surface adminMode in the
--    UI); is_admin() is the authoritative check used by RLS.
-- ------------------------------------------------------------
create table admins (
  user_id  uuid primary key references profiles (id) on delete cascade,
  added_at timestamptz not null default now()
);

alter table admins enable row level security;

create policy admins_read_self on admins for select to authenticated
  using (user_id = auth.uid());

create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- ------------------------------------------------------------
-- 4. EDIT LOCK — once a page has inspired others, content is frozen.
--    Authors may still soft-delete (set deleted_at). Admins bypass.
--    "has descendants" = at least one non-deleted child.
-- ------------------------------------------------------------
create or replace function has_descendants(p_post uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from posts
    where inspired_by_id = p_post
      and deleted_at is null
  );
$$;

create or replace function forbid_locked_edit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Content edits are blocked once the post has descendants, unless the
  -- caller is an admin. Setting deleted_at (soft delete) is always allowed.
  if (new.body         is distinct from old.body
      or new.context_note is distinct from old.context_note
      or new.sigil        is distinct from old.sigil)
     and has_descendants(old.id)
     and not is_admin()
  then
    raise exception 'editing is locked: this page has inspired others';
  end if;
  return new;
end $$;

create trigger posts_edit_lock
  before update on posts
  for each row execute function forbid_locked_edit();

-- ------------------------------------------------------------
-- 5. ADMIN RLS — admins may edit / soft-delete ANY public post.
--    Permissive policies are OR'd with the existing owner policy.
--    inspired_by_id stays immutable (existing trigger) and the edit
--    lock above does not apply to admins.
-- ------------------------------------------------------------
create policy posts_admin_update on posts for update to authenticated
  using (is_admin() and visibility = 'public')
  with check (is_admin() and visibility = 'public');

-- ------------------------------------------------------------
-- 6. LINEAGE — expose WHY a node is hidden, so the UI can choose
--    "a private reflection" vs "a thought, since withdrawn".
--    Withdrawn (soft-deleted) takes precedence over private.
-- ------------------------------------------------------------
create or replace function lineage(p_post uuid)
returns table (
  post_id        uuid,
  inspired_by_id uuid,
  pseudonym      text,
  body           text,
  created_at     timestamptz,
  hidden         boolean,
  hidden_reason  text
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
    not visible,
    case
      when visible                  then null
      when t.deleted_at is not null then 'withdrawn'
      else                               'private'
    end
  from tree t
  join profiles pr on pr.id = t.author_id
  cross join lateral (
    select (t.deleted_at is null
            and (t.visibility = 'public' or t.author_id = auth.uid()))
           as visible
  ) v;
$$;
