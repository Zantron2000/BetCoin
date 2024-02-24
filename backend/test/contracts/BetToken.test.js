const hre = require("hardhat");
const { expect } = require("chai");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe('Tests the BetToken contract', () => {
    it('Should initialize the contract correctly', async () => {
        const BetToken = await hre.ethers.getContractFactory('BetToken');
        const betToken = await BetToken.deploy();
        const [owner] = await hre.ethers.getSigners();

        expect(await betToken.name()).to.equal('BetToken');
        expect(await betToken.symbol()).to.equal('BET');
        expect(await betToken.supply()).to.equal(0);
        expect(await betToken.owner()).to.equal(owner.address);
    });

    it('Should allow an address to mint an NFT', async () => {
        const BetToken = await hre.ethers.getContractFactory('BetToken');
        const betToken = await BetToken.deploy();
        const [owner] = await hre.ethers.getSigners();

        await betToken.connect(owner).mint(owner.address);
        expect(await betToken.balanceOf(owner.address)).to.equal(1);
        expect(await betToken.supply()).to.equal(1);
        expect(await betToken.ownerOf(0)).to.equal(owner.address);
    });

    it('Should not allow an address to mint more NFTs if they already have three', async () => {
        const BetToken = await hre.ethers.getContractFactory('BetToken');
        const betToken = await BetToken.deploy();
        const [owner] = await hre.ethers.getSigners();

        await betToken.connect(owner).mint(owner.address);
        await betToken.connect(owner).mint(owner.address);
        await betToken.connect(owner).mint(owner.address);
        await expect(betToken.connect(owner).mint(owner.address)).to.be.revertedWith('You can only mint 3 tokens per address');
    });

    it('Should allow the owner to lock an asset', async () => {
        const BetToken = await hre.ethers.getContractFactory('BetToken');
        const betToken = await BetToken.deploy();
        const [owner] = await hre.ethers.getSigners();

        await betToken.connect(owner).mint(owner.address);
        await betToken.connect(owner).lockAsset(0);
        expect(await betToken.isLocked(0)).to.equal(true);
    });

    it('Should not allow the owner to lock an asset if it is already locked', async () => {
        const BetToken = await hre.ethers.getContractFactory('BetToken');
        const betToken = await BetToken.deploy();
        const [owner] = await hre.ethers.getSigners();

        await betToken.connect(owner).mint(owner.address);
        await betToken.connect(owner).lockAsset(0);
        await expect(betToken.connect(owner).lockAsset(0)).to.be.revertedWith('Asset already locked');
    });

    it('Should allow only the owner to lock assets', async () => {
        const BetToken = await hre.ethers.getContractFactory('BetToken');
        const betToken = await BetToken.deploy();
        const [owner, otherAccount] = await hre.ethers.getSigners();

        await betToken.connect(owner).mint(owner.address);
        await expect(betToken.connect(otherAccount).lockAsset(0)).to.be.revertedWithCustomError(betToken, 'OwnableUnauthorizedAccount');
    });

    it('Should allow only the owner to unlock assets', async () => {
        const BetToken = await hre.ethers.getContractFactory('BetToken');
        const betToken = await BetToken.deploy();
        const [owner, otherAccount] = await hre.ethers.getSigners();

        await betToken.connect(owner).mint(owner.address);
        await betToken.connect(owner).lockAsset(0);
        await expect(betToken.connect(otherAccount).unlockAsset(0)).to.be.revertedWithCustomError(betToken, 'OwnableUnauthorizedAccount');
    });

    it('Should allow the owner to unlock an asset', async () => {
        const BetToken = await hre.ethers.getContractFactory('BetToken');
        const betToken = await BetToken.deploy();
        const [owner] = await hre.ethers.getSigners();

        await betToken.connect(owner).mint(owner.address);
        await betToken.connect(owner).lockAsset(0);
        expect(await betToken.isLocked(0)).to.equal(true);
        await betToken.connect(owner).unlockAsset(0);
        expect(await betToken.isLocked(0)).to.equal(false);
    });

    it('Should not allow the owner to unlock an asset if it is already unlocked', async () => {
        const BetToken = await hre.ethers.getContractFactory('BetToken');
        const betToken = await BetToken.deploy();
        const [owner] = await hre.ethers.getSigners();

        await betToken.connect(owner).mint(owner.address);
        await expect(betToken.connect(owner).unlockAsset(0)).to.be.revertedWith('Asset already unlocked');
    });

    it('Should not allow a player to steal an asset from themselves', async () => {
        const BetToken = await hre.ethers.getContractFactory('BetToken');
        const betToken = await BetToken.deploy();
        const [owner] = await hre.ethers.getSigners();

        await betToken.connect(owner).mint(owner.address);
        await expect(betToken.connect(owner).stealAsset(owner.address, 0)).to.be.revertedWith("You can't steal from yourself");
    });

    it('Should not allow a player to steal an asset that isn\'t locked', async () => {
        const BetToken = await hre.ethers.getContractFactory('BetToken');
        const betToken = await BetToken.deploy();
        const [owner, otherAccount] = await hre.ethers.getSigners();

        await betToken.connect(owner).mint(owner.address);
        await expect(betToken.connect(owner).stealAsset(otherAccount.address, 0)).to.be.revertedWith('Asset is not locked');
    });

    it('Should allow a player to steal an asset from another player', async () => {
        const BetToken = await hre.ethers.getContractFactory('BetToken');
        const betToken = await BetToken.deploy();
        const [owner, otherAccount] = await hre.ethers.getSigners();

        await betToken.connect(owner).mint(owner.address);
        await betToken.connect(owner).lockAsset(0);
        await betToken.connect(otherAccount).mint(otherAccount.address);
        await betToken.connect(owner).stealAsset(otherAccount.address, 0);
        expect(await betToken.ownerOf(0)).to.equal(otherAccount.address);
    });

    it('Should not allow a player to transfer an asset that is locked', async () => {
        const BetToken = await hre.ethers.getContractFactory('BetToken');
        const betToken = await BetToken.deploy();
        const [owner, otherAccount] = await hre.ethers.getSigners();

        await betToken.connect(owner).mint(owner.address);
        await betToken.connect(owner).lockAsset(0);
        await expect(betToken.connect(owner).transferFrom(owner.address, otherAccount.address, 0)).to.be.revertedWith('Asset is locked');
    });

    it('Should not allow a player to safe transfer an asset that is locked', async () => {
        const BetToken = await hre.ethers.getContractFactory('BetToken');
        const betToken = await BetToken.deploy();
        const [owner, otherAccount] = await hre.ethers.getSigners();

        await betToken.connect(owner).mint(owner.address);
        await betToken.connect(owner).lockAsset(0);
        await expect(betToken.connect(owner).safeTransferFrom(owner.address, otherAccount.address, 0)).to.be.revertedWith('Asset is locked');
    });
});
