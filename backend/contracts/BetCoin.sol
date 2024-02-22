// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BetCoin is ERC20, Ownable {
    uint public constant SECONDS_IN_A_WEEK = 7 * 24 * 60 * 60;
    uint8 public constant MINT_AMOUNT = 50;

    mapping(address => uint256) private _lastMinted;
    mapping(address => uint256) private _lockedAssets;

    constructor() ERC20("BetCoin", "BET") Ownable(msg.sender) {}

    function mint() public {
        require(
            block.timestamp - _lastMinted[msg.sender] > SECONDS_IN_A_WEEK,
            "You can only mint once a week"
        );

        _lastMinted[msg.sender] = block.timestamp;

        _mint(msg.sender, MINT_AMOUNT);
    }

    function mintUnlocksAt(address to) public view returns (uint) {
        return _lastMinted[to] + SECONDS_IN_A_WEEK;
    }

    function lockedAssets(address account) public view returns (uint256) {
        return _lockedAssets[account];
    }

    function lockAssets(address better, uint256 amount) public onlyOwner {
        require(
            amount <= balanceOf(better),
            "You can't lock more assets than you have"
        );

        _lockedAssets[better] += amount;
    }

    function payDebts(
        address from,
        address to,
        uint256 amount
    ) public onlyOwner {
        require(
            _lockedAssets[from] >= amount,
            "You can't pay more than the locked assets"
        );

        _lockedAssets[from] -= amount;
        _transfer(from, to, amount);
    }

    function unlockAssets(address debtor, uint256 amount) public onlyOwner {
        require(
            _lockedAssets[debtor] >= amount,
            "You can't unlock more assets than you have locked"
        );

        _lockedAssets[debtor] -= amount;
    }

    function transfer(
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        require(
            balanceOf(msg.sender) - lockedAssets(msg.sender) >= amount,
            "You can't transfer more than the unlocked assets"
        );

        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public virtual override returns (bool) {
        require(
            balanceOf(from) - lockedAssets(from) >= value,
            "You can't transfer more than the unlocked assets"
        );

        return super.transferFrom(from, to, value);
    }
}
