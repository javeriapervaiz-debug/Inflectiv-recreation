// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./AccessToken.sol";
import "./IAccessTokenFactory.sol";

/**
 * @title DataNFT
 * @notice ERC-721 NFT representing ownership of a tokenized dataset
 * @dev Implements ERC-2981 for royalties, deploys AccessToken for each dataset
 *
 * Key features:
 * - Each NFT represents ownership of a unique dataset
 * - Automatic AccessToken deployment for access control
 * - Built-in royalty support (EIP-2981)
 * - Metadata stored on IPFS, linked via tokenURI
 */
contract DataNFT is ERC721, ERC721URIStorage, ERC721Enumerable, ERC2981, Ownable, ReentrancyGuard {

    // ============ State Variables ============

    /// @notice Counter for token IDs
    uint256 private _nextTokenId;

    /// @notice Factory contract for deploying AccessTokens
    IAccessTokenFactory public accessTokenFactory;

    /// @notice Default royalty percentage in basis points (500 = 5%)
    uint96 public defaultRoyaltyBps = 500;

    /// @notice Mapping from token ID to AccessToken contract address
    mapping(uint256 => address) public accessTokens;

    /// @notice Mapping from token ID to dataset metadata
    mapping(uint256 => DatasetInfo) public datasets;

    /// @notice Mapping from Inflectiv asset ID to token ID
    mapping(string => uint256) public assetIdToTokenId;

    // ============ Structs ============

    struct DatasetInfo {
        string assetId;           // Inflectiv platform asset UUID
        string name;              // Dataset name
        string category;          // Dataset category
        address creator;          // Original creator address
        uint256 createdAt;        // Timestamp of creation
        uint256 accessTokenSupply; // Total access tokens minted
        bool isActive;            // Whether dataset is active
    }

    // ============ Events ============

    event DatasetMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string assetId,
        string name,
        address accessToken,
        string metadataURI
    );

    event AccessTokenDeployed(
        uint256 indexed tokenId,
        address indexed accessToken,
        uint256 initialSupply
    );

    event DatasetStatusChanged(
        uint256 indexed tokenId,
        bool isActive
    );

    event RoyaltyUpdated(
        uint256 indexed tokenId,
        address receiver,
        uint96 feeNumerator
    );

    // ============ Errors ============

    error InvalidFactory();
    error AssetAlreadyMinted();
    error InvalidTokenId();
    error NotTokenOwner();
    error EmptyAssetId();
    error EmptyMetadataURI();

    // ============ Constructor ============

    constructor(
        address _accessTokenFactory
    ) ERC721("Inflectiv Data NFT", "IDATA") Ownable(msg.sender) {
        if (_accessTokenFactory == address(0)) revert InvalidFactory();
        accessTokenFactory = IAccessTokenFactory(_accessTokenFactory);
    }

    // ============ External Functions ============

    /**
     * @notice Mint a new DataNFT for a dataset
     * @param to Address to mint the NFT to
     * @param assetId Inflectiv platform asset UUID
     * @param name Dataset name
     * @param category Dataset category
     * @param metadataURI IPFS URI for the dataset metadata
     * @param initialAccessSupply Initial supply of access tokens to mint
     * @return tokenId The minted token ID
     * @return accessToken The deployed AccessToken contract address
     */
    function mintDataset(
        address to,
        string calldata assetId,
        string calldata name,
        string calldata category,
        string calldata metadataURI,
        uint256 initialAccessSupply
    ) external nonReentrant returns (uint256 tokenId, address accessToken) {
        if (bytes(assetId).length == 0) revert EmptyAssetId();
        if (bytes(metadataURI).length == 0) revert EmptyMetadataURI();
        if (assetIdToTokenId[assetId] != 0) revert AssetAlreadyMinted();

        // Mint the NFT
        tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Set default royalty for this token (creator receives royalties)
        _setTokenRoyalty(tokenId, to, defaultRoyaltyBps);

        // Deploy AccessToken for this dataset
        string memory accessTokenName = string(abi.encodePacked("Access: ", name));
        string memory accessTokenSymbol = string(abi.encodePacked("ACC-", _toString(tokenId)));

        accessToken = accessTokenFactory.deployAccessToken(
            accessTokenName,
            accessTokenSymbol,
            tokenId,
            address(this)
        );

        // Mint initial access token supply to the dataset owner
        if (initialAccessSupply > 0) {
            AccessToken(accessToken).mint(to, initialAccessSupply);
        }

        // Store mappings and info
        accessTokens[tokenId] = accessToken;
        assetIdToTokenId[assetId] = tokenId;

        datasets[tokenId] = DatasetInfo({
            assetId: assetId,
            name: name,
            category: category,
            creator: to,
            createdAt: block.timestamp,
            accessTokenSupply: initialAccessSupply,
            isActive: true
        });

        emit DatasetMinted(tokenId, to, assetId, name, accessToken, metadataURI);
        emit AccessTokenDeployed(tokenId, accessToken, initialAccessSupply);

        return (tokenId, accessToken);
    }

    /**
     * @notice Mint additional access tokens for a dataset
     * @param tokenId The DataNFT token ID
     * @param to Address to mint tokens to
     * @param amount Amount of access tokens to mint
     */
    function mintAccessTokens(
        uint256 tokenId,
        address to,
        uint256 amount
    ) external {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();

        address accessToken = accessTokens[tokenId];
        AccessToken(accessToken).mint(to, amount);

        datasets[tokenId].accessTokenSupply += amount;
    }

    /**
     * @notice Update the royalty for a specific token
     * @param tokenId The token ID
     * @param receiver Address to receive royalties
     * @param feeNumerator Royalty fee in basis points
     */
    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    ) external {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();

        _setTokenRoyalty(tokenId, receiver, feeNumerator);

        emit RoyaltyUpdated(tokenId, receiver, feeNumerator);
    }

    /**
     * @notice Toggle dataset active status
     * @param tokenId The token ID
     * @param isActive New active status
     */
    function setDatasetStatus(uint256 tokenId, bool isActive) external {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();

        datasets[tokenId].isActive = isActive;

        emit DatasetStatusChanged(tokenId, isActive);
    }

    /**
     * @notice Update the default royalty percentage for new mints
     * @param newRoyaltyBps New royalty in basis points
     */
    function setDefaultRoyalty(uint96 newRoyaltyBps) external onlyOwner {
        defaultRoyaltyBps = newRoyaltyBps;
    }

    /**
     * @notice Update the AccessToken factory
     * @param newFactory New factory address
     */
    function setAccessTokenFactory(address newFactory) external onlyOwner {
        if (newFactory == address(0)) revert InvalidFactory();
        accessTokenFactory = IAccessTokenFactory(newFactory);
    }

    // ============ View Functions ============

    /**
     * @notice Get dataset info by token ID
     */
    function getDataset(uint256 tokenId) external view returns (DatasetInfo memory) {
        if (tokenId == 0 || tokenId > _nextTokenId) revert InvalidTokenId();
        return datasets[tokenId];
    }

    /**
     * @notice Get token ID by Inflectiv asset ID
     */
    function getTokenIdByAssetId(string calldata assetId) external view returns (uint256) {
        return assetIdToTokenId[assetId];
    }

    /**
     * @notice Check if an address has access to a dataset
     * @param tokenId The DataNFT token ID
     * @param account Address to check
     * @return hasAccess True if the account has at least 1 access token
     */
    function hasAccess(uint256 tokenId, address account) external view returns (bool) {
        address accessToken = accessTokens[tokenId];
        if (accessToken == address(0)) return false;

        return AccessToken(accessToken).balanceOf(account) >= 1 ether;
    }

    /**
     * @notice Get the total number of datasets minted
     */
    function totalDatasets() external view returns (uint256) {
        return _nextTokenId;
    }

    // ============ Internal Functions ============

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";

        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(buffer);
    }

    // ============ Required Overrides ============

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
