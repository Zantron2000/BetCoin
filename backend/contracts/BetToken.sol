// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BetToken is ERC721, Ownable {
    uint public constant SECONDS_IN_A_DAY = 24 * 60 * 60;
    uint16 public constant MAX_SUPPLY = 10000;
    uint16 public supply = 0;

    mapping(uint256 => uint256) private _safeUntil;
    mapping(uint256 => bool) private _lockedAssets;

    modifier isNotLocked(uint256 tokenId) {
        require(!_lockedAssets[tokenId], "Asset is locked");
        _;
    }

    constructor() ERC721("BetToken", "BET") Ownable(msg.sender) {}

    function mint(address to) public {
        require(supply < MAX_SUPPLY, "Max supply reached");
        require(balanceOf(to) < 3, "You can only mint 3 tokens per address");

        _safeMint(to, supply);
        supply++;
    }

    function lockAsset(uint256 tokenId) public onlyOwner {
        require(!_lockedAssets[tokenId], "Asset already locked");

        _safeUntil[tokenId] = block.timestamp + SECONDS_IN_A_DAY;
        _lockedAssets[tokenId] = true;
    }

    function unlockAsset(uint256 tokenId) public onlyOwner {
        require(_lockedAssets[tokenId], "Asset already unlocked");

        _lockedAssets[tokenId] = false;
    }

    function isLocked(uint16 tokenId) public view returns (bool) {
        return _lockedAssets[tokenId];
    }

    function stealAsset(address to, uint256 tokenId) public onlyOwner {
        require(ownerOf(tokenId) != to, "You can't steal from yourself");
        require(_lockedAssets[tokenId], "Asset is not locked");

        _transfer(ownerOf(tokenId), to, tokenId);
        _lockedAssets[tokenId] = false;
    }

    function safeUntil(uint16 tokenId) public view returns (uint) {
        return _safeUntil[tokenId] + SECONDS_IN_A_DAY;
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override isNotLocked(tokenId) {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override isNotLocked(tokenId) {
        super.safeTransferFrom(from, to, tokenId, data);
    }
}
