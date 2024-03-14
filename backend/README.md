# Backend

The Bet contracts. There are three different contracts:
1. BetCoin - The ERC20 Token, used to bet on NFTs
2. BetToken - The ERC721 Token, NFTs to be bet on and kept as prizes
3. Bet - The main contract, manages the two ERC Token Contracts, allows users to bet on NFTs

The Bet contract uses Chainlink's VRF to allow users to bet securely. There is currently a 1/3 chance to win a bet,
which always costs 20 BetCoins. This should be modified and fixed later.

## Deployment
There are a few steps to follow for deployment to the sepolia testnet. When a contract is ready to be deployed, do the following:
1. Fill the required hardhat variables
2. Check scripts/deploy.js, and ensure the right coordinator address and subscription ID are provided (Chainlink Values)
3. npm run compile
4. npm run deploy:sepolia
5. npm run verify:sepolia (Bet Contract Address) (Coordinator Address) (subscription ID)
6. Add the Bet Contract address to the Sepolia Chainlink VRF as 

## Improvements
There are a few improvements that can be made on these contracts
1. BetCoin's balanceOf should be overridden to reflect a user's non-locked balance
2. BetToken should have some way to distinquish rarity, perhaps by the NFT number? Should effect bet amount
3. BetToken NFTs should be safe until their time has run up, currently does not do this, nor checks this as a requirement
4. BetToken & BetCoin allow users to unlock their assets after a given amount of time in case something goes wrong

## Hardhat Variables
There are a few required variables to run the backend
1. SEPOLIA_API_KEY - The Alchemy API key to access the Sepolia test network
2. BET_OWNER_PRIVATE_KEY - The Private Key of the owner of the Bet contract
3. ETHERSCAN_API_KEY - The Etherscan API key to verify the contract
4. SUB_ID - The Chainlink Subscription ID to use for the VRF
