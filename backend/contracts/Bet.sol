// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

import "./BetToken.sol";
import "./BetCoin.sol";

/**
 * @title Bet
 * @author Zantron2000.eth
 *
 * @dev The Bet contract allows users to place bets on tokens. The outcome of the bet is determined by a Chainlink VRF request.
 */
contract Bet is VRFConsumerBaseV2, ConfirmedOwner {
    /**
     * @dev Emitted when a bet is placed
     *
     * @param better The address of the better
     * @param tokenId The id of the token being bet on
     * @param requestId The id of the VRF request
     */
    event BetPlaced(
        address indexed better,
        uint256 indexed tokenId,
        uint256 indexed requestId
    );

    /**
     * @dev Emitted when a bet is won
     *
     * @param better The address of the better
     * @param tokenId The id of the token that was bet on
     * @param requestId The id of the VRF request
     */
    event BetWon(
        address indexed better,
        uint256 indexed tokenId,
        uint256 indexed requestId
    );

    /**
     * @dev Emitted when a bet is lost
     *
     * @param better The address of the better
     * @param tokenId The id of the token that was bet on
     * @param requestId The id of the VRF request
     */
    event BetLost(
        address indexed better,
        uint256 indexed tokenId,
        uint256 indexed requestId
    );

    bytes32 private _keyHash =
        0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
    uint64 private _subId; // The subscription id for the VRF request
    uint16 private _minimumRequestConfirmations = 3; // The default number of confirmations required for a VRF request
    uint32 private _callbackGasLimit = 80000; // The default gas limit for the callback
    uint32 private _numWords = 1; // Number of random words to return
    uint16 private _betCost = 20; // The default cost per bet

    /**
     * @dev Struct to store bet information
     *
     * @param amount The amount of the bet
     * @param tokenId The id of the token being bet on
     * @param better The address of the better
     */
    struct BetInfo {
        uint256 amount;
        uint256 tokenId;
        address better;
    }

    BetToken private _betToken; // The BetToken contract
    BetCoin private _betCoin; // The BetCoin contract
    VRFCoordinatorV2Interface private _coordinator; // The VRFCoordinatorV2 contract

    mapping(uint256 => BetInfo) private _bets; // The mapping of VRF request ids to bet information

    /**
     * @dev The Bet constructor
     *
     * @param coordinatorAddr The address of the VRFCoordinatorV2 contract
     * @param subId The subscription id for the VRF request
     */
    constructor(
        address coordinatorAddr,
        uint64 subId
    ) VRFConsumerBaseV2(coordinatorAddr) ConfirmedOwner(msg.sender) {
        // Initializes the BetToken, BetCoin, and VRFCoordinatorV2 contracts
        _betToken = new BetToken();
        _betCoin = new BetCoin();
        _coordinator = VRFCoordinatorV2Interface(coordinatorAddr);

        _subId = subId;
    }

    /**
     * @dev Given a token ID, determines the wager size to bet on the token
     *
     * @param tokenId The id of the token being bet on
     * @return cost The cost of the bet
     */
    function getBetCost(uint256 tokenId) public view returns (uint16) {
        return _betCost;
    }

    /**
     * @dev Returns the address of the BetCoin contract
     *
     * @return address The address of the BetCoin contract
     */
    function getBetCoinAddress() public view returns (address) {
        return address(_betCoin);
    }

    /**
     * @dev Returns the address of the BetToken contract
     *
     * @return address The address of the BetToken contract
     */
    function getBetTokenAddress() public view returns (address) {
        return address(_betToken);
    }

    /**
     * @dev Creates a bet on a token. Requires that the token is able to be bet on,
     * the owner is not the better, and the better has enough funds to bet.
     *
     * @param tokenId The id of the token being bet on
     */
    function bet(uint256 tokenId) public {
        require(
            _betToken.ownerOf(tokenId) != msg.sender,
            "You can't bet on a token you own"
        );

        uint256 amount = _betCost;
        _betCoin.lockAssets(msg.sender, amount);
        _betToken.lockAsset(tokenId);

        BetInfo memory betInfo = BetInfo(amount, tokenId, msg.sender);
        uint256 requestId = _coordinator.requestRandomWords(
            _keyHash,
            _subId,
            _minimumRequestConfirmations,
            _callbackGasLimit,
            _numWords
        );

        _bets[requestId] = betInfo;
        emit BetPlaced(msg.sender, tokenId, requestId);
    }

    /**
     * @dev Callback function used by the VRFCoordinatorV2 contract to fulfill a VRF request.
     * Used to determine the outcome of a bet. If the random number is divisible by 3, the better wins.
     *
     * @param _requestId The id of the VRF request
     * @param _randomWords The random words returned by the VRF request
     */
    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        BetInfo memory betInfo = _bets[_requestId];
        uint256 number = _randomWords[0] % 3;

        if (number == 0) {
            // Unlocks the better's assets and gives them the token
            _betCoin.unlockAssets(betInfo.better, betInfo.amount);
            _betToken.stealAsset(betInfo.better, betInfo.tokenId);

            emit BetWon(betInfo.better, betInfo.tokenId, _requestId);
        } else {
            // Forfeits the better's assets and gives the token back to the owner
            _betCoin.payDebts(
                betInfo.better,
                _betToken.ownerOf(betInfo.tokenId),
                betInfo.amount
            );
            _betToken.unlockAsset(betInfo.tokenId);

            emit BetLost(betInfo.better, betInfo.tokenId, _requestId);
        }

        delete _bets[_requestId];
    }

    /**
     * @dev Updates the subscription id for the VRF request
     *
     * @param subId The new subscription id
     */
    function setSubId(uint64 subId) public onlyOwner {
        _subId = subId;
    }

    /**
     * @dev Updates the minimum number of confirmations required for a VRF request
     *
     * @param minimumRequestConfirmations The new minimum number of confirmations
     */
    function setMinimumRequestConfirmations(
        uint16 minimumRequestConfirmations
    ) public onlyOwner {
        _minimumRequestConfirmations = minimumRequestConfirmations;
    }

    /**
     * @dev Updates the gas limit for the callback
     *
     * @param callbackGasLimit The new gas limit
     */
    function setCallbackGasLimit(uint32 callbackGasLimit) public onlyOwner {
        _callbackGasLimit = callbackGasLimit;
    }
}
