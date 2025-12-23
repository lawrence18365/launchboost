-- Create table for tracking spin wheel attempts to prevent multiple spins per user/IP
CREATE TABLE IF NOT EXISTS spin_wheel_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint TEXT NOT NULL UNIQUE, -- Combination of IP + user agent hash
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  email TEXT NOT NULL,
  prize TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_spin_wheel_fingerprint ON spin_wheel_attempts(fingerprint);
CREATE INDEX IF NOT EXISTS idx_spin_wheel_ip ON spin_wheel_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_spin_wheel_created_at ON spin_wheel_attempts(created_at);

-- Add RLS policy (admin can view all, users can't access directly)
ALTER TABLE spin_wheel_attempts ENABLE ROW LEVEL SECURITY;

-- Only allow read access for authenticated admin users
CREATE POLICY "Admin can view spin attempts" ON spin_wheel_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = auth.users.id 
      AND auth.users.email = 'hayleemj00@gmail.com'
    )
  );

-- No direct insert/update/delete policies - only via API
CREATE POLICY "No direct insert" ON spin_wheel_attempts
  FOR INSERT WITH CHECK (false);

CREATE POLICY "No direct update" ON spin_wheel_attempts
  FOR UPDATE USING (false);

CREATE POLICY "No direct delete" ON spin_wheel_attempts
  FOR DELETE USING (false);