-- Create the shared_texts table
CREATE TABLE IF NOT EXISTS shared_texts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(5) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shared_texts_code ON shared_texts(code);
CREATE INDEX IF NOT EXISTS idx_shared_texts_expires_at ON shared_texts(expires_at);

-- Enable Row Level Security (optional, for better security)
ALTER TABLE shared_texts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (since we're not using auth)
CREATE POLICY "Allow all operations on shared_texts" ON shared_texts
FOR ALL USING (true);
