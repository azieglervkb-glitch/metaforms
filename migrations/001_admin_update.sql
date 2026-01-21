-- Admin Panel Migration Script
-- Run this script in your SQL tool (Coolify Database Manager) to update the existing database.

-- 1. Add is_super_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- 2. Update organizations table default status and add check constraint if needed
-- We change the default for NEW organizations, existing ones keep their status.
ALTER TABLE organizations ALTER COLUMN subscription_status SET DEFAULT 'pending_approval';

-- 3. Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Initial Setup: Promote a user to Super Admin
-- REPLACE 'your-email@example.com' with your actual email address!
-- UPDATE users SET is_super_admin = true WHERE email = 'your-email@example.com';
