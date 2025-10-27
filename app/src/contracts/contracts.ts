// Contract addresses and ABI configuration
// Contract information generated from deployments/sepolia

import InvisibleDropABI from './InvisibleDrop.abi.json';
import ConfidentialCoin1ABI from './ConfidentialCoin1.abi.json';
import ConfidentialCoin2ABI from './ConfidentialCoin2.abi.json';
import TestTokenABI from './TestToken.abi.json';
import TestNFTABI from './TestNFT.abi.json';

// Sepolia contract addresses
export const CONTRACT_ADDRESSES = {
  InvisibleDrop: '0x106F22a583E2e452BD3410851CBeA9DB025fB438',
  ConfidentialCoin1: '0x36De2Ed8465ad8976D2D2be399aeF29f612b3d9E',
  ConfidentialCoin2: '0xC50E8c96a2e6a11BA7F27B541617981B66256071',
  TestToken: '0xD6e81e78930259e66a2f4b363D84a6Ec0BeCd2c6',
  TestNFT: '0x37914fAD5322Df6e701Be562BC9aff90F5fE928D',
} as const;

// Contract ABI
export const CONTRACT_ABIS = {
  InvisibleDrop: InvisibleDropABI,
  ConfidentialCoin1: ConfidentialCoin1ABI,
  ConfidentialCoin2: ConfidentialCoin2ABI,
  TestToken: TestTokenABI,
  TestNFT: TestNFTABI,
} as const;

// Sepolia network configuration
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/c501d55ad9924cf5905ae1954ec6f7f3';

// Type definitions
export type ContractName = keyof typeof CONTRACT_ADDRESSES;
export type ContractAddress = typeof CONTRACT_ADDRESSES[ContractName];