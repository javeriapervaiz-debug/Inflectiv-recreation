/**
 * Contract utilities for Inflectiv
 * Provides typed contract instances and helper functions
 *
 * Set USE_MOCK_DATA=true in env for demo data
 */

import { BrowserProvider, Contract, JsonRpcProvider, formatEther, parseEther } from "ethers";
import {
  DataNFT_ABI,
  AccessToken_ABI,
  Marketplace_ABI,
  AccessTokenFactory_ABI,
} from "./abis";
import {
  CONTRACT_ADDRESSES,
  CHAIN_ID,
  CHAIN_CONFIG,
  PLATFORM_CONFIG,
  getCurrentChain,
  validateContractConfig,
} from "./config";
import { isMockModeEnabled, MOCK_ASSETS } from "@/lib/mock/earnings";

// Re-export everything
export * from "./abis";
export * from "./config";
export * from "./minting";

// Types
export interface DatasetInfo {
  assetId: string;
  name: string;
  category: string;
  creator: string;
  createdAt: bigint;
  accessTokenSupply: bigint;
  isActive: boolean;
}

export interface Listing {
  listingId: bigint;
  datasetTokenId: bigint;
  seller: string;
  pricePerToken: bigint;
  availableTokens: bigint;
  isActive: boolean;
  createdAt: bigint;
  totalSold: bigint;
}

export interface PurchaseInfo {
  listingId: bigint;
  tokenAmount: bigint;
  totalPrice: bigint;
  platformFee: bigint;
  royaltyAmount: bigint;
  royaltyReceiver: string;
  sellerProceeds: bigint;
}

/**
 * Get a read-only provider for the current chain
 */
export function getReadProvider(): JsonRpcProvider {
  const chain = getCurrentChain();
  return new JsonRpcProvider(chain.rpcUrl);
}

/**
 * Get a provider from the user's wallet
 */
export async function getWalletProvider(): Promise<BrowserProvider | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }
  return new BrowserProvider(window.ethereum);
}

/**
 * Get contract instances for reading
 */
export function getReadContracts() {
  const provider = getReadProvider();

  return {
    dataNFT: new Contract(CONTRACT_ADDRESSES.dataNFT, DataNFT_ABI, provider),
    marketplace: new Contract(CONTRACT_ADDRESSES.marketplace, Marketplace_ABI, provider),
    accessTokenFactory: new Contract(
      CONTRACT_ADDRESSES.accessTokenFactory,
      AccessTokenFactory_ABI,
      provider
    ),
  };
}

/**
 * Get contract instances for writing (requires signer)
 */
export async function getWriteContracts(provider: BrowserProvider) {
  const signer = await provider.getSigner();

  return {
    dataNFT: new Contract(CONTRACT_ADDRESSES.dataNFT, DataNFT_ABI, signer),
    marketplace: new Contract(CONTRACT_ADDRESSES.marketplace, Marketplace_ABI, signer),
  };
}

/**
 * Get an AccessToken contract instance
 */
export function getAccessToken(address: string, providerOrSigner: any) {
  return new Contract(address, AccessToken_ABI, providerOrSigner);
}

// ============ Helper Functions ============

/**
 * Check if a user has access to a dataset
 */
export async function checkDatasetAccess(
  tokenId: number,
  userAddress: string
): Promise<boolean> {
  const { dataNFT } = getReadContracts();
  return await dataNFT.hasAccess(tokenId, userAddress);
}

/**
 * Get dataset info by token ID
 */
export async function getDatasetInfo(tokenId: number): Promise<DatasetInfo> {
  const { dataNFT } = getReadContracts();
  return await dataNFT.getDataset(tokenId);
}

/**
 * Get token ID by Inflectiv asset ID
 */
export async function getTokenIdByAssetId(assetId: string): Promise<bigint> {
  const { dataNFT } = getReadContracts();
  return await dataNFT.getTokenIdByAssetId(assetId);
}

/**
 * Get active marketplace listings
 */
export async function getActiveListings(
  offset: number = 0,
  limit: number = 20
): Promise<Listing[]> {
  // Return mock data if enabled (for demos)
  if (isMockModeEnabled()) {
    const mockListings: Listing[] = MOCK_ASSETS.map((asset, index) => ({
      listingId: BigInt(index + 1),
      datasetTokenId: BigInt(asset.blockchainTokenId),
      seller: "0xDEMO000000000000000000000000000000000001",
      pricePerToken: BigInt(Math.floor([0.5, 1.5, 1.0, 0.75, 2.0][index] * 1e18)),
      availableTokens: BigInt([70, 86, 90, 90, 95][index]),
      isActive: true,
      createdAt: BigInt(Math.floor(Date.now() / 1000) - (30 - index) * 24 * 60 * 60),
      totalSold: BigInt([30, 14, 10, 10, 5][index]),
    }));

    return mockListings.slice(offset, offset + limit);
  }

  const { marketplace } = getReadContracts();
  return await marketplace.getActiveListings(offset, limit);
}

/**
 * Get listing by dataset
 */
export async function getListingByDataset(datasetTokenId: number): Promise<Listing> {
  const { marketplace } = getReadContracts();
  return await marketplace.getListingByDataset(datasetTokenId);
}

/**
 * Calculate purchase details
 */
export async function calculatePurchase(
  listingId: number,
  tokenAmount: number
): Promise<PurchaseInfo> {
  const { marketplace } = getReadContracts();
  return await marketplace.calculatePurchase(listingId, tokenAmount);
}

/**
 * Get user's access token balance for a dataset
 */
export async function getAccessBalance(
  tokenId: number,
  userAddress: string
): Promise<{ balance: bigint; hasAccess: boolean; accessUnits: bigint }> {
  const { dataNFT } = getReadContracts();
  const accessTokenAddress = await dataNFT.accessTokens(tokenId);

  if (accessTokenAddress === "0x0000000000000000000000000000000000000000") {
    return { balance: 0n, hasAccess: false, accessUnits: 0n };
  }

  const provider = getReadProvider();
  const accessToken = getAccessToken(accessTokenAddress, provider);

  const balance = await accessToken.balanceOf(userAddress);
  const hasAccess = await accessToken.hasAccess(userAddress);
  const accessUnits = await accessToken.accessUnits(userAddress);

  return { balance, hasAccess, accessUnits };
}

/**
 * Format price from wei to display string
 */
export function formatPrice(wei: bigint): string {
  return formatEther(wei);
}

/**
 * Parse price from string to wei
 */
export function parsePrice(price: string): bigint {
  return parseEther(price);
}

/**
 * Get explorer URL for a transaction or address
 */
export function getExplorerUrl(hashOrAddress: string, type: "tx" | "address" = "tx"): string {
  const chain = getCurrentChain();
  if (!chain.blockExplorer) return "";
  return `${chain.blockExplorer}/${type}/${hashOrAddress}`;
}
