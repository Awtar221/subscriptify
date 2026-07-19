-- Full database schema for Subscriptify.
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Safe to re-run: every statement is guarded (IF NOT EXISTS / DROP...IF EXISTS)
-- so running it again after the table already exists is a no-op except for
-- picking up any policy/index changes.
--
-- Auth (login.js, register.js, session.js) uses Supabase's built-in
-- auth.users table — nothing to create for that, it exists automatically.
--
-- subscriptions is the only app table (simple_CRUD.js, analytics.js,
-- dropdown.js), one row per subscription, owned by the user who created it.

CREATE SEQUENCE IF NOT EXISTS public.subscriptions_id_seq;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id bigint NOT NULL DEFAULT nextval('subscriptions_id_seq'::regclass),
  user_id uuid NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  cost numeric NOT NULL,
  renewal_date date NOT NULL,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'cancelled'::text])),
  notes text DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;

-- Every query the app makes filters by user_id (loadData, updateStats, delete-all) — index it.
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);

-- RLS: every table the app talks to over the anon/authenticated key needs this,
-- otherwise any logged-in user could read or write every other user's rows.
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select own subscriptions" ON public.subscriptions;
CREATE POLICY "select own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert own subscriptions" ON public.subscriptions;
CREATE POLICY "insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update own subscriptions" ON public.subscriptions;
CREATE POLICY "update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete own subscriptions" ON public.subscriptions;
CREATE POLICY "delete own subscriptions" ON public.subscriptions
  FOR DELETE USING (auth.uid() = user_id);
