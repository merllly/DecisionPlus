import { useState } from 'react';
import { useAccount } from 'wagmi';
import { InvisibleDropService } from '../services/invisibleDrop';
import type {AirdropConfig } from '../services/invisibleDrop';
import { CONTRACT_ADDRESSES } from '../contracts/contracts';

export function AirdropManager() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AirdropConfig>({
    rewardToken: CONTRACT_ADDRESSES.ConfidentialCoin1,
    rewardPerUser: 100,
    endTime: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days later
    requireNFT: false,
    nftContract: CONTRACT_ADDRESSES.TestNFT,
    requireToken: false,
    tokenContract: CONTRACT_ADDRESSES.TestToken,
    minTokenAmount: '1000'
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      const result = await InvisibleDropService.createAirdrop(formData);

      if (result.success) {
        alert(result.message);
        // Reset form
        setFormData({
          ...formData,
          endTime: Math.floor(Date.now() / 1000) + 86400 * 7
        });
      } else {
        alert(`Create failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to create airdrop:', error);
      alert('Failed to create airdrop');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof AirdropConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format datetime input value
  const formatDateTimeLocal = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Handle datetime changes
  const handleDateTimeChange = (value: string) => {
    const timestamp = Math.floor(new Date(value).getTime() / 1000);
    handleInputChange('endTime', timestamp);
  };

  if (!address) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        Please connect your wallet first
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{
        color: '#1e293b',
        marginBottom: '32px',
        fontSize: '1.8rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center'
      }}>✨ Create New Airdrop</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Basic information */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))',
          padding: '28px',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            color: '#1e293b',
            margin: '0 0 20px 0',
            fontSize: '1.3rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>📈 Basic Information</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 'bold' }}>
                Reward Token Contract Address
              </label>
              <select
                value={formData.rewardToken}
                onChange={(e) => handleInputChange('rewardToken', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value={CONTRACT_ADDRESSES.ConfidentialCoin1}>
                  ConfidentialCoin1 ({CONTRACT_ADDRESSES.ConfidentialCoin1.slice(0, 10)}...)
                </option>
                <option value={CONTRACT_ADDRESSES.ConfidentialCoin2}>
                  ConfidentialCoin2 ({CONTRACT_ADDRESSES.ConfidentialCoin2.slice(0, 10)}...)
                </option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 'bold' }}>
                Reward Amount per User
              </label>
              <input
                type="number"
                value={formData.rewardPerUser}
                onChange={(e) => handleInputChange('rewardPerUser', Number(e.target.value))}
                min="1"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: 'bold' }}>
                End Time
              </label>
              <input
                type="datetime-local"
                value={formatDateTimeLocal(formData.endTime)}
                onChange={(e) => handleDateTimeChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                required
              />
            </div>
          </div>
        </div>

        {/* Condition settings */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          border: '1px solid #e5e7eb',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: '#374151', margin: '0 0 16px 0' }}>Claim Conditions</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* NFT condition */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  checked={formData.requireNFT}
                  onChange={(e) => handleInputChange('requireNFT', e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span style={{ color: '#374151', fontWeight: 'bold' }}>Require NFT Ownership</span>
              </label>

              {formData.requireNFT && (
                <select
                  value={formData.nftContract}
                  onChange={(e) => handleInputChange('nftContract', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value={CONTRACT_ADDRESSES.TestNFT}>
                    TestNFT ({CONTRACT_ADDRESSES.TestNFT.slice(0, 10)}...)
                  </option>
                </select>
              )}
            </div>

            {/* Token condition */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  checked={formData.requireToken}
                  onChange={(e) => handleInputChange('requireToken', e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span style={{ color: '#374151', fontWeight: 'bold' }}>Require Token Ownership</span>
              </label>

              {formData.requireToken && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <select
                    value={formData.tokenContract}
                    onChange={(e) => handleInputChange('tokenContract', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value={CONTRACT_ADDRESSES.TestToken}>
                      TestToken ({CONTRACT_ADDRESSES.TestToken.slice(0, 10)}...)
                    </option>
                  </select>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: '#6b7280', fontSize: '14px' }}>
                      Minimum Holdings
                    </label>
                    <input
                      type="number"
                      value={formData.minTokenAmount}
                      onChange={(e) => handleInputChange('minTokenAmount', e.target.value)}
                      min="0"
                      step="0.1"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '16px',
            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating...' : '🚀 Create Airdrop'}
        </button>
      </form>

      {/* Information tips */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        color: '#92400e'
      }}>
        <h4 style={{ margin: '0 0 8px 0' }}>⚠️ Important Notes</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>After creating an airdrop, you need to fund the airdrop contract with reward tokens on the "Token Minting" page</li>
          <li>Make sure the reward token contract address is correct</li>
          <li>Conditions cannot be modified after setting, please check carefully</li>
          <li>The airdrop will be effective immediately after creation, users can start claiming</li>
        </ul>
      </div>
    </div>
  );
}