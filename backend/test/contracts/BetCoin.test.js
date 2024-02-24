const hre = require("hardhat");
const { expect } = require("chai");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe('Tests the BetCoin contract', () => {
    const MINT_AMOUNT = 50;

    it('Should initialize the contract correctly', async () => {
        const BetCoin = await hre.ethers.getContractFactory('BetCoin');
        const betCoin = await BetCoin.deploy();
        const [owner] = await hre.ethers.getSigners();

        const name = await betCoin.name();
        const symbol = await betCoin.symbol();
        const ownerAddress = await betCoin.owner();

        expect(name).to.equal('BetCoin');
        expect(symbol).to.equal('BET');
        expect(ownerAddress).to.equal(owner.address);
    });

    it('Should allow an address to mint only once a week', async () => {
        const BetCoin = await hre.ethers.getContractFactory('BetCoin');
        const betCoin = await BetCoin.deploy();
        const [owner] = await hre.ethers.getSigners();

        await expect(betCoin.connect(owner).mint()).to.emit(betCoin, 'Transfer');
        await expect(betCoin.connect(owner).mint()).to.be.revertedWith('You can only mint once a week');
        expect(await betCoin.balanceOf(owner.address)).to.equal(MINT_AMOUNT);


        await time.increase(7 * 24 * 60 * 60 + 1);

        await expect(betCoin.connect(owner).mint()).to.emit(betCoin, 'Transfer');
        expect(await betCoin.balanceOf(owner.address)).to.equal(MINT_AMOUNT * 2);
    });

    it('Should get the time in seconds until the next mint', async () => {
        const BetCoin = await hre.ethers.getContractFactory('BetCoin');
        const betCoin = await BetCoin.deploy();
        const [owner] = await hre.ethers.getSigners();

        await expect(betCoin.connect(owner).mint()).to.emit(betCoin, 'Transfer');
        expect(await betCoin.balanceOf(owner.address)).to.equal(MINT_AMOUNT);

        const timeUntilNextMint = await betCoin.mintUnlocksAt(owner.address);
        expect(timeUntilNextMint).to.be.greaterThan(0);
    });

    it('Should allow only the owner to lock assets', async () => {
        const BetCoin = await hre.ethers.getContractFactory('BetCoin');
        const betCoin = await BetCoin.deploy();
        const [owner, otherAccount] = await hre.ethers.getSigners();

        await betCoin.connect(otherAccount).mint();
        await betCoin.connect(owner).lockAssets(otherAccount.address, 25);

        expect(await betCoin.lockedAssets(otherAccount.address)).to.equal(25);
        await expect(betCoin.connect(otherAccount).lockAssets(owner.address, 25)).to.be.revertedWithCustomError(betCoin, 'OwnableUnauthorizedAccount');
    });

    it('Should not allow more than the balance to be locked', async () => {
        const BetCoin = await hre.ethers.getContractFactory('BetCoin');
        const betCoin = await BetCoin.deploy();
        const [owner, otherAccount] = await hre.ethers.getSigners();

        await betCoin.connect(otherAccount).mint();
        await expect(betCoin.connect(owner).lockAssets(otherAccount.address, 51)).to.be.revertedWith("You can't lock more assets than you have");
    });

    it('Should allow the owner to lock assets', async () => {
        const BetCoin = await hre.ethers.getContractFactory('BetCoin');
        const betCoin = await BetCoin.deploy();
        const [owner, otherAccount] = await hre.ethers.getSigners();

        await betCoin.connect(otherAccount).mint();
        await betCoin.connect(owner).lockAssets(otherAccount.address, 25);

        expect(await betCoin.lockedAssets(otherAccount.address)).to.equal(25);
    });

    it('Should allow only the owner to unlock assets', async () => {
        const BetCoin = await hre.ethers.getContractFactory('BetCoin');
        const betCoin = await BetCoin.deploy();
        const [owner, otherAccount] = await hre.ethers.getSigners();

        await betCoin.connect(otherAccount).mint();
        await betCoin.connect(owner).lockAssets(otherAccount.address, 25);

        await expect(betCoin.connect(otherAccount).unlockAssets(owner.address, 25)).to.be.revertedWithCustomError(betCoin, 'OwnableUnauthorizedAccount');
    });

    it('Should not allow more than the locked assets to be unlocked', async () => {
        const BetCoin = await hre.ethers.getContractFactory('BetCoin');
        const betCoin = await BetCoin.deploy();
        const [owner, otherAccount] = await hre.ethers.getSigners();

        await betCoin.connect(otherAccount).mint();
        await betCoin.connect(owner).lockAssets(otherAccount.address, 25);

        await expect(betCoin.connect(owner).unlockAssets(otherAccount.address, 26)).to.be.revertedWith("You can't unlock more assets than you have locked");
    });

    it('Should allow the owner to unlock assets', async () => {
        const BetCoin = await hre.ethers.getContractFactory('BetCoin');
        const betCoin = await BetCoin.deploy();
        const [owner, otherAccount] = await hre.ethers.getSigners();

        await betCoin.connect(otherAccount).mint();
        await betCoin.connect(owner).lockAssets(otherAccount.address, 25);
        await betCoin.connect(owner).unlockAssets(otherAccount.address, 25);

        expect(await betCoin.lockedAssets(otherAccount.address)).to.equal(0);
    });

    it('Should allow only the owner to force payment of debts', async () => {
        const BetCoin = await hre.ethers.getContractFactory('BetCoin');
        const betCoin = await BetCoin.deploy();
        const [owner, otherAccount] = await hre.ethers.getSigners();

        await betCoin.connect(otherAccount).mint();
        await betCoin.connect(owner).lockAssets(otherAccount.address, 25);

        await expect(betCoin.connect(otherAccount).payDebts(owner.address, otherAccount.address, 25)).to.be.revertedWithCustomError(betCoin, 'OwnableUnauthorizedAccount');
    });

    it('Should not allow more than the locked assets to be paid as debts', async () => {
        const BetCoin = await hre.ethers.getContractFactory('BetCoin');
        const betCoin = await BetCoin.deploy();
        const [owner, otherAccount] = await hre.ethers.getSigners();

        await betCoin.connect(otherAccount).mint();
        await betCoin.connect(owner).lockAssets(otherAccount.address, 25);

        await expect(betCoin.connect(owner).payDebts(otherAccount.address, owner.address, 26)).to.be.revertedWith("You can't pay more than the locked assets");
    });

    it('Should allow the owner to force payment of debts', async () => {
        const BetCoin = await hre.ethers.getContractFactory('BetCoin');
        const betCoin = await BetCoin.deploy();
        const [owner, otherAccount] = await hre.ethers.getSigners();

        await betCoin.connect(otherAccount).mint();
        await betCoin.connect(owner).lockAssets(otherAccount.address, 25);
        await betCoin.connect(owner).payDebts(otherAccount.address, owner.address, 25);

        expect(await betCoin.lockedAssets(otherAccount.address)).to.equal(0);
        expect(await betCoin.balanceOf(owner.address)).to.equal(25);
    });

    it('Should not allow a user to transfer locked assets to another user', async () => {
        const BetCoin = await hre.ethers.getContractFactory('BetCoin');
        const betCoin = await BetCoin.deploy();
        const [owner, otherAccount, anotherAccount] = await hre.ethers.getSigners();

        await betCoin.connect(otherAccount).mint();
        await betCoin.connect(owner).lockAssets(otherAccount.address, 25);

        await expect(betCoin.connect(otherAccount).transfer(anotherAccount.address, 30)).to.be.revertedWith("You can't transfer more than the unlocked assets");
    });

    it('Should allow a user to transfer unlocked assets to another user', async () => {
        const BetCoin = await hre.ethers.getContractFactory('BetCoin');
        const betCoin = await BetCoin.deploy();
        const [otherAccount, anotherAccount] = await hre.ethers.getSigners();

        await betCoin.connect(otherAccount).mint();
        await betCoin.connect(otherAccount).transfer(anotherAccount.address, 25);

        expect(await betCoin.balanceOf(otherAccount.address)).to.equal(25);
        expect(await betCoin.balanceOf(anotherAccount.address)).to.equal(25);
    });

    it('Should not allow a user to transfer from another user if the balance is locked up', async () => {
        const BetCoin = await hre.ethers.getContractFactory('BetCoin');
        const betCoin = await BetCoin.deploy();
        const [otherAccount, anotherAccount] = await hre.ethers.getSigners();

        await betCoin.connect(otherAccount).mint();
        await betCoin.connect(otherAccount).lockAssets(otherAccount.address, 25);
        await betCoin.connect(otherAccount).approve(anotherAccount.address, 45);

        await expect(betCoin.connect(otherAccount).transferFrom(otherAccount.address, anotherAccount.address, 45)).to.be.revertedWith("You can't transfer more than the unlocked assets");
    });

    it('Should allow a user to transfer from another user if the balance is unlocked', async () => {
        const BetCoin = await hre.ethers.getContractFactory('BetCoin');
        const betCoin = await BetCoin.deploy();
        const [otherAccount, anotherAccount] = await hre.ethers.getSigners();

        await betCoin.connect(otherAccount).mint();
        await betCoin.connect(otherAccount).lockAssets(otherAccount.address, 25);
        await betCoin.connect(otherAccount).approve(anotherAccount.address, 45);
        await betCoin.connect(anotherAccount).transferFrom(otherAccount.address, anotherAccount.address, 25);

        expect(await betCoin.balanceOf(otherAccount.address)).to.equal(25);
        expect(await betCoin.balanceOf(anotherAccount.address)).to.equal(25);
    });
});