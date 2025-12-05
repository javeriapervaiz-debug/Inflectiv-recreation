// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AccessToken.sol";
import "./IAccessTokenFactory.sol";

/**
 * @title AccessTokenFactory
 * @notice Factory contract for deploying AccessToken contracts
 * @dev Uses standard deployment (not minimal proxy) for simplicity
 *      Could be upgraded to use ERC1167 clones for gas optimization
 */
contract AccessTokenFactory is IAccessTokenFactory, Ownable {

    // ============ State Variables ============

    /// @notice Array of all deployed AccessToken addresses
    address[] public deployedTokens;

    /// @notice Mapping from dataset token ID to AccessToken address
    mapping(uint256 => address) public tokensByDataset;

    /// @notice Authorized deployers (DataNFT contracts)
    mapping(address => bool) public authorizedDeployers;

    // ============ Events ============

    event AccessTokenDeployed(
        address indexed accessToken,
        uint256 indexed datasetTokenId,
        address indexed dataNFT,
        string name,
        string symbol
    );

    event DeployerAuthorizationChanged(
        address indexed deployer,
        bool authorized
    );

    // ============ Errors ============

    error NotAuthorized();
    error TokenAlreadyExists();

    // ============ Constructor ============

    constructor() Ownable(msg.sender) {}

    // ============ External Functions ============

    /**
     * @notice Deploy a new AccessToken contract
     * @param name Token name
     * @param symbol Token symbol
     * @param datasetTokenId The DataNFT token ID
     * @param dataNFT The DataNFT contract address
     * @return accessToken The deployed AccessToken address
     */
    function deployAccessToken(
        string memory name,
        string memory symbol,
        uint256 datasetTokenId,
        address dataNFT
    ) external override returns (address accessToken) {
        if (!authorizedDeployers[msg.sender] && msg.sender != owner()) {
            revert NotAuthorized();
        }

        if (tokensByDataset[datasetTokenId] != address(0)) {
            revert TokenAlreadyExists();
        }

        // Deploy new AccessToken
        AccessToken token = new AccessToken(
            name,
            symbol,
            datasetTokenId,
            dataNFT
        );

        accessToken = address(token);

        // Store references
        deployedTokens.push(accessToken);
        tokensByDataset[datasetTokenId] = accessToken;

        emit AccessTokenDeployed(
            accessToken,
            datasetTokenId,
            dataNFT,
            name,
            symbol
        );

        return accessToken;
    }

    /**
     * @notice Authorize a deployer (DataNFT contract)
     * @param deployer Address to authorize
     * @param authorized Whether to authorize or revoke
     */
    function setDeployerAuthorization(
        address deployer,
        bool authorized
    ) external onlyOwner {
        authorizedDeployers[deployer] = authorized;
        emit DeployerAuthorizationChanged(deployer, authorized);
    }

    // ============ View Functions ============

    /**
     * @notice Get all deployed AccessToken addresses
     */
    function getDeployedTokens() external view override returns (address[] memory) {
        return deployedTokens;
    }

    /**
     * @notice Get AccessToken address by dataset token ID
     */
    function getAccessToken(uint256 datasetTokenId) external view override returns (address) {
        return tokensByDataset[datasetTokenId];
    }

    /**
     * @notice Get the total number of deployed tokens
     */
    function totalDeployed() external view returns (uint256) {
        return deployedTokens.length;
    }
}
