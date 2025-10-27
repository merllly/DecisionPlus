import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("mint-test-token", "Mint TestToken tokens")
  .addParam("to", "The address to mint tokens to")
  .addParam("amount", "The amount to mint")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { to, amount } = taskArgs;

    // Get the deployed contract
    const testTokenAddress = "0xD6e81e78930259e66a2f4b363D84a6Ec0BeCd2c6";
    const TestToken = await hre.ethers.getContractFactory("TestToken");
    const testToken = TestToken.attach(testTokenAddress);

    console.log(`Minting ${amount} TestToken tokens to ${to}...`);

    const tx = await testToken.mint(to, hre.ethers.parseEther(amount));
    await tx.wait();

    console.log(`✅ Minted ${amount} TestToken tokens to ${to}`);
    console.log(`Transaction hash: ${tx.hash}`);
  });

task("mint-test-nft", "Mint TestNFT tokens")
  .addParam("to", "The address to mint NFT to")
  .addParam("uri", "The token URI for the NFT", "https://example.com/token/")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { to, uri } = taskArgs;

    // Get the deployed contract
    const testNFTAddress = "0x37914fAD5322Df6e701Be562BC9aff90F5fE928D";
    const TestNFT = await hre.ethers.getContractFactory("TestNFT");
    const testNFT = TestNFT.attach(testNFTAddress);

    console.log(`Minting TestNFT to ${to} with URI ${uri}...`);

    const tx = await testNFT.mint(to, uri);
    const receipt = await tx.wait();

    // Get the token ID from the transfer event
    const transferEvent = receipt?.logs?.find((log: any) => {
      try {
        return testNFT.interface.parseLog(log)?.name === 'Transfer';
      } catch {
        return false;
      }
    });

    let tokenId = "Unknown";
    if (transferEvent) {
      const parsedEvent = testNFT.interface.parseLog(transferEvent);
      tokenId = parsedEvent?.args[2]?.toString();
    }

    console.log(`✅ Minted TestNFT #${tokenId} to ${to}`);
    console.log(`Transaction hash: ${tx.hash}`);
  });

task("check-test-token-balance", "Check TestToken balance")
  .addParam("address", "The address to check balance for")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { address } = taskArgs;

    const testTokenAddress = "0xD6e81e78930259e66a2f4b363D84a6Ec0BeCd2c6";
    const TestToken = await hre.ethers.getContractFactory("TestToken");
    const testToken = TestToken.attach(testTokenAddress);

    const balance = await testToken.balanceOf(address);
    console.log(`💰 TestToken balance for ${address}: ${hre.ethers.formatEther(balance)} TEST`);
  });

task("check-test-nft-balance", "Check TestNFT balance and owned tokens")
  .addParam("address", "The address to check balance for")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { address } = taskArgs;

    const testNFTAddress = "0x37914fAD5322Df6e701Be562BC9aff90F5fE928D";
    const TestNFT = await hre.ethers.getContractFactory("TestNFT");
    const testNFT = TestNFT.attach(testNFTAddress);

    const balance = await testNFT.balanceOf(address);
    console.log(`🎨 TestNFT balance for ${address}: ${balance.toString()} NFTs`);

    if (balance > 0) {
      console.log("Owned token IDs:");
      for (let i = 0; i < Number(balance); i++) {
        const tokenId = await testNFT.tokenOfOwnerByIndex(address, i);
        const tokenURI = await testNFT.tokenURI(tokenId);
        console.log(`  - Token ID: ${tokenId}, URI: ${tokenURI}`);
      }
    }
  });

task("test-tokens-info", "Get information about deployed test token contracts")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const testTokenAddress = "0xD6e81e78930259e66a2f4b363D84a6Ec0BeCd2c6";
    const testNFTAddress = "0x37914fAD5322Df6e701Be562BC9aff90F5fE928D";

    const TestToken = await hre.ethers.getContractFactory("TestToken");
    const TestNFT = await hre.ethers.getContractFactory("TestNFT");

    const testToken = TestToken.attach(testTokenAddress);
    const testNFT = TestNFT.attach(testNFTAddress);

    console.log("📋 Test Token Contract Information:");
    console.log(`TestToken Address: ${testTokenAddress}`);
    console.log(`TestToken Name: ${await testToken.name()}`);
    console.log(`TestToken Symbol: ${await testToken.symbol()}`);
    console.log(`TestToken Total Supply: ${hre.ethers.formatEther(await testToken.totalSupply())} TEST`);

    console.log(`\nTestNFT Address: ${testNFTAddress}`);
    console.log(`TestNFT Name: ${await testNFT.name()}`);
    console.log(`TestNFT Symbol: ${await testNFT.symbol()}`);
  });