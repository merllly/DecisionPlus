// ethers contract interaction utilities
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, SEPOLIA_CHAIN_ID, SEPOLIA_RPC_URL } from '../contracts/contracts';

// Get provider
export function getProvider() {
  if (typeof window !== 'undefined' && window.ethereum) {
    // Use user's wallet provider
    return new ethers.BrowserProvider(window.ethereum);
  } else {
    // Use read-only provider
    return new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  }
}

// Get signer
export async function getSigner() {
  const provider = getProvider();
  if ('getSigner' in provider) {
    return await provider.getSigner();
  }
  throw new Error('Cannot get signer, please connect wallet');
}

// Get contract instance (read-only)
export function getContractRead(contractName: keyof typeof CONTRACT_ADDRESSES) {
  const provider = getProvider();
  const address = CONTRACT_ADDRESSES[contractName];
  const abi = CONTRACT_ABIS[contractName];

  return new ethers.Contract(address, abi, provider);
}

// Get contract instance (writable)
export async function getContractWrite(contractName: keyof typeof CONTRACT_ADDRESSES) {
  const signer = await getSigner();
  const address = CONTRACT_ADDRESSES[contractName];
  const abi = CONTRACT_ABIS[contractName];

  return new ethers.Contract(address, abi, signer);
}

// Check network
export async function checkNetwork() {
  const provider = getProvider();
  const network = await provider.getNetwork();

  if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
    throw new Error(`Please switch to Sepolia testnet. Current network: ${network.chainId}`);
  }

  return network;
}

// Format error message
export function formatError(error: any): string {
  if (error?.reason) {
    return error.reason;
  }
  if (error?.message) {
    return error.message;
  }
  return 'Transaction failed';
}

// Wait for transaction confirmation
export async function waitForTransaction(txHash: string, confirmations = 1) {
  const provider = getProvider();
  const receipt = await provider.waitForTransaction(txHash, confirmations);

  if (!receipt) {
    throw new Error('Transaction confirmation failed');
  }

  if (receipt.status === 0) {
    throw new Error('Transaction execution failed');
  }

  return receipt;
}