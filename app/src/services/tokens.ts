// Token contract service
import { ethers } from 'ethers';
import { getContractRead, getContractWrite, formatError, waitForTransaction } from '../utils/contracts';
import { CONTRACT_ADDRESSES } from '../contracts/contracts';

// Token service class
export class TokenService {

  // Mint TestToken
  static async mintTestToken(to: string, amount: string) {
    try {
      const contract = await getContractWrite('TestToken');

      const tx = await contract.mint(to, ethers.parseEther(amount));
      console.log('TestToken minting transaction submitted:', tx.hash);

      await waitForTransaction(tx.hash);

      return {
        success: true,
        txHash: tx.hash,
        message: `Successfully minted ${amount} TestToken`
      };
    } catch (error) {
      return {
        success: false,
        error: formatError(error)
      };
    }
  }

  // Mint TestNFT
  static async mintTestNFT(to: string, uri: string) {
    try {
      const contract = await getContractWrite('TestNFT');

      const tx = await contract.mint(to, uri);
      console.log('TestNFT minting transaction submitted:', tx.hash);

      const receipt = await waitForTransaction(tx.hash);

      // Get Token ID from event
      const transferEvent = receipt.logs?.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'Transfer';
        } catch {
          return false;
        }
      });

      let tokenId = '0';
      if (transferEvent) {
        const parsed = contract.interface.parseLog(transferEvent);
        tokenId = parsed?.args[2]?.toString() || '0';
      }

      return {
        success: true,
        txHash: tx.hash,
        tokenId,
        message: `Successfully minted TestNFT #${tokenId}`
      };
    } catch (error) {
      return {
        success: false,
        error: formatError(error)
      };
    }
  }

  // Mint ConfidentialCoin1
  static async mintConfidentialCoin1(to: string, amount: number) {
    try {
      const contract = await getContractWrite('ConfidentialCoin1');

      const tx = await contract.mint(to, amount);
      console.log('ConfidentialCoin1 minting transaction submitted:', tx.hash);

      await waitForTransaction(tx.hash);

      return {
        success: true,
        txHash: tx.hash,
        message: `Successfully minted ${amount} ConfidentialCoin1`
      };
    } catch (error) {
      return {
        success: false,
        error: formatError(error)
      };
    }
  }

  // Mint ConfidentialCoin2
  static async mintConfidentialCoin2(to: string, amount: number) {
    try {
      const contract = await getContractWrite('ConfidentialCoin2');

      const tx = await contract.mint(to, amount);
      console.log('ConfidentialCoin2 minting transaction submitted:', tx.hash);

      await waitForTransaction(tx.hash);

      return {
        success: true,
        txHash: tx.hash,
        message: `Successfully minted ${amount} ConfidentialCoin2`
      };
    } catch (error) {
      return {
        success: false,
        error: formatError(error)
      };
    }
  }

  // Get TestToken balance
  static async getTestTokenBalance(address: string): Promise<string> {
    try {
      const contract = getContractRead('TestToken');
      const balance = await contract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get TestToken balance:', error);
      return '0';
    }
  }

  // Get TestNFT balance
  static async getTestNFTBalance(address: string): Promise<number> {
    try {
      const contract = getContractRead('TestNFT');
      const balance = await contract.balanceOf(address);
      return Number(balance);
    } catch (error) {
      console.error('Failed to get TestNFT balance:', error);
      return 0;
    }
  }

  // Get user's TestNFT list
  static async getUserTestNFTs(address: string): Promise<Array<{tokenId: string, uri: string}>> {
    try {
      const contract = getContractRead('TestNFT');
      const balance = await contract.balanceOf(address);
      const nfts = [];

      for (let i = 0; i < Number(balance); i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(address, i);
        const uri = await contract.tokenURI(tokenId);
        nfts.push({
          tokenId: tokenId.toString(),
          uri
        });
      }

      return nfts;
    } catch (error) {
      console.error('Failed to get user TestNFT list:', error);
      return [];
    }
  }

  // Get TestToken information
  static async getTestTokenInfo() {
    try {
      const contract = getContractRead('TestToken');
      const [name, symbol, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.totalSupply()
      ]);

      return {
        name,
        symbol,
        totalSupply: ethers.formatEther(totalSupply)
      };
    } catch (error) {
      console.error('Failed to get TestToken info:', error);
      return null;
    }
  }

  // Get TestNFT information
  static async getTestNFTInfo() {
    try {
      const contract = getContractRead('TestNFT');
      const [name, symbol] = await Promise.all([
        contract.name(),
        contract.symbol()
      ]);

      return {
        name,
        symbol
      };
    } catch (error) {
      console.error('Failed to get TestNFT info:', error);
      return null;
    }
  }

  // Get ConfidentialCoin information
  static async getConfidentialCoinInfo(coinNumber: 1 | 2) {
    try {
      const contractName = coinNumber === 1 ? 'ConfidentialCoin1' : 'ConfidentialCoin2';
      const contract = getContractRead(contractName);

      const [name, symbol] = await Promise.all([
        contract.name(),
        contract.symbol()
      ]);

      return {
        name,
        symbol
      };
    } catch (error) {
      console.error(`Failed to get ConfidentialCoin${coinNumber} info:`, error);
      return null;
    }
  }

  // Fund airdrop contract - mint directly to airdrop contract address
  static async depositToAirdrop(tokenType: 'ConfidentialCoin1' | 'ConfidentialCoin2', amount: string) {
    const airdropAddress = CONTRACT_ADDRESSES.InvisibleDrop;

    switch (tokenType) {
      case 'ConfidentialCoin1':
        try {
          const contract = await getContractWrite('ConfidentialCoin1');
          const amountInWei = parseInt(amount)*1000000;

          const tx = await contract.mint(airdropAddress, amountInWei);
          console.log('ConfidentialCoin1 funding to airdrop contract submitted:', tx.hash);

          await waitForTransaction(tx.hash);

          return {
            success: true,
            txHash: tx.hash,
            message: `Successfully funded airdrop contract with ${amount} ConfidentialCoin1`
          };
        } catch (error) {
          return {
            success: false,
            error: formatError(error)
          };
        }

      case 'ConfidentialCoin2':
        try {
          const contract = await getContractWrite('ConfidentialCoin2');
          const amountInWei = parseInt(amount)*1000000;

          const tx = await contract.mint(airdropAddress, amountInWei);
          console.log('ConfidentialCoin2 funding to airdrop contract submitted:', tx.hash);

          await waitForTransaction(tx.hash);

          return {
            success: true,
            txHash: tx.hash,
            message: `Successfully funded airdrop contract with ${amount} ConfidentialCoin2`
          };
        } catch (error) {
          return {
            success: false,
            error: formatError(error)
          };
        }

      default:
        return {
          success: false,
          error: 'Unsupported token type'
        };
    }
  }
}