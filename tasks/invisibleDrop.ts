import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("create-airdrop", "Create a new airdrop")
  .addParam("rewardToken", "The reward token contract address")
  .addParam("rewardPerUser", "The reward amount per user")
  .addParam("endTime", "The end time (unix timestamp)")
  .addOptionalParam("requireNft", "Require NFT ownership (true/false)", "false")
  .addOptionalParam("nftContract", "NFT contract address", "0x0000000000000000000000000000000000000000")
  .addOptionalParam("requireToken", "Require token ownership (true/false)", "false")
  .addOptionalParam("tokenContract", "Token contract address", "0x0000000000000000000000000000000000000000")
  .addOptionalParam("minTokenAmount", "Minimum token amount required", "0")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const {
      rewardToken,
      rewardPerUser,
      endTime,
      requireNft,
      nftContract,
      requireToken,
      tokenContract,
      minTokenAmount,
    } = taskArgs;

    const invisibleDropAddress = "0x106F22a583E2e452BD3410851CBeA9DB025fB438";
    const InvisibleDrop = await hre.ethers.getContractFactory("InvisibleDrop");
    const invisibleDrop = InvisibleDrop.attach(invisibleDropAddress);

    console.log("Creating new airdrop...");
    console.log(`Reward Token: ${rewardToken}`);
    console.log(`Reward Per User: ${rewardPerUser}`);
    console.log(`End Time: ${endTime}`);
    console.log(`Require NFT: ${requireNft}`);
    console.log(`NFT Contract: ${nftContract}`);
    console.log(`Require Token: ${requireToken}`);
    console.log(`Token Contract: ${tokenContract}`);
    console.log(`Min Token Amount: ${minTokenAmount}`);

    const tx = await invisibleDrop.createAirdrop(
      rewardToken,
      rewardPerUser,
      endTime,
      requireNft === "true",
      nftContract,
      requireToken === "true",
      tokenContract,
      hre.ethers.parseEther(minTokenAmount)
    );

    const receipt = await tx.wait();

    // Get airdrop ID from event logs
    const airdropCreatedEvent = receipt?.logs?.find((log: any) => {
      try {
        return invisibleDrop.interface.parseLog(log)?.name === 'AirdropCreated';
      } catch {
        return false;
      }
    });

    let airdropId = "Unknown";
    if (airdropCreatedEvent) {
      const parsedEvent = invisibleDrop.interface.parseLog(airdropCreatedEvent);
      airdropId = parsedEvent?.args[0]?.toString();
    }

    console.log(`✅ Airdrop created with ID: ${airdropId}`);
    console.log(`Transaction hash: ${tx.hash}`);
  });

task("check-eligibility", "Check if user is eligible for airdrop")
  .addParam("airdropId", "The airdrop ID")
  .addParam("user", "The user address to check")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { airdropId, user } = taskArgs;

    const invisibleDropAddress = "0x106F22a583E2e452BD3410851CBeA9DB025fB438";
    const InvisibleDrop = await hre.ethers.getContractFactory("InvisibleDrop");
    const invisibleDrop = InvisibleDrop.attach(invisibleDropAddress);

    console.log(`Checking eligibility for user ${user} in airdrop ${airdropId}...`);

    const isEligible = await invisibleDrop.checkEligibility(airdropId, user);

    console.log(`User ${user} is ${isEligible ? "✅ eligible" : "❌ not eligible"} for airdrop ${airdropId}`);
  });

task("check-claimable", "Check claimable amount for user")
  .addParam("airdropId", "The airdrop ID")
  .addParam("user", "The user address to check")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { airdropId, user } = taskArgs;

    const invisibleDropAddress = "0x106F22a583E2e452BD3410851CBeA9DB025fB438";
    const InvisibleDrop = await hre.ethers.getContractFactory("InvisibleDrop");
    const invisibleDrop = InvisibleDrop.attach(invisibleDropAddress);

    console.log(`Checking claimable amount for user ${user} in airdrop ${airdropId}...`);

    const claimableAmount = await invisibleDrop.checkClaimableAmount(airdropId, user);

    console.log(`User ${user} can claim ${claimableAmount} tokens from airdrop ${airdropId}`);
  });

task("claim-reward", "Claim airdrop reward")
  .addParam("airdropId", "The airdrop ID")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { airdropId } = taskArgs;
    await hre.fhevm.initializeCLIApi()
    const invisibleDropAddress = "0x106F22a583E2e452BD3410851CBeA9DB025fB438";
    const InvisibleDrop = await hre.ethers.getContractFactory("InvisibleDrop");
    const invisibleDrop = InvisibleDrop.attach(invisibleDropAddress);

    const [signer] = await hre.ethers.getSigners();
    console.log(`Claiming reward for airdrop ${airdropId} with address ${signer.address}...`);

    const tx = await invisibleDrop.claimReward(airdropId);
    await tx.wait();

    console.log(`✅ Successfully claimed reward from airdrop ${airdropId}`);
    console.log(`Transaction hash: ${tx.hash}`);
  });

task("deposit-rewards", "Deposit rewards to airdrop")
  .addParam("airdropId", "The airdrop ID")
  .addParam("amount", "The amount to deposit")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { airdropId, amount } = taskArgs;
    await hre.fhevm.initializeCLIApi();

    const invisibleDropAddress = "0x106F22a583E2e452BD3410851CBeA9DB025fB438";
    const InvisibleDrop = await hre.ethers.getContractFactory("InvisibleDrop");
    const invisibleDrop = InvisibleDrop.attach(invisibleDropAddress);

    const [signer] = await hre.ethers.getSigners();
    console.log(`Depositing ${amount} rewards to airdrop ${airdropId} from ${signer.address}...`);

    // Create encrypted input
    const input = hre.fhevm.createEncryptedInput(invisibleDropAddress, signer.address);
    input.add64(BigInt(amount));
    const encryptedInput = await input.encrypt();

    const tx = await invisibleDrop.depositRewards(
      airdropId,
      encryptedInput.handles[0],
      encryptedInput.inputProof
    );
    await tx.wait();

    console.log(`✅ Successfully deposited ${amount} rewards to airdrop ${airdropId}`);
    console.log(`Transaction hash: ${tx.hash}`);
  });

task("airdrop-info", "Get airdrop information")
  .addParam("airdropId", "The airdrop ID")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { airdropId } = taskArgs;

    const invisibleDropAddress = "0x106F22a583E2e452BD3410851CBeA9DB025fB438";
    const InvisibleDrop = await hre.ethers.getContractFactory("InvisibleDrop");
    const invisibleDrop = InvisibleDrop.attach(invisibleDropAddress);

    console.log(`Getting information for airdrop ${airdropId}...`);

    const airdropInfo = await invisibleDrop.getAirdropInfo(airdropId);
    const conditions = await invisibleDrop.getAirdropConditions(airdropId);

    console.log(`📋 Airdrop ${airdropId} Information:`);
    console.log(`Airdropper: ${airdropInfo[0]}`);
    console.log(`Reward Token: ${airdropInfo[1]}`);
    console.log(`Reward Per User: ${airdropInfo[2]}`);
    console.log(`Is Active: ${airdropInfo[3]}`);
    console.log(`End Time: ${new Date(Number(airdropInfo[4]) * 1000).toLocaleString()}`);

    console.log(`\n🎯 Conditions:`);
    console.log(`Require NFT: ${conditions[0]}`);
    console.log(`NFT Contract: ${conditions[1]}`);
    console.log(`Require Token: ${conditions[2]}`);
    console.log(`Token Contract: ${conditions[3]}`);
    console.log(`Min Token Amount: ${hre.ethers.formatEther(conditions[4])} tokens`);
  });

task("user-claim-info", "Get user claim information")
  .addParam("airdropId", "The airdrop ID")
  .addParam("user", "The user address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { airdropId, user } = taskArgs;

    const invisibleDropAddress = "0x106F22a583E2e452BD3410851CBeA9DB025fB438";
    const InvisibleDrop = await hre.ethers.getContractFactory("InvisibleDrop");
    const invisibleDrop = InvisibleDrop.attach(invisibleDropAddress);

    console.log(`Getting claim information for user ${user} in airdrop ${airdropId}...`);

    const claimInfo = await invisibleDrop.getUserClaimInfo(airdropId, user);

    console.log(`👤 User ${user} Claim Info for Airdrop ${airdropId}:`);
    console.log(`Has Claimed: ${claimInfo[0]}`);
    console.log(`Claim Time: ${claimInfo[1] > 0 ? new Date(Number(claimInfo[1]) * 1000).toLocaleString() : "Not claimed yet"}`);
  });

task("invisibleDrop-info", "Get InvisibleDrop contract information")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const invisibleDropAddress = "0x106F22a583E2e452BD3410851CBeA9DB025fB438";
    const InvisibleDrop = await hre.ethers.getContractFactory("InvisibleDrop");
    const invisibleDrop = InvisibleDrop.attach(invisibleDropAddress);

    const airdropCount = await invisibleDrop.airdropCount();

    console.log("📋 InvisibleDrop Contract Information:");
    console.log(`Contract Address: ${invisibleDropAddress}`);
    console.log(`Total Airdrops Created: ${airdropCount}`);

    if (airdropCount > 0) {
      console.log("\n🎁 Existing Airdrops:");
      for (let i = 0; i < Number(airdropCount); i++) {
        try {
          const airdropInfo = await invisibleDrop.getAirdropInfo(i);
          console.log(`  Airdrop ${i}: Active: ${airdropInfo[3]}, Reward: ${airdropInfo[2]}, Token: ${airdropInfo[1]}`);
        } catch (error) {
          console.log(`  Airdrop ${i}: Error retrieving info`);
        }
      }
    }
  });