const hre = require("hardhat");
const { vars } = require("hardhat/config");

async function main() {
  const VRF_COORDINATOR_ADDRESS = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625";
  const SUB_ID = vars.get("SUB_ID");

  const bet = await hre.ethers.deployContract("Bet", [VRF_COORDINATOR_ADDRESS, SUB_ID]);

  await bet.waitForDeployment();

  console.log(
    `Deployed to ${bet.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
