// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Endoweth - an ERC-20 endowment contract that distributes tokens based on expected returns
 * @author @actuallymentor aka mentor.eth
 * @notice This contract is in beta and unaudited. Use at your own risk.
 */
contract Endoweth is Ownable {

    // Endowee is the address that receives the distributed tokens
    address public endowee;

    // Interval for distribution in seconds
    uint256 public distributionInterval;

    /**
     * @dev Constructor to set the endowee and distribution interval
     * @param _owner The address that deploys the contract
     * @param _endowee The address that receives the distributed tokens
     * @param _distributionInterval Interval for distribution in seconds
     * @notice The endowee cannot be the zero address
     * @notice The distribution interval cannot be zero
     */
    constructor(address _owner, address _endowee, uint256 _distributionInterval) Ownable( _owner ) {
        require(_endowee != address(0), "Endowee cannot be the zero address");
        require(_distributionInterval > 0, "Interval must be greater than zero");
        endowee = _endowee;
        distributionInterval = _distributionInterval;
        _notEntered = true;
    }

    /* ///////////////////////
    // 👮‍♂️ security section
    /////////////////////// */

    // Reentrancy guard
    bool private _notEntered;
    modifier noReentrancy() {
        require(_notEntered, "Reentrant call");
        _notEntered = false;
        _;
        _notEntered = true;
    }

    /* ///////////////////////
    // 👩‍🦳 Accountant section
    /////////////////////// */

    // Permission modifier for owner or accountants
    modifier onlyOwnerOrAccountant() {
        require(owner() == _msgSender() || accountants[_msgSender()], "Not authorized");
        _;
    }

    // Keep track of accountants in both mapping (for quick lookup) and array (for iteration)
    mapping(address => bool) public accountants;
    address[] public accountantsList;

    /**
     * @dev Add accountant
     * @param accountant The address of the accountant
     */
    function addAccountant(address accountant) external onlyOwner {
        accountants[accountant] = true;
        accountantsList.push(accountant);
    }

    /**
     * @dev Remove accountant
     * @param accountant The address of the accountant
     */
    function removeAccountant(address accountant) external onlyOwner {
        accountants[accountant] = false;
        for (uint256 i = 0; i < accountantsList.length; i++) {
            if (accountantsList[i] == accountant) {
                accountantsList[i] = accountantsList[accountantsList.length - 1];
                accountantsList.pop();
                break;
            }
        }
    }

    /* ///////////////////////
    // 📝 Accounting section
    /////////////////////// */

    // Accounting events
    event EndoweeChanged(address newEndowee);
    event TokenAdded(address token);
    event TokenRemoved(address token);
    event ExpectedReturnUpdated(address token, uint256 newExpectedReturn);


    // Save token info for accounting
    struct TokenInfo {
        uint256 expectedAnnualReturn; // Percentage of expected annual return (e.g., 500 for 5%)
        uint256 lastDistributionTime;
        uint256 accumulatedBalance; // Accumulated token balance for distribution
    }
    mapping(address => TokenInfo) public tokens;

    // Save token list for accounting
    address[] public tokenList;

    /**
     * @dev Add ERC-20 token to the endowment. Adding a token means that the contract will distribute it based on the expected return. Tokens held by the address that are not in the token list will not be distributed.
     * @param token The address of the token
     * @param expectedReturn Percentage of expected annual return (e.g., 500 for 5%)
     */
    function addToken(address token, uint256 expectedReturn) external onlyOwnerOrAccountant {
        require(token != address(0), "Token address cannot be zero");
        require(expectedReturn > 0, "Expected return must be greater than zero");
        require(tokens[token].expectedAnnualReturn == 0, "Token already managed");
        tokens[token] = TokenInfo(expectedReturn, block.timestamp, 0);
        tokenList.push(token);
        emit TokenAdded(token);
    }

    /**
     * @dev Remove token from the endowment. Removed tokens are not touched by the contract anymore.
     * @param token The address of the token
     */
    function removeToken(address token) external onlyOwnerOrAccountant {
        require(tokens[token].expectedAnnualReturn > 0, "Token not managed");
        delete tokens[token];
        for (uint256 i = 0; i < tokenList.length; i++) {
            if (tokenList[i] == token) {
                tokenList[i] = tokenList[tokenList.length - 1];
                tokenList.pop();
                break;
            }
        }
        emit TokenRemoved(token);
    }

    function changeEndowee(address newEndowee) external onlyOwner {
        require(newEndowee != address(0), "Endowee cannot be the zero address");
        endowee = newEndowee;
        emit EndoweeChanged(newEndowee);
    }

    /* ///////////////////////////////
    // 📈 Distribution administration
    /////////////////////////////// */

    event DistributionIntervalUpdated(uint256 newInterval);
    event Distributed(address token, uint256 amount);

    /**
     * @dev Update expected return for a token
     * @param token The address of the token
     * @param newExpectedReturn Percentage of expected annual return (e.g., 500 for 5%)
     */
    function updateExpectedReturn(address token, uint256 newExpectedReturn) external onlyOwnerOrAccountant {
        require(newExpectedReturn > 0, "Expected return must be greater than zero");
        tokens[token].expectedAnnualReturn = newExpectedReturn;
        emit ExpectedReturnUpdated(token, newExpectedReturn);
    }

    /**
     * @dev Update distribution interval
     * @param newInterval Interval for distribution in seconds
     */
    function updateDistributionInterval(uint256 newInterval) external onlyOwnerOrAccountant {
        require(newInterval > 0, "Interval must be greater than zero");
        distributionInterval = newInterval;
        emit DistributionIntervalUpdated(newInterval);
    }

    /* ///////////////////////
    // 📤 Distribution logic
    /////////////////////// */

    /**
     * @dev Trigger distribution of accumulated tokens
     * @notice This function can be called by anyone
     */
    function triggerDistribution() public noReentrancy {

        // Check which tokens in the list are ready for distribution
        for (uint256 i = 0; i < tokenList.length; i++) {

            // Get token info
            address token = tokenList[i];

            // Calculate distributable amount based on return stats and whether the distribution interval passed
            uint256 distributableAmount = calculateDistributableAmount(token);

            // Check if the contract has enough tokens to distribute the calculated amount
            bool hasSufficientBalance = IERC20(token).balanceOf(address(this)) >= distributableAmount;

            // If there is a distributable amount and the contract has enough tokens, distribute the tokens
            if (distributableAmount > 0 && hasSufficientBalance) {

                // Transfer the tokens to the endowee
                IERC20(token).transfer(endowee, distributableAmount);

                // Update the accumulated balance and last distribution time
                tokens[token].accumulatedBalance -= distributableAmount;
                tokens[token].lastDistributionTime = block.timestamp;
                emit Distributed(token, distributableAmount);

            }

            // Emit an insufficient balance event if the contract does not have enough tokens
            if (distributableAmount > 0 && !hasSufficientBalance) {
                emit Distributed(token, 0);
            }

        }
    }

    /**
     * @dev Calculate distributable amount for a token
     * @param token The address of the token
     * @return The amount of tokens that can be distributed
     */
    function calculateDistributableAmount(address token) internal view returns (uint256) {
        
        // Check if the expected return and last distribution time are set
        require(tokens[token].expectedAnnualReturn > 0, "Expected return not set");
        require(tokens[token].lastDistributionTime > 0, "Last distribution time not set");

        // Calculate the time elapsed since the last distribution
        TokenInfo memory info = tokens[token];

        // Calculate the seconds elapsed since the last distribution
        uint256 timeElapsed = block.timestamp - info.lastDistributionTime;

        // Calculate the yearly distribution of this token based on the expected return
        uint256 yearlyDistribution = (info.accumulatedBalance * info.expectedAnnualReturn) / 10000;

        // Calculate the distribution based on seconds passed since the last distribution
        return (yearlyDistribution * timeElapsed) / 365 days;

    }

    /**
     * @dev Helper function that returns the amount of tokens that have distributable amounts
     * @return The amount of tokens that have distributable amounts
     */
    function getDistributableTokenCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < tokenList.length; i++) {
            if (calculateDistributableAmount(tokenList[i]) > 0) {
                count++;
            }
        }
        return count;
    }

    /**
     * @dev Helper function that returns the distributable amounts of each token
     * @return The distributable amounts of each token
     */
    function getDistributableAmounts() external view returns (address[] memory, uint256[] memory) {

        // Create arrays to store tokens with distributable amounts and their amounts
        address[] memory tokensWithDistributableAmounts = new address[](tokenList.length);
        uint256[] memory distributableAmounts = new uint256[](tokenList.length);

        // Iterate over the token list and calculate the distributable amount for each token
        for (uint256 i = 0; i < tokenList.length; i++) {
            uint256 distributableAmount = calculateDistributableAmount(tokenList[i]);
            if (distributableAmount > 0) {
                tokensWithDistributableAmounts[i] = tokenList[i];
                distributableAmounts[i] = distributableAmount;
            }
        }

        // Return the arrays, where the index of the address in the first array corresponds to the index of the amount in the second array
        return (tokensWithDistributableAmounts, distributableAmounts);
        
    }

}

