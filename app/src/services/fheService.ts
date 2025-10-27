// FHE Decryption Service
import { getContractRead } from '../utils/contracts';
import { CONTRACT_ADDRESSES } from '../contracts/contracts';

export class FHEService {
  // Decrypt ConfidentialCoin balance
  static async decryptBalance(
    tokenType: 'ConfidentialCoin1' | 'ConfidentialCoin2',
    userAddress: string,
    instance: any,
    signer: any
  ): Promise<string> {
    try {
      const contract = getContractRead(tokenType);
      const contractAddress = CONTRACT_ADDRESSES[tokenType];

      // Get encrypted balance handle
      const encryptedBalance = await contract.confidentialBalanceOf(userAddress);
      console.log('Encrypted balance handle:', encryptedBalance);

      if (!encryptedBalance || encryptedBalance === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return '0';
      }

      // Generate keypair
      const keypair = instance.generateKeypair();

      // Prepare decryption request
      const handleContractPairs = [{
        handle: encryptedBalance.toString(),
        contractAddress: contractAddress,
      }];

      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "1"; // 1 day validity

      // Create EIP712 signature
      const eip712 = instance.createEIP712(
        keypair.publicKey,
        [contractAddress],
        startTimeStamp,
        durationDays
      );

      // Sign
      const signature = await signer.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        eip712.message,
      );

      // Execute user decryption
      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace("0x", ""),
        [contractAddress],
        userAddress,
        startTimeStamp,
        durationDays,
      );

      const decryptedValue = result[encryptedBalance.toString()];
      console.log('Decryption result:', decryptedValue);

      return decryptedValue ? decryptedValue.toString() : '0';

    } catch (error: any) {
      console.error(`Failed to decrypt ${tokenType} balance:`, error);
      throw new Error('Decryption failed: ' + error.message);
    }
  }

  // Check if user has permission to decrypt
  static async canDecrypt(): Promise<boolean> {
    try {
      // Check if user has access permission
      // Here we need to call the contract's ACL check method
      // Currently returns true, indicating all users can decrypt their own balance
      return true;

    } catch (error) {
      console.error(`Failed to check decryption permission:`, error);
      return false;
    }
  }

  // Get encrypted balance handle (without decryption)
  static async getEncryptedBalance(tokenType: 'ConfidentialCoin1' | 'ConfidentialCoin2', userAddress: string): Promise<string> {
    try {
      const contract = getContractRead(tokenType);
      const encryptedBalance = await contract.confidentialBalanceOf(userAddress);
      return encryptedBalance.toString();
    } catch (error) {
      console.error(`Failed to get encrypted balance:`, error);
      return '0x0';
    }
  }
}