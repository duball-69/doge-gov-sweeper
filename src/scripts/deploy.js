const hre = require("hardhat");

async function main() {
  // Compile the contract
  await hre.run("compile");

  // Get the contract to deploy
  const TrumpSweeperBank = await hre.ethers.getContractFactory("TrumpSweeperBank");

  // Deploy and wait for the contract to be deployed
  const trumpSweeperBank = await TrumpSweeperBank.deploy();
  await trumpSweeperBank.waitForDeployment();

  console.log("TrumpSweeperBank deployed to:", trumpSweeperBank.target); // Use `target` instead of `address`
}

// Execute the deployment
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
