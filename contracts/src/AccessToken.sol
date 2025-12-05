// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AccessToken
 * @notice ERC-20 token representing access rights to a specific dataset
 * @dev Each DataNFT has its own AccessToken contract
 *
 * Key features:
 * - 1.0 token = 1 access/consumption right
 * - Burnable (for consumption-based access)
 * - Tradeable on DEXes
 * - Only the DataNFT contract can mint new tokens
 */
contract AccessToken is ERC20, ERC20Burnable, Ownable {

    // ============ State Variables ============

    /// @notice The DataNFT token ID this access token is associated with
    uint256 public immutable datasetTokenId;

    /// @notice The DataNFT contract address
    address public immutable dataNFT;

    /// @notice Whether consumption burns tokens (vs just checking balance)
    bool public consumptionBurnsToken;

    /// @notice Mapping to track consumed access (for non-burn consumption)
    mapping(address => uint256) public consumedAccess;

    // ============ Events ============

    event AccessConsumed(
        address indexed user,
        uint256 amount,
        bool burned
    );

    event ConsumptionModeChanged(bool burnsToken);

    // ============ Errors ============

    error OnlyDataNFT();
    error InsufficientAccess();

    // ============ Modifiers ============

    modifier onlyDataNFT() {
        if (msg.sender != dataNFT) revert OnlyDataNFT();
        _;
    }

    // ============ Constructor ============

    /**
     * @param name Token name (e.g., "Access: Dataset Name")
     * @param symbol Token symbol (e.g., "ACC-1")
     * @param _datasetTokenId The DataNFT token ID
     * @param _dataNFT The DataNFT contract address
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 _datasetTokenId,
        address _dataNFT
    ) ERC20(name, symbol) Ownable(_dataNFT) {
        datasetTokenId = _datasetTokenId;
        dataNFT = _dataNFT;
        consumptionBurnsToken = false; // Default: balance check only
    }

    // ============ External Functions ============

    /**
     * @notice Mint new access tokens
     * @dev Can only be called by the DataNFT contract
     * @param to Address to mint tokens to
     * @param amount Amount to mint (in wei, 1 ether = 1 access)
     */
    function mint(address to, uint256 amount) external onlyDataNFT {
        _mint(to, amount);
    }

    /**
     * @notice Consume access to the dataset
     * @dev Burns tokens if consumptionBurnsToken is true, otherwise just tracks
     * @param amount Amount of access to consume (typically 1 ether for 1 access)
     */
    function consumeAccess(uint256 amount) external {
        if (balanceOf(msg.sender) < amount) revert InsufficientAccess();

        if (consumptionBurnsToken) {
            _burn(msg.sender, amount);
        } else {
            consumedAccess[msg.sender] += amount;
        }

        emit AccessConsumed(msg.sender, amount, consumptionBurnsToken);
    }

    /**
     * @notice Set whether consuming access burns tokens
     * @param burns True to burn tokens on consumption
     */
    function setConsumptionBurnsToken(bool burns) external onlyDataNFT {
        consumptionBurnsToken = burns;
        emit ConsumptionModeChanged(burns);
    }

    // ============ View Functions ============

    /**
     * @notice Check if an address has access
     * @param account Address to check
     * @return True if balance >= 1 token
     */
    function hasAccess(address account) external view returns (bool) {
        return balanceOf(account) >= 1 ether;
    }

    /**
     * @notice Get the number of access units an address has
     * @param account Address to check
     * @return Number of access units (balance / 1 ether)
     */
    function accessUnits(address account) external view returns (uint256) {
        return balanceOf(account) / 1 ether;
    }

    /**
     * @notice Get remaining unconsumed access for an account
     * @dev Only relevant when consumptionBurnsToken is false
     */
    function remainingAccess(address account) external view returns (uint256) {
        uint256 balance = balanceOf(account);
        uint256 consumed = consumedAccess[account];

        if (balance <= consumed) return 0;
        return balance - consumed;
    }
}
