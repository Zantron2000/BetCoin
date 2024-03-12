/**
 * Gets the account info for a specific address for the BetToken contract
 * 
 * @param {Object} contract The viem contract instance of the BetToken contract
 * @param {String} address The address of the account to get the info for
 * @returns {Promise<{
 *   balance: Number
* }?>} The account info or null if there was an error
 */
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

/**
 * Gets the token info for a specific NFT
 *
 * @param {Object} contract The viem contract instance of the BetToken contract
 * @param {String} tokenId The id of the token to get the info for
 * @returns {Promise<{
 *   owner: String
* }?>} The token info or null if there was an error
 */
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

/**
 * Starts a transaction to mint an NFT for a specific address
 * 
 * @param {Object} contract The viem contract instance of the BetToken contract
 * @param {String} address The address of the account to mint the token for
 * @returns {Promise<String?>} The transaction hash of the mint or null if there was an error
 */
export const mint = async (contract, address) => {
    try {
        const transactionHash = await contract.write.mint([address]);

        return transactionHash;
    } catch (error) {
        console.error(error);

        return null;
    }
}