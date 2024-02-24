// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

import "./BetToken.sol";
import "./BetCoin.sol";

contract Bet is VRFConsumerBaseV2, ConfirmedOwner {
    bytes32 private _keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
    uint64 private _subId;
    uint16 private _minimumRequestConfirmations = 3;
    uint32 private _callbackGasLimit = 60000;
    uint32 private _numWords = 1;

    struct BetInfo {
        uint256 amount;
        uint256 tokenId;
        address better;
    }

    BetToken private _betToken;
    BetCoin private _betCoin;
    VRFCoordinatorV2Interface private _coordinator;

    mapping(uint256 => BetInfo) private _bets;

    constructor(
        address coordinatorAddr, uint64 subId
    ) VRFConsumerBaseV2(coordinatorAddr) ConfirmedOwner(msg.sender) {
        _betToken = new BetToken();
        _betCoin = new BetCoin();
        _coordinator = VRFCoordinatorV2Interface(coordinatorAddr);
        _subId = subId;
    }

    function getBetCoinAddress() public view returns (address) {
        return address(_betCoin);
    }

    function getBetTokenAddress() public view returns (address) {
        return address(_betToken);
    }

    function bet(uint256 tokenId) public {
        require(
            _betToken.ownerOf(tokenId) != msg.sender,
            "You can't bet on a token you own"
        );

        uint256 amount = 20;
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
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        BetInfo memory betInfo = _bets[_requestId];
        uint256 number = _randomWords[0] % 3;

        if (number == 0) {
            _betCoin.unlockAssets(betInfo.better, betInfo.amount);
            _betToken.stealAsset(betInfo.better, betInfo.tokenId);
        } else {
            _betCoin.payDebts(
                betInfo.better,
                _betToken.ownerOf(betInfo.tokenId),
                betInfo.amount
            );
            _betToken.unlockAsset(betInfo.tokenId);
        }

        delete _bets[_requestId];
    }

    function setSubId(uint64 subId) public onlyOwner {
        _subId = subId;
    }

    function setMinimumRequestConfirmations(uint16 minimumRequestConfirmations)
        public
        onlyOwner
    {
        _minimumRequestConfirmations = minimumRequestConfirmations;
    }

    function setCallbackGasLimit(uint32 callbackGasLimit) public onlyOwner {
        _callbackGasLimit = callbackGasLimit;
    }
}
