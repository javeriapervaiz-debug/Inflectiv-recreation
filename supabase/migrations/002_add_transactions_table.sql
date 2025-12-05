-- =============================================
-- MIGRATION: Add transactions table for earnings tracking
-- Run this in Supabase SQL Editor after previous migrations
-- =============================================

-- =============================================
-- TRANSACTIONS TABLE
-- Stores all marketplace transactions for earnings tracking
-- =============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Transaction identification
  transaction_hash TEXT UNIQUE NOT NULL,
  block_number BIGINT,

  -- Related entities
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  listing_id TEXT,                           -- Marketplace listing ID

  -- Parties involved
  seller_address TEXT NOT NULL,              -- Who sold (receives seller_amount)
  buyer_address TEXT NOT NULL,               -- Who bought
  creator_address TEXT,                      -- Original creator (receives royalty)

  -- Transaction amounts (stored in wei as TEXT to handle big numbers)
  total_amount TEXT NOT NULL,                -- Total purchase price
  seller_amount TEXT NOT NULL,               -- Amount to seller (92.5%)
  platform_fee TEXT NOT NULL,                -- Platform fee (2.5%)
  royalty_amount TEXT NOT NULL,              -- Creator royalty (5%)

  -- Human readable amounts (in MATIC/ETH)
  total_amount_display DECIMAL(18, 8),
  seller_amount_display DECIMAL(18, 8),
  platform_fee_display DECIMAL(18, 8),
  royalty_amount_display DECIMAL(18, 8),

  -- Token details
  token_amount INTEGER NOT NULL,             -- Number of access tokens purchased
  price_per_token TEXT,                      -- Price per token in wei

  -- Asset info (denormalized for quick queries)
  asset_name TEXT,
  asset_token_id TEXT,                       -- INFL-xxx
  blockchain_token_id TEXT,                  -- NFT token ID

  -- Transaction type
  transaction_type TEXT DEFAULT 'sale' CHECK (transaction_type IN ('sale', 'royalty', 'refund')),

  -- Chain info
  chain_id INTEGER,

  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'failed')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_address);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_address);
CREATE INDEX IF NOT EXISTS idx_transactions_creator ON transactions(creator_address);
CREATE INDEX IF NOT EXISTS idx_transactions_asset ON transactions(asset_id);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);

-- =============================================
-- EARNINGS SUMMARY VIEW
-- Aggregated view for quick earnings queries
-- =============================================
CREATE OR REPLACE VIEW earnings_summary AS
SELECT
  seller_address as wallet_address,
  'sale' as earning_type,
  COUNT(*) as transaction_count,
  SUM(seller_amount_display) as total_earned,
  SUM(token_amount) as total_tokens_sold,
  MAX(created_at) as last_transaction
FROM transactions
WHERE status = 'confirmed'
GROUP BY seller_address

UNION ALL

SELECT
  creator_address as wallet_address,
  'royalty' as earning_type,
  COUNT(*) as transaction_count,
  SUM(royalty_amount_display) as total_earned,
  NULL as total_tokens_sold,
  MAX(created_at) as last_transaction
FROM transactions
WHERE status = 'confirmed' AND creator_address IS NOT NULL AND royalty_amount_display > 0
GROUP BY creator_address;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read transactions (public marketplace data)
CREATE POLICY "Transactions are viewable by everyone"
  ON transactions FOR SELECT
  USING (true);

-- Policy: Only service role can insert transactions
-- (transactions are created by backend indexer, not users)
CREATE POLICY "Service role can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE transactions IS 'Records all marketplace transactions for earnings tracking';
COMMENT ON COLUMN transactions.seller_amount IS 'Amount seller receives after platform fee and royalty (92.5%)';
COMMENT ON COLUMN transactions.platform_fee IS 'Platform fee amount (2.5%)';
COMMENT ON COLUMN transactions.royalty_amount IS 'Creator royalty amount (5%)';
COMMENT ON VIEW earnings_summary IS 'Aggregated earnings by wallet address and type';
