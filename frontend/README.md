# Frontend

The website for the Bet contracts. Currently has the following pages:
1. Home Page - The home page for users, meant for those not signed in / to enter the app
2. Profile Page - The profile page, where users can see their balance and all owned NFTs
3. Minting Page - The mintings pages, to mint ERC20 and ERC721 tokens
4. Steal Page - The listings page, where one can see all NFTs, and steal them from other players

## Deployment
In order to deploy the frontend, one must fill out a .env file, filling out the ENV variables.
VITE_PROJECT_ID is the WalletConnect project ID, and VITE_ALCHEMY_API_KEY is the Sepolia testnet
Alchemy API Key. Then create a folder called /abi, and create the following files:
1. Bet.json - The ABI for the Bet Contract
2. BetCoin.json - The ABI for the BetCoin Contract
3. BetToken.json -  The ABI for the BetToken Contract
Then you can run npm run dev.

## Improvements
There are a lot of improvements that can be made
1. Improved UI/UX design
2. Mobile Design
3. Correctly identify NFTs that can't be bet on
4. Safe checking on transactions and API calls
5. XMTP communications? (Not sure how this would work if NFTs can change owners)
6. More efficient calls to contracts, batching calls together
