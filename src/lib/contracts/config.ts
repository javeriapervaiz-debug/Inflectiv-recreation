/**
 * Contract configuration for Inflectiv
 * Addresses are loaded from environment variables
 */

export const CHAIN_CONFIG = {
  // Polygon Mainnet
  137: {
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
    currency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  // Polygon Amoy Testnet (Mumbai replacement)
  80002: {
    name: "Polygon Amoy",
    rpcUrl: "https://rpc-amoy.polygon.technology",
    blockExplorer: "https://amoy.polygonscan.com",
    currency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  // Local Hardhat
  31337: {
    name: "Localhost",
    rpcUrl: "http://127.0.0.1:8545",
    blockExplorer: "",
    currency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
  },
} as const;

export type SupportedChainId = keyof typeof CHAIN_CONFIG;

// Contract addresses from environment
export const CONTRACT_ADDRESSES = {
  dataNFT: process.env.NEXT_PUBLIC_DATA_NFT_ADDRESS || "",
  marketplace: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "",
  accessTokenFactory: process.env.NEXT_PUBLIC_ACCESS_TOKEN_FACTORY || "",
} as const;

// Current chain ID
export const CHAIN_ID = parseInt(
  process.env.NEXT_PUBLIC_CHAIN_ID || "80002"
) as SupportedChainId;

// Get current chain config
export const getCurrentChain = () => CHAIN_CONFIG[CHAIN_ID];

// Validate that all required addresses are set
export const validateContractConfig = (): boolean => {
  return !!(
    CONTRACT_ADDRESSES.dataNFT &&
    CONTRACT_ADDRESSES.marketplace &&
    CONTRACT_ADDRESSES.accessTokenFactory
  );
};

// Platform constants
export const PLATFORM_CONFIG = {
  // Default access token supply when minting (100 tokens)
  defaultAccessTokenSupply: "100",
  defaultAccessTokens: 100,
  // Minimum listing price in MATIC
  minListingPrice: "0.001",
  // Platform fee percentage
  platformFeeBps: 250, // 2.5%
  // Default royalty percentage
  defaultRoyaltyBps: 500, // 5%
} as const;
