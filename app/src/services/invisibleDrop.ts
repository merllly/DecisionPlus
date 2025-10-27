// InvisibleDrop contract service
import { ethers } from 'ethers';
import { getContractRead, getContractWrite, formatError, waitForTransaction } from '../utils/contracts';

// Airdrop configuration interface
export interface AirdropConfig {
  rewardToken: string;
  rewardPerUser: number;
  endTime: number;
  requireNFT: boolean;
  nftContract: string;
  requireToken: boolean;
  tokenContract: string;
  minTokenAmount: string;
}

// Airdrop information interface
export interface AirdropInfo {
  airdropper: string;
  rewardToken: string;
  rewardPerUser: number;
  isActive: boolean;
  endTime: number;
}

// Airdrop conditions interface
export interface AirdropConditions {
  requireNFT: boolean;
  nftContract: string;
  requireToken: boolean;
  tokenContract: string;
  minTokenAmount: string;
}

// User claim information interface
export interface UserClaimInfo {
  hasClaimed: boolean;
  claimTime: number;
}

// InvisibleDrop service class
export class InvisibleDropService {

  // Create airdrop
  static async createAirdrop(config: AirdropConfig) {
    try {
      const contract = await getContractWrite('InvisibleDrop');
      console.log("createAirdrop:",config);
      
      const tx = await contract.createAirdrop(
        config.rewardToken,
        config.rewardPerUser,
        config.endTime,
        config.requireNFT,
        config.nftContract,
        config.requireToken,
        config.tokenContract,
        ethers.parseEther(config.minTokenAmount)
      );

      console.log('Airdrop creation transaction submitted:', tx.hash);
      const receipt = await waitForTransaction(tx.hash);

      // Get airdrop ID from event
      const airdropCreatedEvent = receipt.logs?.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'AirdropCreated';
        } catch {
          return false;
        }
      });

      let airdropId = '0';
      if (airdropCreatedEvent) {
        const parsed = contract.interface.parseLog(airdropCreatedEvent);
        airdropId = parsed?.args[0]?.toString() || '0';
      }

      return {
        success: true,
        txHash: tx.hash,
        airdropId,
        message: `Airdrop created successfully! Airdrop ID: ${airdropId}`
      };
    } catch (error) {
      return {
        success: false,
        error: formatError(error)
      };
    }
  }

  // Check user eligibility
  static async checkEligibility(airdropId: number, userAddress: string): Promise<boolean> {
    try {
      const contract = getContractRead('InvisibleDrop');
      return await contract.checkEligibility(airdropId, userAddress);
    } catch (error) {
      console.error('Failed to check eligibility:', error);
      return false;
    }
  }

  // Check claimable amount
  static async checkClaimableAmount(airdropId: number, userAddress: string): Promise<number> {
    try {
      const contract = getContractRead('InvisibleDrop');
      const amount = await contract.checkClaimableAmount(airdropId, userAddress);
      return Number(amount);
    } catch (error) {
      console.error('Failed to check claimable amount:', error);
      return 0;
    }
  }

  // Claim reward
  static async claimReward(airdropId: number) {
    try {
      const contract = await getContractWrite('InvisibleDrop');

      const tx = await contract.claimReward(airdropId);
      console.log('Reward claim transaction submitted:', tx.hash);

      await waitForTransaction(tx.hash);

      return {
        success: true,
        txHash: tx.hash,
        message: 'Reward claimed successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: formatError(error)
      };
    }
  }

  // Get airdrop information
  static async getAirdropInfo(airdropId: number): Promise<AirdropInfo | null> {
    try {
      const contract = getContractRead('InvisibleDrop');
      const info = await contract.getAirdropInfo(airdropId);

      return {
        airdropper: info[0],
        rewardToken: info[1],
        rewardPerUser: Number(info[2]),
        isActive: info[3],
        endTime: Number(info[4])
      };
    } catch (error) {
      console.error('Failed to get airdrop info:', error);
      return null;
    }
  }

  // Get airdrop conditions
  static async getAirdropConditions(airdropId: number): Promise<AirdropConditions | null> {
    try {
      const contract = getContractRead('InvisibleDrop');
      const conditions = await contract.getAirdropConditions(airdropId);

      return {
        requireNFT: conditions[0],
        nftContract: conditions[1],
        requireToken: conditions[2],
        tokenContract: conditions[3],
        minTokenAmount: ethers.formatEther(conditions[4])
      };
    } catch (error) {
      console.error('Failed to get airdrop conditions:', error);
      return null;
    }
  }

  // Get user claim information
  static async getUserClaimInfo(airdropId: number, userAddress: string): Promise<UserClaimInfo | null> {
    try {
      const contract = getContractRead('InvisibleDrop');
      const claimInfo = await contract.getUserClaimInfo(airdropId, userAddress);

      return {
        hasClaimed: claimInfo[0],
        claimTime: Number(claimInfo[1])
      };
    } catch (error) {
      console.error('Failed to get user claim info:', error);
      return null;
    }
  }

  // Get airdrop count
  static async getAirdropCount(): Promise<number> {
    try {
      const contract = getContractRead('InvisibleDrop');
      const count = await contract.airdropCount();
      return Number(count);
    } catch (error) {
      console.error('Failed to get airdrop count:', error);
      return 0;
    }
  }

}