-- Create a function to automatically cleanup expired texts
CREATE OR REPLACE FUNCTION cleanup_expired_texts()
RETURNS void AS $$
BEGIN
  DELETE FROM shared_texts 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Note: Since pg_cron might not be available, we'll handle cleanup in the application code
-- The cleanup will happen automatically when users access texts
