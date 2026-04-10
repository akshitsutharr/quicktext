-- Allow multiple files to share one code in shared_files
-- Run this once on existing databases that already have shared_files_code_key.

ALTER TABLE public.shared_files
DROP CONSTRAINT IF EXISTS shared_files_code_key;

CREATE INDEX IF NOT EXISTS idx_shared_files_code ON public.shared_files(code);
