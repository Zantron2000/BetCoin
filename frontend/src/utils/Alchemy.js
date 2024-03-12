import axios from 'axios';

// The alchemy route for getting the NFTs for a specific owner
const getNFTsForOwnerRoute = `https://eth-sepolia.g.alchemy.com/nft/v3/${import.meta.env.VITE_ALCHEMY_API_KEY}/getNFTsForOwner?owner=$owner&contractAddresses[]=${import.meta.env.VITE_BET_TOKEN_CONTRACT_ADDRESS}&withMetadata=false`;

// The alchemy route for getting the owners for a specific contract
const getOwnersForContractRoute = `https://eth-sepolia.g.alchemy.com/nft/v3/${import.meta.env.VITE_ALCHEMY_API_KEY}/getOwnersForContract?contractAddress=${import.meta.env.VITE_BET_TOKEN_CONTRACT_ADDRESS}&withTokenBalances=true`

/**
 * Get the BetToken NFTs for a specific owner
 *
 * @param {String} ownerAddress The address of the owner
 * @returns {Promise<{
 *   totalCount: Number,
*   nfts: {
*     tokenId: Number
*   }[]
* }?>} The NFTs for the owner or null if there was an error
 */
export const getNFTsForOwner = async (ownerAddress) => {
    try {
        const { data } = await axios.get(getNFTsForOwnerRoute.replace('$owner', ownerAddress));

        return {
            totalCount: data.totalCount,
            nfts: data.ownedNfts.map(({ tokenId }) => ({ tokenId }))
        }
    } catch (error) {
        console.error(error);

        return null;
    }
}

/**
 * Gets all NFTs and Owners for the BetToken contract
 *
 * @returns {Promise<{
 *   tokenId: Number,
*   owner: String
* }[]?>} The owners of the NFT contract or null if there was an error
 */
export const getOwnersForContract = async () => {
    try {
        const { data } = await axios.get(getOwnersForContractRoute);

        const formattedData = data.owners.map(({ ownerAddress, tokenBalances }) => {
            return tokenBalances.map(({ tokenId }) => ({
                tokenId,
                owner: ownerAddress,
            }));
        }).flat();

        return formattedData.sort((token1, token2) => Number(token1.tokenId) - Number(token2.tokenId));
    } catch (error) {
        console.error(error);

        return null;
    }
}
