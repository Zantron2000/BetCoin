import axios from 'axios';

const getNFTsForOwnerRoute = `https://eth-sepolia.g.alchemy.com/nft/v3/${import.meta.env.VITE_ALCHEMY_API_KEY}/getNFTsForOwner?owner=$owner&contractAddresses[]=${import.meta.env.VITE_BET_TOKEN_CONTRACT_ADDRESS}&withMetadata=false`;

const getOwnersForContractRoute = `https://eth-sepolia.g.alchemy.com/nft/v3/${import.meta.env.VITE_ALCHEMY_API_KEY}/getOwnersForContract?contractAddress=${import.meta.env.VITE_BET_TOKEN_CONTRACT_ADDRESS}&withTokenBalances=true`

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
