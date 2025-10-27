import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy ConfidentialCoin1
  const deployedCoin1 = await deploy("ConfidentialCoin1", {
    from: deployer,
    log: true,
  });
  console.log(`ConfidentialCoin1 contract: `, deployedCoin1.address);

  // Deploy ConfidentialCoin2
  const deployedCoin2 = await deploy("ConfidentialCoin2", {
    from: deployer,
    log: true,
  });
  console.log(`ConfidentialCoin2 contract: `, deployedCoin2.address);

  // Deploy TestToken
  const deployedTestToken = await deploy("TestToken", {
    from: deployer,
    args: ["Test Token", "TEST", 1000000], // name, symbol, initialSupply
    log: true,
  });
  console.log(`TestToken contract: `, deployedTestToken.address);

  // Deploy TestNFT
  const deployedTestNFT = await deploy("TestNFT", {
    from: deployer,
    args: ["Test NFT", "TNFT"], // name, symbol
    log: true,
  });
  console.log(`TestNFT contract: `, deployedTestNFT.address);

  // Deploy InvisibleDrop (main contract)
  const deployedInvisibleDrop = await deploy("InvisibleDrop", {
    from: deployer,
    args: [], // No constructor arguments needed
    log: true,
  });
  console.log(`InvisibleDrop contract: `, deployedInvisibleDrop.address);

  // Output all addresses for easy copying
  console.log("\n📋 Deployed Contract Addresses:");
  console.log("================================");
  console.log(`ConfidentialCoin1: ${deployedCoin1.address}`);
  console.log(`ConfidentialCoin2: ${deployedCoin2.address}`);
  console.log(`TestToken: ${deployedTestToken.address}`);
  console.log(`TestNFT: ${deployedTestNFT.address}`);
  console.log(`InvisibleDrop: ${deployedInvisibleDrop.address}`);

  // Save addresses to a JSON file for reference
  const addresses = {
    ConfidentialCoin1: deployedCoin1.address,
    ConfidentialCoin2: deployedCoin2.address,
    TestToken: deployedTestToken.address,
    TestNFT: deployedTestNFT.address,
    InvisibleDrop: deployedInvisibleDrop.address
  };

  const fs = require('fs');
  const path = require('path');

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Get network name
  const networkName = hre.network.name;
  const addressesPath = path.join(deploymentsDir, `${networkName}.json`);

  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log(`\n💾 Addresses saved to: ${addressesPath}`);

  // Update task files if deploying to sepolia
  if (networkName === 'sepolia') {
    try {
      const updateTaskAddresses = require('../scripts/updateTaskAddresses.js');
      updateTaskAddresses(addresses);
    } catch (error: any) {
      console.log('⚠️  Could not update task addresses automatically:', error.message);
      console.log('Please update task files manually with the new addresses.');
    }
  }
};
export default func;
func.id = "deploy_all_contracts"; // id required to prevent reexecution
func.tags = ["All"];
