-- Run this in your Supabase SQL Editor to create the clients table

CREATE TABLE IF NOT EXISTS public.clients (
    id bigint PRIMARY KEY,
    name text,
    logo_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
