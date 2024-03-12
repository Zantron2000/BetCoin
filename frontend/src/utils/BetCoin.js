/**
 * Gets the account info for a specific address in the BetCoin contract
 *
 * @param {Object} contract The viem contract instance of the BetCoin contract
 * @param {String} address The address of the account to get the info for
 * @returns {Promise<{
 *   balance: String,
 *   unlock: String
 * }?>} The account info or null if there was an error
 */
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

/**
 * Starts a transaction to mint coins from the BetCoin contract
 *
 * @param {Object} contract The viem contract instance of the BetCoin contract
 * @returns {Promise<String?>} The transaction hash of the mint or null if there was an error
 */
export const mint = async (contract) => {
    try {
        const transactionHash = await contract.write.mint();

        return transactionHash;
    } catch (error) {
        console.error(error);
    }
}