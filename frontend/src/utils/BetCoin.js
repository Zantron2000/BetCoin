export const getAccountInfo = async (contract, address) => {
    try {
        const [balance, unlock] = await Promise.all([
            contract.read.balanceOf([address]),
            contract.read.mintUnlocksAt([address]),
        ]);

        return {
            balance,
            unlock,
        }
    } catch (error) {
        console.error(error);

        return null;
    }
}

export const mint = async (contract) => {
    try {
        const transactionHash = await contract.write.mint();

        return transactionHash;
    } catch (error) {
        console.error(error);
    }
}