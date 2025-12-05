// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./DataNFT.sol";
import "./AccessToken.sol";

/**
 * @title Marketplace
 * @notice Marketplace for buying/selling access to tokenized datasets
 * @dev Handles listings, purchases, and royalty distribution
 *
 * Key features:
 * - List access tokens for sale (fixed price)
 * - Purchase access tokens with native currency (MATIC)
 * - Automatic royalty distribution to creators (EIP-2981)
 * - Platform fee collection
 * - Bulk purchases
 */
contract Marketplace is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ State Variables ============

    /// @notice The DataNFT contract
    DataNFT public dataNFT;

    /// @notice Platform fee in basis points (250 = 2.5%)
    uint256 public platformFeeBps = 250;

    /// @notice Address to receive platform fees
    address public feeRecipient;

    /// @notice Minimum listing price
    uint256 public minListingPrice = 0.001 ether;

    /// @notice Counter for listing IDs
    uint256 private _nextListingId;

    /// @notice Mapping from listing ID to Listing
    mapping(uint256 => Listing) public listings;

    /// @notice Mapping from dataset token ID to active listing ID
    mapping(uint256 => uint256) public activeListingByDataset;

    /// @notice Mapping from seller to their listing IDs
    mapping(address => uint256[]) public sellerListings;

    // ============ Structs ============

    struct Listing {
        uint256 listingId;
        uint256 datasetTokenId;      // DataNFT token ID
        address seller;               // Who listed the access tokens
        uint256 pricePerToken;        // Price per 1 access token (in wei)
        uint256 availableTokens;      // How many access tokens available
        bool isActive;                // Whether listing is active
        uint256 createdAt;
        uint256 totalSold;            // Track total tokens sold
    }

    struct PurchaseInfo {
        uint256 listingId;
        uint256 tokenAmount;
        uint256 totalPrice;
        uint256 platformFee;
        uint256 royaltyAmount;
        address royaltyReceiver;
        uint256 sellerProceeds;
    }

    // ============ Events ============

    event ListingCreated(
        uint256 indexed listingId,
        uint256 indexed datasetTokenId,
        address indexed seller,
        uint256 pricePerToken,
        uint256 availableTokens
    );

    event ListingUpdated(
        uint256 indexed listingId,
        uint256 newPrice,
        uint256 newAvailableTokens
    );

    event ListingCancelled(uint256 indexed listingId);

    event AccessPurchased(
        uint256 indexed listingId,
        uint256 indexed datasetTokenId,
        address indexed buyer,
        uint256 tokenAmount,
        uint256 totalPrice,
        uint256 platformFee,
        uint256 royaltyAmount
    );

    event PlatformFeeUpdated(uint256 newFeeBps);
    event FeeRecipientUpdated(address newRecipient);
    event MinListingPriceUpdated(uint256 newMinPrice);

    // ============ Errors ============

    error InvalidDataNFT();
    error InvalidPrice();
    error InvalidAmount();
    error ListingNotActive();
    error NotSeller();
    error InsufficientTokens();
    error InsufficientPayment();
    error TransferFailed();
    error NotDatasetOwner();
    error ListingAlreadyExists();

    // ============ Constructor ============

    constructor(
        address _dataNFT,
        address _feeRecipient
    ) Ownable(msg.sender) {
        if (_dataNFT == address(0)) revert InvalidDataNFT();

        dataNFT = DataNFT(_dataNFT);
        feeRecipient = _feeRecipient != address(0) ? _feeRecipient : msg.sender;
    }

    // ============ External Functions ============

    /**
     * @notice Create a new listing for access tokens
     * @param datasetTokenId The DataNFT token ID
     * @param pricePerToken Price per 1 access token (in wei)
     * @param tokenAmount Number of access tokens to list
     * @return listingId The created listing ID
     */
    function createListing(
        uint256 datasetTokenId,
        uint256 pricePerToken,
        uint256 tokenAmount
    ) external nonReentrant returns (uint256 listingId) {
        // Verify caller owns the DataNFT
        if (dataNFT.ownerOf(datasetTokenId) != msg.sender) {
            revert NotDatasetOwner();
        }

        if (pricePerToken < minListingPrice) revert InvalidPrice();
        if (tokenAmount == 0) revert InvalidAmount();

        // Check if there's already an active listing
        uint256 existingListingId = activeListingByDataset[datasetTokenId];
        if (existingListingId != 0 && listings[existingListingId].isActive) {
            revert ListingAlreadyExists();
        }

        // Get the access token and verify seller has enough
        address accessTokenAddr = dataNFT.accessTokens(datasetTokenId);
        AccessToken accessToken = AccessToken(accessTokenAddr);

        if (accessToken.balanceOf(msg.sender) < tokenAmount * 1 ether) {
            revert InsufficientTokens();
        }

        // Create listing
        listingId = ++_nextListingId;

        listings[listingId] = Listing({
            listingId: listingId,
            datasetTokenId: datasetTokenId,
            seller: msg.sender,
            pricePerToken: pricePerToken,
            availableTokens: tokenAmount,
            isActive: true,
            createdAt: block.timestamp,
            totalSold: 0
        });

        activeListingByDataset[datasetTokenId] = listingId;
        sellerListings[msg.sender].push(listingId);

        emit ListingCreated(
            listingId,
            datasetTokenId,
            msg.sender,
            pricePerToken,
            tokenAmount
        );

        return listingId;
    }

    /**
     * @notice Purchase access tokens from a listing
     * @param listingId The listing ID
     * @param tokenAmount Number of access tokens to purchase
     */
    function purchaseAccess(
        uint256 listingId,
        uint256 tokenAmount
    ) external payable nonReentrant {
        Listing storage listing = listings[listingId];

        if (!listing.isActive) revert ListingNotActive();
        if (tokenAmount == 0) revert InvalidAmount();
        if (listing.availableTokens < tokenAmount) revert InsufficientTokens();

        // Calculate costs
        PurchaseInfo memory info = _calculatePurchase(listingId, tokenAmount);

        if (msg.value < info.totalPrice) revert InsufficientPayment();

        // Update listing
        listing.availableTokens -= tokenAmount;
        listing.totalSold += tokenAmount;

        if (listing.availableTokens == 0) {
            listing.isActive = false;
        }

        // Transfer access tokens from seller to buyer
        address accessTokenAddr = dataNFT.accessTokens(listing.datasetTokenId);
        AccessToken accessToken = AccessToken(accessTokenAddr);

        // Seller must have approved this contract
        accessToken.transferFrom(
            listing.seller,
            msg.sender,
            tokenAmount * 1 ether
        );

        // Distribute payments
        _distributePayments(info);

        // Refund excess payment
        if (msg.value > info.totalPrice) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - info.totalPrice}("");
            if (!refundSuccess) revert TransferFailed();
        }

        emit AccessPurchased(
            listingId,
            listing.datasetTokenId,
            msg.sender,
            tokenAmount,
            info.totalPrice,
            info.platformFee,
            info.royaltyAmount
        );
    }

    /**
     * @notice Update an existing listing
     * @param listingId The listing ID
     * @param newPrice New price per token (0 to keep current)
     * @param additionalTokens Additional tokens to add to listing
     */
    function updateListing(
        uint256 listingId,
        uint256 newPrice,
        uint256 additionalTokens
    ) external {
        Listing storage listing = listings[listingId];

        if (listing.seller != msg.sender) revert NotSeller();
        if (!listing.isActive) revert ListingNotActive();

        if (newPrice > 0) {
            if (newPrice < minListingPrice) revert InvalidPrice();
            listing.pricePerToken = newPrice;
        }

        if (additionalTokens > 0) {
            // Verify seller has enough tokens
            address accessTokenAddr = dataNFT.accessTokens(listing.datasetTokenId);
            AccessToken accessToken = AccessToken(accessTokenAddr);

            if (accessToken.balanceOf(msg.sender) < (listing.availableTokens + additionalTokens) * 1 ether) {
                revert InsufficientTokens();
            }

            listing.availableTokens += additionalTokens;
        }

        emit ListingUpdated(
            listingId,
            listing.pricePerToken,
            listing.availableTokens
        );
    }

    /**
     * @notice Cancel a listing
     * @param listingId The listing ID
     */
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];

        if (listing.seller != msg.sender) revert NotSeller();
        if (!listing.isActive) revert ListingNotActive();

        listing.isActive = false;
        activeListingByDataset[listing.datasetTokenId] = 0;

        emit ListingCancelled(listingId);
    }

    // ============ Admin Functions ============

    /**
     * @notice Update the DataNFT contract address
     */
    function setDataNFT(address _dataNFT) external onlyOwner {
        if (_dataNFT == address(0)) revert InvalidDataNFT();
        dataNFT = DataNFT(_dataNFT);
    }

    /**
     * @notice Update platform fee
     * @param newFeeBps New fee in basis points (max 1000 = 10%)
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee too high"); // Max 10%
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
    }

    /**
     * @notice Update fee recipient
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    /**
     * @notice Update minimum listing price
     */
    function setMinListingPrice(uint256 newMinPrice) external onlyOwner {
        minListingPrice = newMinPrice;
        emit MinListingPriceUpdated(newMinPrice);
    }

    // ============ View Functions ============

    /**
     * @notice Get purchase calculation details
     */
    function calculatePurchase(
        uint256 listingId,
        uint256 tokenAmount
    ) external view returns (PurchaseInfo memory) {
        return _calculatePurchase(listingId, tokenAmount);
    }

    /**
     * @notice Get all listings by a seller
     */
    function getSellerListings(address seller) external view returns (uint256[] memory) {
        return sellerListings[seller];
    }

    /**
     * @notice Get active listings (paginated)
     */
    function getActiveListings(
        uint256 offset,
        uint256 limit
    ) external view returns (Listing[] memory) {
        uint256 count = 0;
        uint256 total = _nextListingId;

        // Count active listings
        for (uint256 i = 1; i <= total; i++) {
            if (listings[i].isActive) count++;
        }

        // Adjust limit
        if (offset >= count) {
            return new Listing[](0);
        }

        uint256 remaining = count - offset;
        uint256 resultSize = remaining < limit ? remaining : limit;
        Listing[] memory result = new Listing[](resultSize);

        uint256 found = 0;
        uint256 skipped = 0;

        for (uint256 i = 1; i <= total && found < resultSize; i++) {
            if (listings[i].isActive) {
                if (skipped < offset) {
                    skipped++;
                } else {
                    result[found] = listings[i];
                    found++;
                }
            }
        }

        return result;
    }

    /**
     * @notice Get listing by dataset token ID
     */
    function getListingByDataset(uint256 datasetTokenId) external view returns (Listing memory) {
        uint256 listingId = activeListingByDataset[datasetTokenId];
        return listings[listingId];
    }

    // ============ Internal Functions ============

    function _calculatePurchase(
        uint256 listingId,
        uint256 tokenAmount
    ) internal view returns (PurchaseInfo memory info) {
        Listing storage listing = listings[listingId];

        info.listingId = listingId;
        info.tokenAmount = tokenAmount;
        info.totalPrice = listing.pricePerToken * tokenAmount;

        // Calculate platform fee
        info.platformFee = (info.totalPrice * platformFeeBps) / 10000;

        // Get royalty info from DataNFT (EIP-2981)
        (address royaltyReceiver, uint256 royaltyAmount) = dataNFT.royaltyInfo(
            listing.datasetTokenId,
            info.totalPrice
        );

        info.royaltyReceiver = royaltyReceiver;
        info.royaltyAmount = royaltyAmount;

        // Seller gets remainder after platform fee and royalty
        info.sellerProceeds = info.totalPrice - info.platformFee - info.royaltyAmount;

        return info;
    }

    function _distributePayments(PurchaseInfo memory info) internal {
        Listing storage listing = listings[info.listingId];

        // Pay platform fee
        if (info.platformFee > 0 && feeRecipient != address(0)) {
            (bool feeSuccess, ) = feeRecipient.call{value: info.platformFee}("");
            if (!feeSuccess) revert TransferFailed();
        }

        // Pay royalty to creator
        if (info.royaltyAmount > 0 && info.royaltyReceiver != address(0)) {
            (bool royaltySuccess, ) = info.royaltyReceiver.call{value: info.royaltyAmount}("");
            if (!royaltySuccess) revert TransferFailed();
        }

        // Pay seller
        if (info.sellerProceeds > 0) {
            (bool sellerSuccess, ) = listing.seller.call{value: info.sellerProceeds}("");
            if (!sellerSuccess) revert TransferFailed();
        }
    }
}
