/**
 * Minting service for DataNFT contracts
 * Handles minting datasets as NFTs with access tokens
 */

import { BrowserProvider, Contract, parseEther } from "ethers";
import { DataNFT_ABI, Marketplace_ABI } from "./abis";
import { CONTRACT_ADDRESSES, PLATFORM_CONFIG } from "./config";

// Minting parameters
export interface MintParams {
  to: string; // Recipient wallet address
  assetId: string; // Supabase asset ID
  name: string; // Dataset name
  category: string; // Dataset category
  metadataURI: string; // IPFS URI or metadata URL
  initialAccessSupply: number; // Number of access tokens to mint (default: 100)
}

// Minting result
export interface MintResult {
  success: boolean;
  transactionHash?: string;
  tokenId?: bigint;
  accessTokenAddress?: string;
  error?: string;
}

// Listing parameters
export interface ListingParams {
  datasetTokenId: number;
  pricePerToken: string; // Price in MATIC (e.g., "0.01")
  tokenAmount: number; // Number of access tokens to list
}

// Listing result
export interface ListingResult {
  success: boolean;
  transactionHash?: string;
  listingId?: bigint;
  error?: string;
}

// Purchase parameters
export interface PurchaseParams {
  listingId: number;
  tokenAmount: number;
  totalPrice: bigint; // Total price in wei
}

// Purchase result
export interface PurchaseResult {
  success: boolean;
  transactionHash?: string;
  tokensReceived?: number;
  blockNumber?: number;
  // Event data for recording transaction
  eventData?: {
    listingId: bigint;
    datasetTokenId: bigint;
    buyer: string;
    seller: string;
    tokenAmount: bigint;
    totalPrice: bigint;
    platformFee: bigint;
    royaltyAmount: bigint;
    pricePerToken: bigint;
  };
  error?: string;
}

/**
 * Get a signer from the Web3Auth provider
 */
export async function getSignerFromProvider(provider: BrowserProvider) {
  return await provider.getSigner();
}

/**
 * Mint a new DataNFT with access tokens
 * This is called after a dataset is saved to Supabase
 */
export async function mintDataset(
  provider: BrowserProvider,
  params: MintParams
): Promise<MintResult> {
  try {
    const signer = await getSignerFromProvider(provider);
    const dataNFT = new Contract(
      CONTRACT_ADDRESSES.dataNFT,
      DataNFT_ABI,
      signer
    );

    // Set default access supply if not provided
    const accessSupply = params.initialAccessSupply || PLATFORM_CONFIG.defaultAccessTokens;

    // Call the mintDataset function on the contract
    const tx = await dataNFT.mintDataset(
      params.to,
      params.assetId,
      params.name,
      params.category,
      params.metadataURI,
      accessSupply
    );

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    // Parse the DatasetMinted event to get tokenId and accessToken address
    const mintEvent = receipt.logs.find(
      (log: { fragment?: { name: string } }) => log.fragment?.name === "DatasetMinted"
    );

    if (!mintEvent) {
      // Fallback: try to get tokenId from contract
      const tokenId = await dataNFT.getTokenIdByAssetId(params.assetId);
      const accessTokenAddress = await dataNFT.accessTokens(tokenId);

      return {
        success: true,
        transactionHash: receipt.hash,
        tokenId,
        accessTokenAddress,
      };
    }

    // Extract from event args
    const [, tokenId, , accessTokenAddress] = mintEvent.args;

    return {
      success: true,
      transactionHash: receipt.hash,
      tokenId,
      accessTokenAddress,
    };
  } catch (error) {
    console.error("Minting error:", error);

    // Handle specific error messages
    let errorMessage = "Failed to mint dataset";

    if (error instanceof Error) {
      if (error.message.includes("user rejected")) {
        errorMessage = "Transaction was rejected by the user";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas fees";
      } else if (error.message.includes("Asset already exists")) {
        errorMessage = "This dataset has already been minted";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Create a marketplace listing for access tokens
 */
export async function createListing(
  provider: BrowserProvider,
  params: ListingParams
): Promise<ListingResult> {
  try {
    const signer = await getSignerFromProvider(provider);
    const marketplace = new Contract(
      CONTRACT_ADDRESSES.marketplace,
      Marketplace_ABI,
      signer
    );

    // Convert price to wei
    const priceInWei = parseEther(params.pricePerToken);

    // Validate minimum price
    if (priceInWei < parseEther(PLATFORM_CONFIG.minListingPrice)) {
      return {
        success: false,
        error: `Minimum listing price is ${PLATFORM_CONFIG.minListingPrice} MATIC`,
      };
    }

    // Create the listing
    const tx = await marketplace.createListing(
      params.datasetTokenId,
      priceInWei,
      params.tokenAmount
    );

    const receipt = await tx.wait();

    // Parse ListingCreated event
    const listingEvent = receipt.logs.find(
      (log: { fragment?: { name: string } }) => log.fragment?.name === "ListingCreated"
    );

    let listingId: bigint | undefined;
    if (listingEvent) {
      listingId = listingEvent.args[0];
    }

    return {
      success: true,
      transactionHash: receipt.hash,
      listingId,
    };
  } catch (error) {
    console.error("Create listing error:", error);

    let errorMessage = "Failed to create listing";

    if (error instanceof Error) {
      if (error.message.includes("user rejected")) {
        errorMessage = "Transaction was rejected by the user";
      } else if (error.message.includes("Not dataset owner")) {
        errorMessage = "You must own this dataset to create a listing";
      } else if (error.message.includes("Listing already exists")) {
        errorMessage = "A listing already exists for this dataset";
      } else if (error.message.includes("Insufficient access tokens")) {
        errorMessage = "Insufficient access tokens to create listing";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Purchase access tokens from a listing
 */
export async function purchaseAccess(
  provider: BrowserProvider,
  params: PurchaseParams
): Promise<PurchaseResult> {
  try {
    const signer = await getSignerFromProvider(provider);
    const buyerAddress = await signer.getAddress();
    const marketplace = new Contract(
      CONTRACT_ADDRESSES.marketplace,
      Marketplace_ABI,
      signer
    );

    // Get listing info before purchase to capture seller address
    const listing = await marketplace.listings(params.listingId);
    const sellerAddress = listing.seller;
    const pricePerToken = listing.pricePerToken;

    // Purchase with payment
    const tx = await marketplace.purchaseAccess(
      params.listingId,
      params.tokenAmount,
      { value: params.totalPrice }
    );

    const receipt = await tx.wait();

    // Parse AccessPurchased event to get transaction details
    // Event: AccessPurchased(listingId, datasetTokenId, buyer, tokenAmount, totalPrice, platformFee, royaltyAmount)
    const purchaseEvent = receipt.logs.find(
      (log: { fragment?: { name: string } }) => log.fragment?.name === "AccessPurchased"
    );

    let eventData: PurchaseResult["eventData"] = undefined;

    if (purchaseEvent && purchaseEvent.args) {
      const [listingId, datasetTokenId, buyer, tokenAmount, totalPrice, platformFee, royaltyAmount] = purchaseEvent.args;
      eventData = {
        listingId,
        datasetTokenId,
        buyer,
        seller: sellerAddress,
        tokenAmount,
        totalPrice,
        platformFee,
        royaltyAmount,
        pricePerToken,
      };
    }

    return {
      success: true,
      transactionHash: receipt.hash,
      tokensReceived: params.tokenAmount,
      blockNumber: receipt.blockNumber,
      eventData,
    };
  } catch (error) {
    console.error("Purchase error:", error);

    let errorMessage = "Failed to purchase access";

    if (error instanceof Error) {
      if (error.message.includes("user rejected")) {
        errorMessage = "Transaction was rejected by the user";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds";
      } else if (error.message.includes("Listing not active")) {
        errorMessage = "This listing is no longer active";
      } else if (error.message.includes("Insufficient available tokens")) {
        errorMessage = "Not enough tokens available in this listing";
      } else if (error.message.includes("Incorrect payment")) {
        errorMessage = "Incorrect payment amount";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Cancel an existing listing
 */
export async function cancelListing(
  provider: BrowserProvider,
  listingId: number
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const signer = await getSignerFromProvider(provider);
    const marketplace = new Contract(
      CONTRACT_ADDRESSES.marketplace,
      Marketplace_ABI,
      signer
    );

    const tx = await marketplace.cancelListing(listingId);
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error("Cancel listing error:", error);

    let errorMessage = "Failed to cancel listing";

    if (error instanceof Error) {
      if (error.message.includes("user rejected")) {
        errorMessage = "Transaction was rejected by the user";
      } else if (error.message.includes("Not the seller")) {
        errorMessage = "Only the seller can cancel this listing";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Update an existing listing
 */
export async function updateListing(
  provider: BrowserProvider,
  listingId: number,
  newPrice: string,
  additionalTokens: number = 0
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const signer = await getSignerFromProvider(provider);
    const marketplace = new Contract(
      CONTRACT_ADDRESSES.marketplace,
      Marketplace_ABI,
      signer
    );

    const priceInWei = parseEther(newPrice);

    const tx = await marketplace.updateListing(
      listingId,
      priceInWei,
      additionalTokens
    );
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error("Update listing error:", error);

    let errorMessage = "Failed to update listing";

    if (error instanceof Error) {
      if (error.message.includes("user rejected")) {
        errorMessage = "Transaction was rejected by the user";
      } else if (error.message.includes("Not the seller")) {
        errorMessage = "Only the seller can update this listing";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Check if a dataset has been minted
 */
export async function isDatasetMinted(assetId: string): Promise<boolean> {
  try {
    const { getReadContracts } = await import("./index");
    const { dataNFT } = getReadContracts();

    const tokenId = await dataNFT.getTokenIdByAssetId(assetId);
    return tokenId > 0n;
  } catch {
    return false;
  }
}

/**
 * Get blockchain token ID for a Supabase asset
 */
export async function getBlockchainTokenId(assetId: string): Promise<bigint | null> {
  try {
    const { getReadContracts } = await import("./index");
    const { dataNFT } = getReadContracts();

    const tokenId = await dataNFT.getTokenIdByAssetId(assetId);
    return tokenId > 0n ? tokenId : null;
  } catch {
    return null;
  }
}

/**
 * Generate a simple metadata URI (placeholder until IPFS integration)
 * In production, this should upload to IPFS and return the URI
 */
export function generateMetadataURI(
  assetId: string,
  name: string,
  description: string,
  category: string
): string {
  // For now, use a data URI or placeholder
  // In production: upload to IPFS and return ipfs://... URI
  const metadata = {
    name,
    description,
    category,
    asset_id: assetId,
    external_url: `https://inflectiv.io/assets/${assetId}`,
    attributes: [
      { trait_type: "Category", value: category },
      { trait_type: "Platform", value: "Inflectiv" },
    ],
  };

  // Base64 encode the metadata for now
  const encoded = Buffer.from(JSON.stringify(metadata)).toString("base64");
  return `data:application/json;base64,${encoded}`;
}

/**
 * Record a purchase transaction in the database for earnings tracking
 * This should be called after a successful purchase
 */
export async function recordTransaction(
  purchaseResult: PurchaseResult,
  creatorAddress?: string,
  chainId?: number
): Promise<{ success: boolean; error?: string }> {
  if (!purchaseResult.eventData || !purchaseResult.transactionHash) {
    return { success: false, error: "Missing transaction data" };
  }

  try {
    const { eventData, transactionHash, blockNumber } = purchaseResult;

    // Calculate seller proceeds (total - platformFee - royalty)
    const sellerProceeds = eventData.totalPrice - eventData.platformFee - eventData.royaltyAmount;

    const response = await fetch("/api/earnings/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionHash,
        blockNumber,
        listingId: eventData.listingId.toString(),
        datasetTokenId: eventData.datasetTokenId.toString(),
        sellerAddress: eventData.seller,
        buyerAddress: eventData.buyer,
        creatorAddress: creatorAddress || eventData.seller, // Default to seller if no creator specified
        tokenAmount: Number(eventData.tokenAmount),
        totalPrice: eventData.totalPrice.toString(),
        platformFee: eventData.platformFee.toString(),
        royaltyAmount: eventData.royaltyAmount.toString(),
        sellerProceeds: sellerProceeds.toString(),
        pricePerToken: eventData.pricePerToken.toString(),
        chainId: chainId || parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "80002"),
      }),
    });

    const data = await response.json();
    return { success: data.success, error: data.error };
  } catch (error) {
    console.error("Failed to record transaction:", error);
    return { success: false, error: "Failed to record transaction" };
  }
}
