//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

contract MockVRFCoordinatorV2 {
    uint256 private _value;
    uint256 private _requestId;
    address private _consumer;

    constructor(uint256 value, uint256 requestId) {
        _value = value;
        _requestId = requestId;
    }

    function requestRandomWords(
        bytes32,
        uint64,
        uint16,
        uint32,
        uint32
    ) external returns (uint256) {
        _consumer = msg.sender;
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = _value;

        return _requestId;
    }

    function fulfillRandomWords() external {
        VRFConsumerBaseV2 vrfConsumer = VRFConsumerBaseV2(_consumer);
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = _value;

        vrfConsumer.rawFulfillRandomWords(_requestId, randomWords);
    }
}
