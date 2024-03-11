export const getAccountInfo = async (contract, address) => {
    try {
        const [balance] = await Promise.all([
            contract.read.balanceOf([address]),
        ]);

        return {
            balance,
        }
    } catch (error) {
        console.error(error);

        return null;
    }
}

export const getTokenInfo = async (contract, tokenId) => {
    try {
        const [owner] = await Promise.all([
            contract.read.ownerOf([tokenId]),
        ]);

        return {
            owner,
        }
    } catch (error) {
        console.error(error);

        return null;
    }
}

export const mint = async (contract, address) => {
    try {
        const transactionHash = await contract.write.mint([address]);

        return transactionHash;
    } catch (error) {
        console.error(error);

        return null;
    }
}