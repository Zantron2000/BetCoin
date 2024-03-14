// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BetToken
 * @author Zantron2000.eth
 *
 * @dev The BetToken contract is an ERC721 token that users can bet on
 */
contract BetToken is ERC721, Ownable {
    uint public constant SECONDS_IN_A_DAY = 24 * 60 * 60; // The number of seconds in a day
    uint16 public constant MAX_SUPPLY = 10000; // The maximum supply of tokens
    uint16 public supply = 0; // The current supply of tokens

    mapping(uint256 => uint256) private _safeUntil; // Keeps track of when assets are safe
    mapping(uint256 => bool) private _lockedAssets; // Keeps track of locked assets

    /**
     * @dev Modifier that requires the asset to not be locked
     *
     * @param tokenId The id of the token
     */
    modifier isNotLocked(uint256 tokenId) {
        require(!_lockedAssets[tokenId], "Asset is locked");
        _;
    }

    /**
     * @dev Constructor that sets the initial name, symbol and owner of the contract.
     */
    constructor() ERC721("BetToken", "BET") Ownable(msg.sender) {}

    /**
     * @dev Mints new tokens to the caller. Only allows addresses with less than 3 tokens to mint.
     *
     * @param to The address to mint to
     */
    function mint(address to) public {
        require(supply < MAX_SUPPLY, "Max supply reached");
        require(balanceOf(to) < 3, "You can only mint 3 tokens per address");

        _safeMint(to, supply);
        supply++;
    }

    /**
     * @dev Locks assets for a given address. Only the owner can call this function.
     *
     * @param tokenId The id of the token
     */
    function lockAsset(uint256 tokenId) public onlyOwner {
        require(!_lockedAssets[tokenId], "Asset already locked");

        _safeUntil[tokenId] = block.timestamp + SECONDS_IN_A_DAY;
        _lockedAssets[tokenId] = true;
    }

    /**
     * @dev Unlocks assets for a given address. Only the owner can call this function.
     *
     * @param tokenId The id of the token
     */
    function unlockAsset(uint256 tokenId) public onlyOwner {
        require(_lockedAssets[tokenId], "Asset already unlocked");

        _lockedAssets[tokenId] = false;
    }

    /**
     * @dev Returns whether the asset is locked
     *
     * @param tokenId The id of the token
     * @return isLocked Whether the asset is locked
     */
    function isLocked(uint16 tokenId) public view returns (bool) {
        return _lockedAssets[tokenId];
    }

    /**
     * @dev Steals asset from one address and gives to another. Only the owner can call this function.
     *
     * @param to The address to give the asset to
     * @param tokenId The id of the token to give
     */
    function stealAsset(address to, uint256 tokenId) public onlyOwner {
        require(ownerOf(tokenId) != to, "You can't steal from yourself");
        require(_lockedAssets[tokenId], "Asset is not locked");

        _transfer(ownerOf(tokenId), to, tokenId);
        _lockedAssets[tokenId] = false;
    }

    /**
     * @dev Returns the time when the asset is no longer safe
     *
     * @param tokenId The id of the token
     * @return time The time when the asset becomes no longer safe
     */
    function safeUntil(uint16 tokenId) public view returns (uint) {
        return _safeUntil[tokenId] + SECONDS_IN_A_DAY;
    }

    /**
     * @dev Transfers the ownership of a token from one address to another. Only non-locked assets can be transferred.
     *
     * @param from The address to transfer from
     * @param to The address to transfer to
     * @param tokenId The id of the token
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override isNotLocked(tokenId) {
        super.transferFrom(from, to, tokenId);
    }

    /**
     * @dev Safely transfers the ownership of a token from one address to another. Only non-locked assets can be transferred.
     *
     * @param from The address to transfer from
     * @param to The address to transfer to
     * @param tokenId The id of the token
     * @param data Additional data
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override isNotLocked(tokenId) {
        super.safeTransferFrom(from, to, tokenId, data);
    }
}
