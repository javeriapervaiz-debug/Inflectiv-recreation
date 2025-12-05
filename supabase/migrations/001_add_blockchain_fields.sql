-- =============================================
-- MIGRATION: Add blockchain fields to assets
-- Run this in Supabase SQL Editor after the main schema
-- =============================================

-- Add blockchain-related columns to assets table
ALTER TABLE assets
ADD COLUMN IF NOT EXISTS blockchain_token_id TEXT,
ADD COLUMN IF NOT EXISTS access_token_address TEXT,
ADD COLUMN IF NOT EXISTS mint_transaction_hash TEXT,
ADD COLUMN IF NOT EXISTS is_minted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS listing_id TEXT,
ADD COLUMN IF NOT EXISTS listing_price DECIMAL(18, 8),
ADD COLUMN IF NOT EXISTS available_access_tokens INTEGER DEFAULT 0;

-- Index for blockchain lookups
CREATE INDEX IF NOT EXISTS idx_assets_blockchain_token ON assets(blockchain_token_id) WHERE blockchain_token_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assets_minted ON assets(is_minted) WHERE is_minted = TRUE;

-- Comment on new columns
COMMENT ON COLUMN assets.blockchain_token_id IS 'The token ID on the blockchain (from DataNFT contract)';
COMMENT ON COLUMN assets.access_token_address IS 'The address of the ERC-20 AccessToken contract for this dataset';
COMMENT ON COLUMN assets.mint_transaction_hash IS 'The transaction hash of the minting transaction';
COMMENT ON COLUMN assets.is_minted IS 'Whether this asset has been minted as an NFT';
COMMENT ON COLUMN assets.listing_id IS 'The marketplace listing ID if listed';
COMMENT ON COLUMN assets.listing_price IS 'The price per access token in the marketplace listing';
COMMENT ON COLUMN assets.available_access_tokens IS 'Number of access tokens available for sale';
