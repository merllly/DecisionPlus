import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("check-sepolia-config", "Check Sepolia deployment configuration")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log("🔍 Checking Sepolia deployment configuration...\n");

    // Check environment variables
    const privateKey = process.env.PRIVATE_KEY;
    const infuraKey = process.env.INFURA_API_KEY;
    const etherscanKey = process.env.ETHERSCAN_API_KEY;

    console.log("📋 Environment Variables:");
    console.log(`PRIVATE_KEY: ${privateKey ? "✅ Set" : "❌ Missing"}`);
    console.log(`INFURA_API_KEY: ${infuraKey ? "✅ Set" : "❌ Missing"}`);
    console.log(`ETHERSCAN_API_KEY: ${etherscanKey ? "✅ Set" : "❌ Missing"}`);

    if (!privateKey) {
      console.log("\n⚠️  Please set PRIVATE_KEY in your .env file");
      return;
    }

    if (!infuraKey) {
      console.log("\n⚠️  Please set INFURA_API_KEY in your .env file");
      return;
    }

    // Check account balance on Sepolia
    try {
      const provider = hre.ethers.getDefaultProvider(`https://sepolia.infura.io/v3/${infuraKey}`);
      const wallet = new hre.ethers.Wallet(privateKey, provider);
      const balance = await provider.getBalance(wallet.address);

      console.log(`\n💰 Account Information:`);
      console.log(`Address: ${wallet.address}`);
      console.log(`Balance: ${hre.ethers.formatEther(balance)} SepoliaETH`);

      if (balance < hre.ethers.parseEther("0.01")) {
        console.log("\n⚠️  Warning: Low balance. You need SepoliaETH to deploy contracts.");
        console.log("Get free SepoliaETH from: https://faucet.sepolia.dev/");
      } else {
        console.log("✅ Sufficient balance for deployment");
      }

      console.log("\n🚀 Ready to deploy! Run: npx hardhat deploy --network sepolia");

    } catch (error: any) {
      console.log(`\n❌ Error checking account: ${error.message}`);
      console.log("Please check your PRIVATE_KEY and INFURA_API_KEY");
    }
  });

task("deploy-sepolia", "Deploy contracts to Sepolia and verify")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log("🚀 Deploying contracts to Sepolia...\n");

    // Run deployment
    await hre.run("deploy", { network: "sepolia" });

    // If ETHERSCAN_API_KEY is set, offer to verify contracts
    if (process.env.ETHERSCAN_API_KEY) {
      console.log("\n🔍 Etherscan API key found. You can verify contracts manually using:");
      console.log("npx hardhat verify --network sepolia <CONTRACT_ADDRESS> [constructor_args]");
    } else {
      console.log("\n⚠️  Set ETHERSCAN_API_KEY in .env to enable contract verification");
    }
  });

task("verify-contract", "Verify a contract on Etherscan")
  .addParam("address", "The contract address to verify")
  .addParam("contract", "The contract name (e.g., ConfidentialCoin1)")
  .addOptionalParam("args", "Constructor arguments (comma-separated)")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { address, contract, args } = taskArgs;

    if (!process.env.ETHERSCAN_API_KEY) {
      console.log("❌ ETHERSCAN_API_KEY not set in .env file");
      return;
    }

    try {
      console.log(`🔍 Verifying ${contract} at ${address}...`);

      const constructorArgs = args ? args.split(',').map((arg: string) => arg.trim()) : [];

      await hre.run("verify:verify", {
        address: address,
        constructorArguments: constructorArgs,
      });

      console.log(`✅ ${contract} verified successfully!`);
    } catch (error: any) {
      console.log(`❌ Verification failed: ${error.message}`);
    }
  });