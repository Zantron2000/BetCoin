//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

/**
 * @title MockVRFCoordinatorV2
 * @author Zantron2000.eth
 *
 * @dev The MockVRFCoordinatorV2 contract is a mock VRF coordinator that allows for testing of the Bet contract
 */
contract MockVRFCoordinatorV2 {
    uint256 private _value; // The value to return
    uint256 private _requestId; // The request id to relate to
    address private _consumer; // The consumer to fulfill

    /**
     * @dev Constructor that sets the initial value and request id
     *
     * @param value The value to return
     * @param requestId The request id to relate to
     */
    constructor(uint256 value, uint256 requestId) {
        _value = value;
        _requestId = requestId;
    }

    /**
     * @dev Mocks the requestRandomWords function, returns the request id
     *
     * @return requestId The request id
     */
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

    /**
     * @dev Mocks the fulfillRandomWords function, fulfills the request
     */
    function fulfillRandomWords() external {
        VRFConsumerBaseV2 vrfConsumer = VRFConsumerBaseV2(_consumer);
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = _value;

        vrfConsumer.rawFulfillRandomWords(_requestId, randomWords);
    }
}
