import { useState } from 'react';
import { useAccount } from 'wagmi';
import { TokenService } from '../services/tokens';
import { CONTRACT_ADDRESSES } from '../contracts/contracts';

export function TokenMinter() {
  const { address } = useAccount();
  const [loading, setLoading] = useState<string | null>(null);

  // Form state
  const [testTokenAmount, setTestTokenAmount] = useState('1000');
  const [nftUri, setNftUri] = useState('https://example.com/token/');
  const [depositAmount, setDepositAmount] = useState('1000');
  const [selectedToken, setSelectedToken] = useState<'ConfidentialCoin1' | 'ConfidentialCoin2'>('ConfidentialCoin1');

  // Mint TestToken
  const handleMintTestToken = async () => {
    if (!address) return;

    try {
      setLoading('testToken');
      const result = await TokenService.mintTestToken(address, testTokenAmount);

      if (result.success) {
        alert(result.message);
        setTestTokenAmount('1000');
      } else {
        alert(`Minting failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to mint TestToken:', error);
      alert('Minting failed');
    } finally {
      setLoading(null);
    }
  };

  // Mint TestNFT
  const handleMintTestNFT = async () => {
    if (!address) return;

    try {
      setLoading('testNFT');
      const result = await TokenService.mintTestNFT(address, nftUri);

      if (result.success) {
        alert(result.message);
        setNftUri('https://example.com/token/');
      } else {
        alert(`Minting failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to mint TestNFT:', error);
      alert('Minting failed');
    } finally {
      setLoading(null);
    }
  };


  // Fund airdrop contract
  const handleDepositToAirdrop = async () => {
    try {
      setLoading('deposit');
      const result = await TokenService.depositToAirdrop(selectedToken, depositAmount);

      if (result.success) {
        alert(result.message);
        setDepositAmount('1000');
      } else {
        alert(`Funding failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to fund airdrop contract:', error);
      alert('Funding failed');
    } finally {
      setLoading(null);
    }
  };


  if (!address) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        Please connect your wallet first
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          color: '#1e293b',
          margin: 0,
          fontSize: '1.8rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>🪙 Token Minting</h2>
        <p style={{
          color: '#64748b',
          margin: '12px 0 0 0',
          fontSize: '1.1rem',
          fontWeight: '500'
        }}>
          Mint test tokens and fund airdrop contracts with reward tokens
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>

          {/* TestToken minting */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))',
            padding: '28px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.1)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}>
            <h3 style={{
              color: '#1e293b',
              margin: '0 0 16px 0',
              fontSize: '1.3rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>🪙 TestToken</h3>
            <p style={{ color: '#6b7280', margin: '0 0 16px 0', fontSize: '14px' }}>
              ERC20 token for testing, can be used as airdrop conditions
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 'bold' }}>
                Mint Amount
              </label>
              <input
                type="number"
                value={testTokenAmount}
                onChange={(e) => setTestTokenAmount(e.target.value)}
                min="1"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="1000"
              />
            </div>

            <button
              onClick={handleMintTestToken}
              disabled={loading === 'testToken'}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading === 'testToken' ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading === 'testToken' ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading === 'testToken' ? 'Minting...' : 'Mint TestToken'}
            </button>
          </div>

          {/* TestNFT minting */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            border: '1px solid #e5e7eb',
            borderRadius: '12px'
          }}>
            <h3 style={{ color: '#374151', margin: '0 0 16px 0' }}>🎨 TestNFT</h3>
            <p style={{ color: '#6b7280', margin: '0 0 16px 0', fontSize: '14px' }}>
              ERC721 NFT for testing, can be used as airdrop conditions
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 'bold' }}>
                Token URI
              </label>
              <input
                type="url"
                value={nftUri}
                onChange={(e) => setNftUri(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="https://example.com/token/"
              />
            </div>

            <button
              onClick={handleMintTestNFT}
              disabled={loading === 'testNFT'}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading === 'testNFT' ? '#9ca3af' : '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading === 'testNFT' ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading === 'testNFT' ? 'Minting...' : 'Mint TestNFT'}
            </button>
          </div>

          {/* Airdrop contract funding */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            border: '1px solid #e5e7eb',
            borderRadius: '12px'
          }}>
            <h3 style={{ color: '#374151', margin: '0 0 16px 0' }}>🎁 Airdrop Contract Funding</h3>
            <p style={{ color: '#6b7280', margin: '0 0 16px 0', fontSize: '14px' }}>
              Mint tokens directly to airdrop contract for reward distribution
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 'bold' }}>
                  Select Token Type
                </label>
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value as 'ConfidentialCoin1' | 'ConfidentialCoin2')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="ConfidentialCoin1">ConfidentialCoin1</option>
                  <option value="ConfidentialCoin2">ConfidentialCoin2</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 'bold' }}>
                  Fund Amount
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="1"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="1000"
                />
              </div>

              <button
                onClick={handleDepositToAirdrop}
                disabled={loading === 'deposit'}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: loading === 'deposit' ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading === 'deposit' ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {loading === 'deposit' ? 'Funding...' : 'Fund Airdrop Contract'}
              </button>

              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                <strong>Target Address:</strong><br />
                <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {CONTRACT_ADDRESSES.InvisibleDrop}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage tips */}
        <div style={{
          padding: '16px',
          backgroundColor: '#eff6ff',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          color: '#1e40af'
        }}>
          <h4 style={{ margin: '0 0 8px 0' }}>💡 Usage Tips</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li>TestToken and TestNFT can be used as airdrop claiming conditions</li>
            <li>ConfidentialCoin is used as airdrop reward tokens</li>
            <li>Airdrop contract funding can mint tokens directly to contract address</li>
            <li>All tokens are deployed on Sepolia testnet</li>
            <li>Minting is free, only gas fees required</li>
          </ul>
        </div>
    </div>
  );
}