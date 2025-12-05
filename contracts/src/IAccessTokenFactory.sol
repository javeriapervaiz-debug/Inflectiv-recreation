// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IAccessTokenFactory
 * @notice Interface for the AccessToken factory contract
 */
interface IAccessTokenFactory {
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
    ) external returns (address accessToken);

    /**
     * @notice Get all AccessTokens deployed by this factory
     */
    function getDeployedTokens() external view returns (address[] memory);

    /**
     * @notice Get AccessToken address by dataset token ID
     */
    function getAccessToken(uint256 datasetTokenId) external view returns (address);
}
