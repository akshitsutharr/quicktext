-- Pairing Sessions Table
CREATE TABLE IF NOT EXISTS public.pairing_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    session_id text NOT NULL UNIQUE,
    pairing_code text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    device_tokens text[] DEFAULT '{}'::text[],
    CONSTRAINT pairing_sessions_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_pairing_sessions_code ON public.pairing_sessions(pairing_code);
CREATE INDEX IF NOT EXISTS idx_pairing_sessions_session_id ON public.pairing_sessions(session_id);

ALTER TABLE public.pairing_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all public operations for pairing_sessions" ON public.pairing_sessions FOR ALL USING (true) WITH CHECK (true);

-- Session Shares Table
CREATE TABLE IF NOT EXISTS public.session_shares (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    session_id text NOT NULL,
    type text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT session_shares_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_session_shares_session_id ON public.session_shares(session_id);

ALTER TABLE public.session_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all public operations for session_shares" ON public.session_shares FOR ALL USING (true) WITH CHECK (true);
