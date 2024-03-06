require("@nomicfoundation/hardhat-toolbox");

const SEPOLIA_API_KEY = vars.get("SEPOLIA_API_KEY");
const BET_OWNER_PRIVATE_KEY = vars.get("BET_OWNER_PRIVATE_KEY");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/' + SEPOLIA_API_KEY,
      accounts: [BET_OWNER_PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: vars.get("ETHERSCAN_API_KEY")
  }
};
