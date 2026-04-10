-- Drop existing tables to recreate them with proper rules
DROP TABLE IF EXISTS public.shared_files;
DROP TABLE IF EXISTS public.shortened_urls;

-- Create 'shared_files' table
CREATE TABLE public.shared_files (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    code text NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    size integer NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT shared_files_pkey PRIMARY KEY (id),
    CONSTRAINT shared_files_code_key UNIQUE (code)
);

-- Enable RLS and Allow ALL public operations (QuickText is an open sharing tool)
ALTER TABLE public.shared_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all public operations for shared_files" ON public.shared_files FOR ALL USING (true) WITH CHECK (true);

-- Create 'shortened_urls' table
CREATE TABLE public.shortened_urls (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    short_code text NOT NULL,
    original_url text NOT NULL,
    access_count integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT shortened_urls_pkey PRIMARY KEY (id),
    CONSTRAINT shortened_urls_short_code_key UNIQUE (short_code)
);

-- Enable RLS and Allow ALL public operations
ALTER TABLE public.shortened_urls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all public operations for shortened_urls" ON public.shortened_urls FOR ALL USING (true) WITH CHECK (true);

-- Optional: Create increment access count RPC
CREATE OR REPLACE FUNCTION increment_url_access(code_val text)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.shortened_urls 
  SET access_count = access_count + 1 
  WHERE short_code = code_val;
$$;
