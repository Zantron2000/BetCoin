/**
 * Gets the wager info for a specific NFT
 *
 * @param {Object} contract The viem contract instance of the Bet contract
 * @param {String} tokenId The id of the token to get the wager info for
 * @returns {Promise<{
 *   wager: Number
* }?>} The wager info for the token or null if there was an error
 */
export const getWagerInfo = async (contract, tokenId) => {
    try {
        const [wager] = await Promise.all([
            contract.read.getBetCost([tokenId]),
        ]);

        return {
            wager,
        }
    } catch (error) {
        console.error(error);

        return null;
    }
}

/**
 * Makes a bet on a specific NFT
 *
 * @param {Object} contract The viem contract instance of the Bet contract
 * @param {String} tokenId The id of the token to bet on
 * @returns {Promise<String?>} The transaction hash of the bet or null if there was an error
 */
export const bet = async (contract, tokenId) => {
    try {
        const [tx] = await Promise.all([
            contract.write.bet([tokenId]),
        ]);

        return tx;
    } catch (error) {
        console.error(error);

        return null;
    }
}