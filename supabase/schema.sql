-- =============================================
-- INFLECTIV DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- Stores user profile information
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core identity
  email TEXT UNIQUE,
  wallet_address TEXT UNIQUE,

  -- Profile info
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,

  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);

-- =============================================
-- ASSETS TABLE
-- Stores tokenized data assets
-- =============================================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Ownership
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Asset identification
  token_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- Asset metadata
  category TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Structured data from RAG processing
  structured_data JSONB DEFAULT '{}',

  -- Original file info
  original_filename TEXT,
  file_type TEXT,
  file_size INTEGER,

  -- Marketplace info
  price DECIMAL(18, 8),
  currency TEXT DEFAULT 'ETH',
  is_listed BOOLEAN DEFAULT FALSE,

  -- Statistics
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'active', 'archived')),

  -- IPFS/Storage
  ipfs_hash TEXT,
  storage_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_assets_user ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_token ON assets(token_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_listed ON assets(is_listed) WHERE is_listed = TRUE;
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- Enable when auth is implemented
-- =============================================

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all users (public profiles)
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Policy: Allow inserting new users (for Web3Auth registration)
-- Note: In production, consider using service role or additional validation
CREATE POLICY "Anyone can create a user profile"
  ON users FOR INSERT
  WITH CHECK (true);

-- Policy: Assets are viewable by everyone (marketplace)
CREATE POLICY "Assets are viewable by everyone"
  ON assets FOR SELECT
  USING (true);

-- Policy: Users can insert their own assets
CREATE POLICY "Users can create own assets"
  ON assets FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Users can update their own assets
CREATE POLICY "Users can update own assets"
  ON assets FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Policy: Users can delete their own assets
CREATE POLICY "Users can delete own assets"
  ON assets FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- =============================================
-- UPDATED_AT TRIGGER
-- Auto-update the updated_at column
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- Uncomment to insert test data
-- =============================================
/*
INSERT INTO users (id, email, username, display_name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'testuser', 'Test User');

INSERT INTO assets (user_id, token_id, name, description, category, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'INFL-001', 'Sample Dataset', 'A sample tokenized dataset', 'research', 'active');
*/
