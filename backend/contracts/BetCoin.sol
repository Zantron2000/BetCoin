// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BetCoin
 * @author Zantron2000.eth
 *
 * @dev The BetCoin contract is an ERC20 token that allows users to mint new tokens once a week.
 */
contract BetCoin is ERC20, Ownable {
    uint public constant SECONDS_IN_A_WEEK = 7 * 24 * 60 * 60; // The number of seconds in a week
    uint8 public constant MINT_AMOUNT = 50; // The mint amount

    mapping(address => uint256) private _lastMinted; // Keeps track of when users last minted
    mapping(address => uint256) private _lockedAssets; // Keeps track of locked assets

    /**
     * @dev Constructor that sets the initial name, symbol and owner of the contract.
     */
    constructor() ERC20("BetCoin", "BET") Ownable(msg.sender) {}

    /**
     * @dev Mints new tokens to the caller. Only allows minting once a week.
     */
    function mint() public {
        require(
            block.timestamp - _lastMinted[msg.sender] > SECONDS_IN_A_WEEK,
            "You can only mint once a week"
        );

        _lastMinted[msg.sender] = block.timestamp;

        _mint(msg.sender, MINT_AMOUNT);
    }

    /**
     * @dev Returns the time when the user can mint again.
     *
     * @param to The address to check
     * @return time The time when the user can mint again
     */
    function mintUnlocksAt(address to) public view returns (uint) {
        return _lastMinted[to] + SECONDS_IN_A_WEEK;
    }

    /**
     * @dev Returns the amount of locked assets for a given address.
     *
     * @param account The address to check
     * @return amount The amount of locked assets
     */
    function lockedAssets(address account) public view returns (uint256) {
        return _lockedAssets[account];
    }

    /**
     * @dev Locks assets for a given address. Only the owner can call this function.
     *
     * @param better The address to lock assets for
     * @param amount The amount to lock
     */
    function lockAssets(address better, uint256 amount) public onlyOwner {
        require(
            amount <= balanceOf(better),
            "You can't lock more assets than you have"
        );

        _lockedAssets[better] += amount;
    }

    /**
     * @dev Pays debts for a given address. Only the owner can call this function.
     *
     * @param from The address to pay debts from
     * @param to The address to pay debts to
     * @param amount The amount to pay
     */
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

    /**
     * @dev Unlocks assets for a given address. Only the owner can call this function.
     *
     * @param debtor The address to unlock assets for
     * @param amount The amount to unlock
     */
    function unlockAssets(address debtor, uint256 amount) public onlyOwner {
        require(
            _lockedAssets[debtor] >= amount,
            "You can't unlock more assets than you have locked"
        );

        _lockedAssets[debtor] -= amount;
    }

    /**
     * @dev Transfers tokens from the caller to a given address. Only allows transfers if the caller has enough unlocked assets.
     *
     * @param recipient The address to transfer to
     * @param amount The amount to transfer
     * @return success Whether the transfer was successful
     */
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

    /**
     * @dev Transfers tokens from a given address to another given address. Only allows transfers if the caller has enough unlocked assets.
     *
     * @param from The address to transfer from
     * @param to The address to transfer to
     * @param value The amount to transfer
     * @return success Whether the transfer was successful
     */
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
