import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { TokenService } from '../services/tokens';
import { FHEService } from '../services/fheService';
import { CONTRACT_ADDRESSES } from '../contracts/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';

interface UserBalances {
  testToken: string;
  testNFT: number;
  testNFTs: Array<{tokenId: string, uri: string}>;
}

interface ConfidentialBalance {
  coin1: string | null;
  coin2: string | null;
}

export function BalanceViewer() {
  const { address } = useAccount();
  const { instance: zamaInstance, isLoading: zamaLoading, error: zamaError } = useZamaInstance();
  const signer = useEthersSigner();
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState<UserBalances | null>(null);
  const [confidentialBalances, setConfidentialBalances] = useState<ConfidentialBalance>({ coin1: null, coin2: null });
  const [decryptingCoin1, setDecryptingCoin1] = useState(false);
  const [decryptingCoin2, setDecryptingCoin2] = useState(false);

  // Load public token balances
  const loadPublicBalances = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const [testTokenBalance, testNFTBalance, testNFTs] = await Promise.all([
        TokenService.getTestTokenBalance(address),
        TokenService.getTestNFTBalance(address),
        TokenService.getUserTestNFTs(address)
      ]);

      setBalances({
        testToken: testTokenBalance,
        testNFT: testNFTBalance,
        testNFTs
      });
    } catch (error) {
      console.error('Failed to load balances:', error);
    }
    setLoading(false);
  };

  // Decrypt ConfidentialCoin1 balance
  const decryptCoin1Balance = async () => {
    if (!address || !zamaInstance || !signer) {
      alert('Please wait for initialization to complete and connect wallet');
      return;
    }

    setDecryptingCoin1(true);
    try {
      // Call FHE decryption service
      const balance = await FHEService.decryptBalance('ConfidentialCoin1', address, zamaInstance,await signer);
      setConfidentialBalances(prev => ({ ...prev, coin1: balance }));

      // alert(`ConfidentialCoin1 balance decrypted successfully: ${balance}`);
    } catch (error: any) {
      console.error('Failed to decrypt ConfidentialCoin1 balance:', error);
      alert('Decryption failed, please try again: ' + error.message);
    }
    setDecryptingCoin1(false);
  };

  // Decrypt ConfidentialCoin2 balance
  const decryptCoin2Balance = async () => {
    if (!address || !zamaInstance || !signer) {
      alert('Please wait for initialization to complete and connect wallet');
      return;
    }

    setDecryptingCoin2(true);
    try {
      // Call FHE decryption service
      const balance = await FHEService.decryptBalance('ConfidentialCoin2', address, zamaInstance,await signer);
      setConfidentialBalances(prev => ({ ...prev, coin2: balance }));

      // alert(`ConfidentialCoin2 balance decrypted successfully: ${balance}`);
    } catch (error: any) {
      console.error('Failed to decrypt ConfidentialCoin2 balance:', error);
      alert('Decryption failed, please try again: ' + error.message);
    }
    setDecryptingCoin2(false);
  };

  // Clear decrypted data
  const clearDecryptedData = () => {
    setConfidentialBalances({ coin1: null, coin2: null });
  };

  useEffect(() => {
    if (address) {
      loadPublicBalances();
    }
  }, [address]);

  if (!address) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        Please connect your wallet to view balance
      </div>
    );
  }

  if (zamaLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        Initializing encryption service...
      </div>
    );
  }

  if (zamaError) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#dc2626' }}>
        Encryption service initialization failed: {zamaError}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Page title */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{
          color: '#1e293b',
          margin: 0,
          fontSize: '1.8rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>💰 My Wallet Balance</h2>
        <button
          onClick={loadPublicBalances}
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: loading
              ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
              : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)',
            transition: 'all 0.3s ease'
          }}
        >
          {loading ? '🔄 Refreshing...' : '🔄 Refresh Balance'}
        </button>
      </div>

      {/* Current wallet address */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
        padding: '20px',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '16px',
        marginBottom: '24px',
        backdropFilter: 'blur(10px)'
      }}>
        <h4 style={{
          margin: '0 0 12px 0',
          color: '#1e293b',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>🔗 Wallet Address</h4>
        <div style={{
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#6b7280',
          wordBreak: 'break-all'
        }}>
          {address}
        </div>
      </div>

      {/* Public token balance */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <h3 style={{ color: '#374151', margin: '0 0 20px 0' }}>💰 Public Token Balance</h3>

        {balances ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* TestToken balance */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px'
            }}>
              <h4 style={{ color: '#166534', margin: '0 0 8px 0' }}>🪙 TestToken</h4>
              <p style={{ color: '#166534', margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                {Number(balances.testToken).toLocaleString()} TEST
              </p>
            </div>

            {/* TestNFT balance */}
            <div style={{
              padding: '16px',
              backgroundColor: '#faf5ff',
              border: '1px solid #d8b4fe',
              borderRadius: '8px'
            }}>
              <h4 style={{ color: '#7c3aed', margin: '0 0 8px 0' }}>🎨 TestNFT</h4>
              <p style={{ color: '#7c3aed', margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold' }}>
                {balances.testNFT} NFTs
              </p>
              {balances.testNFTs.length > 0 && (
                <div style={{ fontSize: '12px', color: '#7c3aed' }}>
                  Token IDs: {balances.testNFTs.map(nft => `#${nft.tokenId}`).join(', ')}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
            {loading ? 'Loading...' : 'No data'}
          </div>
        )}
      </div>

      {/* Encrypted token balance */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#374151', margin: 0 }}>🔐 Encrypted Token Balance</h3>
          {(confidentialBalances.coin1 || confidentialBalances.coin2) && (
            <button
              onClick={clearDecryptedData}
              style={{
                padding: '6px 12px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear Decrypted Data
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* ConfidentialCoin1 */}
          <div style={{
            padding: '20px',
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px'
          }}>
            <h4 style={{ color: '#92400e', margin: '0 0 12px 0' }}>🔐 ConfidentialCoin1</h4>

            {confidentialBalances.coin1 ? (
              <div>
                <p style={{ color: '#92400e', margin: '0 0 12px 0', fontSize: '20px', fontWeight: 'bold' }}>
                  {Number(confidentialBalances.coin1).toLocaleString()} CC1
                </p>
                <div style={{ fontSize: '12px', color: '#92400e' }}>
                  ✅ Decrypted and Displayed
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: '#92400e', margin: '0 0 12px 0', fontSize: '16px' }}>
                  Balance Encrypted 🔒
                </p>
                <button
                  onClick={decryptCoin1Balance}
                  disabled={decryptingCoin1}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: decryptingCoin1 ? '#9ca3af' : '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: decryptingCoin1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {decryptingCoin1 ? 'Decrypting...' : '🔓 Click to Decrypt'}
                </button>
              </div>
            )}
          </div>

          {/* ConfidentialCoin2 */}
          <div style={{
            padding: '20px',
            backgroundColor: '#fef2f2',
            border: '1px solid #ef4444',
            borderRadius: '8px'
          }}>
            <h4 style={{ color: '#dc2626', margin: '0 0 12px 0' }}>🔐 ConfidentialCoin2</h4>

            {confidentialBalances.coin2 ? (
              <div>
                <p style={{ color: '#dc2626', margin: '0 0 12px 0', fontSize: '20px', fontWeight: 'bold' }}>
                  {Number(confidentialBalances.coin2).toLocaleString()} CC2
                </p>
                <div style={{ fontSize: '12px', color: '#dc2626' }}>
                  ✅ Decrypted and Displayed
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: '#dc2626', margin: '0 0 12px 0', fontSize: '16px' }}>
                  Balance Encrypted 🔒
                </p>
                <button
                  onClick={decryptCoin2Balance}
                  disabled={decryptingCoin2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: decryptingCoin2 ? '#9ca3af' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: decryptingCoin2 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {decryptingCoin2 ? 'Decrypting...' : '🔓Click to Decrypt'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Decryption instructions */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#eff6ff',
          border: '1px solid #3b82f6',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#1e40af'
        }}>
          <strong>🔒 About Encrypted Tokens:</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>Based on Zama FHE technology, balances are fully encrypted storage</li>
            <li>Only wallet owners can decrypt and view real balances</li>
            <li>Decryption process is performed locally to protect privacy</li>
            <li>Decrypted data is only valid for current session</li>
          </ul>
        </div>
      </div>

      {/* Contract address information */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '20px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px'
      }}>
        <h4 style={{ color: '#374151', margin: '0 0 12px 0' }}>📋 Contract Addresses</h4>
        <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.6' }}>
          <div><strong>ConfidentialCoin1:</strong> <span style={{ fontFamily: 'monospace' }}>{CONTRACT_ADDRESSES.ConfidentialCoin1}</span></div>
          <div><strong>ConfidentialCoin2:</strong> <span style={{ fontFamily: 'monospace' }}>{CONTRACT_ADDRESSES.ConfidentialCoin2}</span></div>
          <div><strong>TestToken:</strong> <span style={{ fontFamily: 'monospace' }}>{CONTRACT_ADDRESSES.TestToken}</span></div>
          <div><strong>TestNFT:</strong> <span style={{ fontFamily: 'monospace' }}>{CONTRACT_ADDRESSES.TestNFT}</span></div>
        </div>
      </div>
    </div>
  );
}