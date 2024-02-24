const hre = require("hardhat");
const { expect } = require("chai");

describe('Tests the Bet contract', () => {
    it('Should initialize the contract correctly', async () => {
        const Bet = await hre.ethers.getContractFactory('Bet');
        const [owner] = await hre.ethers.getSigners();
        const bet = await Bet.deploy(owner.address, 1234);

        const betCoinAddress = await bet.getBetCoinAddress();
        const betTokenAddress = await bet.getBetTokenAddress()
        const betCoin = await hre.ethers.getContractAt('BetCoin', betCoinAddress);
        const betToken = await hre.ethers.getContractAt('BetToken', betTokenAddress);

        expect(betCoinAddress).to.be.a('string');
        expect(betTokenAddress).to.be.a('string');
        expect(await betCoin.owner()).to.equal(bet.target);
        expect(await betToken.owner()).to.equal(bet.target);
    });

    it('Should allow the owner to create a bet and reward them if they win', async () => {
        const VRFCoordinatorV2 = await hre.ethers.getContractFactory('MockVRFCoordinatorV2');
        const Bet = await hre.ethers.getContractFactory('Bet');
        const [player1, player2] = await hre.ethers.getSigners();

        const vrfCoordinatorV2 = await VRFCoordinatorV2.deploy(0, 5678);
        const bet = await Bet.deploy(vrfCoordinatorV2.target, 1234);
        const betCoin = await hre.ethers.getContractAt('BetCoin', await bet.getBetCoinAddress());
        const betToken = await hre.ethers.getContractAt('BetToken', await bet.getBetTokenAddress());

        await betCoin.connect(player1).mint();
        await betToken.connect(player2).mint(player2.address);
        await bet.connect(player1).bet(0);

        expect(await betCoin.lockedAssets(player1.address)).to.equal(20);
        expect(await betCoin.lockedAssets(player2.address)).to.equal(0);
        expect(await betToken.isLocked(0)).to.equal(true);

        await vrfCoordinatorV2.fulfillRandomWords();

        expect(await betCoin.lockedAssets(player1.address)).to.equal(0);
        expect(await betCoin.lockedAssets(player2.address)).to.equal(0);
        expect(await betToken.isLocked(0)).to.equal(false);
        expect(await betCoin.balanceOf(player1.address)).to.equal(50);
        expect(await betToken.balanceOf(player1.address)).to.equal(1);
        expect(await betCoin.balanceOf(player2.address)).to.equal(0);
        expect(await betToken.balanceOf(player2.address)).to.equal(0);
        expect(await betToken.ownerOf(0)).to.equal(player1.address);
    });

    it('Should allow the owner to create a bet and reward the other player if they lose', async () => {
        const VRFCoordinatorV2 = await hre.ethers.getContractFactory('MockVRFCoordinatorV2');
        const Bet = await hre.ethers.getContractFactory('Bet');
        const [player1, player2] = await hre.ethers.getSigners();

        const vrfCoordinatorV2 = await VRFCoordinatorV2.deploy(1, 5678);
        const bet = await Bet.deploy(vrfCoordinatorV2.target, 1234);
        const betCoin = await hre.ethers.getContractAt('BetCoin', await bet.getBetCoinAddress());
        const betToken = await hre.ethers.getContractAt('BetToken', await bet.getBetTokenAddress());

        await betCoin.connect(player1).mint();
        await betToken.connect(player2).mint(player2.address);
        await bet.connect(player1).bet(0);

        expect(await betCoin.lockedAssets(player1.address)).to.equal(20);
        expect(await betCoin.lockedAssets(player2.address)).to.equal(0);
        expect(await betToken.isLocked(0)).to.equal(true);

        await vrfCoordinatorV2.fulfillRandomWords();

        expect(await betCoin.lockedAssets(player1.address)).to.equal(0);
        expect(await betCoin.lockedAssets(player2.address)).to.equal(0);
        expect(await betToken.isLocked(0)).to.equal(false);
        expect(await betCoin.balanceOf(player1.address)).to.equal(30);
        expect(await betToken.balanceOf(player1.address)).to.equal(0);
        expect(await betCoin.balanceOf(player2.address)).to.equal(20);
        expect(await betToken.balanceOf(player2.address)).to.equal(1);
        expect(await betToken.ownerOf(0)).to.equal(player2.address);
    });

    it('Should not allow the owner to create a bet if they do not have enough BetCoin', async () => {
        const VRFCoordinatorV2 = await hre.ethers.getContractFactory('MockVRFCoordinatorV2');
        const Bet = await hre.ethers.getContractFactory('Bet');
        const [player1, player2] = await hre.ethers.getSigners();

        const vrfCoordinatorV2 = await VRFCoordinatorV2.deploy(0, 5678);
        const bet = await Bet.deploy(vrfCoordinatorV2.target, 1234);
        const betToken = await hre.ethers.getContractAt('BetToken', await bet.getBetTokenAddress());

        await betToken.connect(player1).mint(player1.address);

        await expect(bet.connect(player2).bet(0)).to.be.revertedWith('You can\'t lock more assets than you have');
    });

    it('Should not allow the owner to bet on their own NFT', async () => {
        const VRFCoordinatorV2 = await hre.ethers.getContractFactory('MockVRFCoordinatorV2');
        const Bet = await hre.ethers.getContractFactory('Bet');
        const [player1, player2] = await hre.ethers.getSigners();

        const vrfCoordinatorV2 = await VRFCoordinatorV2.deploy(0, 5678);
        const bet = await Bet.deploy(vrfCoordinatorV2.target, 1234);
        const betCoin = await hre.ethers.getContractAt('BetCoin', await bet.getBetCoinAddress());
        const betToken = await hre.ethers.getContractAt('BetToken', await bet.getBetTokenAddress());

        await betCoin.connect(player1).mint();
        await betToken.connect(player1).mint(player1.address);

        await expect(bet.connect(player1).bet(0)).to.be.revertedWith('You can\'t bet on a token you own');
    });

    it('Should not allow the owner to bet on a non-existent NFT', async () => {
        const VRFCoordinatorV2 = await hre.ethers.getContractFactory('MockVRFCoordinatorV2');
        const Bet = await hre.ethers.getContractFactory('Bet');
        const [player1, player2] = await hre.ethers.getSigners();

        const vrfCoordinatorV2 = await VRFCoordinatorV2.deploy(0, 5678);
        const bet = await Bet.deploy(vrfCoordinatorV2.target, 1234);
        const betCoin = await hre.ethers.getContractAt('BetCoin', await bet.getBetCoinAddress());
        const betToken = await hre.ethers.getContractAt('BetToken', await bet.getBetTokenAddress());

        await betCoin.connect(player1).mint();
        await betToken.connect(player2).mint(player2.address);

        await expect(bet.connect(player1).bet(10)).to.be.reverted;
    });

    it('Should not allow a player to bet on an NFT that is already being bet on', async () => {
        const VRFCoordinatorV2 = await hre.ethers.getContractFactory('MockVRFCoordinatorV2');
        const Bet = await hre.ethers.getContractFactory('Bet');
        const [player1, player2, player3] = await hre.ethers.getSigners();

        const vrfCoordinatorV2 = await VRFCoordinatorV2.deploy(0, 5678);
        const bet = await Bet.deploy(vrfCoordinatorV2.target, 1234);
        const betCoin = await hre.ethers.getContractAt('BetCoin', await bet.getBetCoinAddress());
        const betToken = await hre.ethers.getContractAt('BetToken', await bet.getBetTokenAddress());

        await betCoin.connect(player1).mint();
        await betCoin.connect(player3).mint();
        await betToken.connect(player2).mint(player2.address);
        await bet.connect(player1).bet(0);

        await expect(bet.connect(player3).bet(0)).to.be.revertedWith('Asset already locked');
    });
});