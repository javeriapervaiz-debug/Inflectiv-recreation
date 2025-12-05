/**
 * Contract ABIs for Inflectiv
 * These are simplified ABIs containing only the functions we use in the frontend
 */

export const DataNFT_ABI = [
  // Read functions
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function accessTokens(uint256 tokenId) view returns (address)",
  "function getDataset(uint256 tokenId) view returns (tuple(string assetId, string name, string category, address creator, uint256 createdAt, uint256 accessTokenSupply, bool isActive))",
  "function getTokenIdByAssetId(string assetId) view returns (uint256)",
  "function hasAccess(uint256 tokenId, address account) view returns (bool)",
  "function totalDatasets() view returns (uint256)",
  "function royaltyInfo(uint256 tokenId, uint256 salePrice) view returns (address receiver, uint256 royaltyAmount)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",

  // Write functions
  "function mintDataset(address to, string assetId, string name, string category, string metadataURI, uint256 initialAccessSupply) returns (uint256 tokenId, address accessToken)",
  "function mintAccessTokens(uint256 tokenId, address to, uint256 amount)",
  "function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator)",
  "function setDatasetStatus(uint256 tokenId, bool isActive)",

  // Events
  "event DatasetMinted(uint256 indexed tokenId, address indexed creator, string assetId, string name, address accessToken, string metadataURI)",
  "event AccessTokenDeployed(uint256 indexed tokenId, address indexed accessToken, uint256 initialSupply)",
  "event DatasetStatusChanged(uint256 indexed tokenId, bool isActive)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
] as const;

export const AccessToken_ABI = [
  // Read functions
  "function balanceOf(address account) view returns (uint256)",
  "function hasAccess(address account) view returns (bool)",
  "function accessUnits(address account) view returns (uint256)",
  "function remainingAccess(address account) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function datasetTokenId() view returns (uint256)",
  "function dataNFT() view returns (address)",
  "function consumptionBurnsToken() view returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",

  // Write functions
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function burn(uint256 amount)",
  "function consumeAccess(uint256 amount)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event AccessConsumed(address indexed user, uint256 amount, bool burned)",
] as const;

export const Marketplace_ABI = [
  // Read functions
  "function listings(uint256 listingId) view returns (tuple(uint256 listingId, uint256 datasetTokenId, address seller, uint256 pricePerToken, uint256 availableTokens, bool isActive, uint256 createdAt, uint256 totalSold))",
  "function activeListingByDataset(uint256 datasetTokenId) view returns (uint256)",
  "function getSellerListings(address seller) view returns (uint256[])",
  "function getActiveListings(uint256 offset, uint256 limit) view returns (tuple(uint256 listingId, uint256 datasetTokenId, address seller, uint256 pricePerToken, uint256 availableTokens, bool isActive, uint256 createdAt, uint256 totalSold)[])",
  "function getListingByDataset(uint256 datasetTokenId) view returns (tuple(uint256 listingId, uint256 datasetTokenId, address seller, uint256 pricePerToken, uint256 availableTokens, bool isActive, uint256 createdAt, uint256 totalSold))",
  "function calculatePurchase(uint256 listingId, uint256 tokenAmount) view returns (tuple(uint256 listingId, uint256 tokenAmount, uint256 totalPrice, uint256 platformFee, uint256 royaltyAmount, address royaltyReceiver, uint256 sellerProceeds))",
  "function platformFeeBps() view returns (uint256)",
  "function minListingPrice() view returns (uint256)",
  "function dataNFT() view returns (address)",

  // Write functions
  "function createListing(uint256 datasetTokenId, uint256 pricePerToken, uint256 tokenAmount) returns (uint256 listingId)",
  "function purchaseAccess(uint256 listingId, uint256 tokenAmount) payable",
  "function updateListing(uint256 listingId, uint256 newPrice, uint256 additionalTokens)",
  "function cancelListing(uint256 listingId)",

  // Events
  "event ListingCreated(uint256 indexed listingId, uint256 indexed datasetTokenId, address indexed seller, uint256 pricePerToken, uint256 availableTokens)",
  "event ListingUpdated(uint256 indexed listingId, uint256 newPrice, uint256 newAvailableTokens)",
  "event ListingCancelled(uint256 indexed listingId)",
  "event AccessPurchased(uint256 indexed listingId, uint256 indexed datasetTokenId, address indexed buyer, uint256 tokenAmount, uint256 totalPrice, uint256 platformFee, uint256 royaltyAmount)",
] as const;

export const AccessTokenFactory_ABI = [
  "function getDeployedTokens() view returns (address[])",
  "function getAccessToken(uint256 datasetTokenId) view returns (address)",
  "function totalDeployed() view returns (uint256)",
] as const;
