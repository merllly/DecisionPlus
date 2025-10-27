import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { InvisibleDropService } from '../services/invisibleDrop';
import type{  AirdropInfo, AirdropConditions, UserClaimInfo } from '../services/invisibleDrop';

interface AirdropData extends AirdropInfo {
  id: number;
  conditions: AirdropConditions | null;
  userClaimInfo: UserClaimInfo | null;
  isEligible: boolean;
  claimableAmount: number;
  canClaim: boolean;
}

export function AirdropList() {
  const { address } = useAccount();
  const [airdrops, setAirdrops] = useState<AirdropData[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingAirdropId, setClaimingAirdropId] = useState<number | null>(null);

  // Load airdrop list
  const loadAirdrops = async () => {
    if (!address) return;

    try {
      setLoading(true);
      const count = await InvisibleDropService.getAirdropCount();
      const airdropPromises = [];

      for (let i = 0; i < count; i++) {
        airdropPromises.push(loadSingleAirdrop(i));
      }

      const airdropData = await Promise.all(airdropPromises);
      setAirdrops(airdropData.filter(Boolean) as AirdropData[]);
    } catch (error) {
      console.error('Failed to load airdrop list:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load single airdrop information
  const loadSingleAirdrop = async (airdropId: number): Promise<AirdropData | null> => {
    if (!address) return null;

    try {
      const [info, conditions, userClaimInfo, isEligible, claimableAmount] = await Promise.all([
        InvisibleDropService.getAirdropInfo(airdropId),
        InvisibleDropService.getAirdropConditions(airdropId),
        InvisibleDropService.getUserClaimInfo(airdropId, address),
        InvisibleDropService.checkEligibility(airdropId, address),
        InvisibleDropService.checkClaimableAmount(airdropId, address)
      ]);

      if (!info) return null;

      const canClaim = isEligible && !userClaimInfo?.hasClaimed && claimableAmount > 0 && info.isActive;

      return {
        id: airdropId,
        ...info,
        conditions,
        userClaimInfo,
        isEligible,
        claimableAmount,
        canClaim
      };
    } catch (error) {
      console.error(`Failed to load airdrop ${airdropId}:`, error);
      return null;
    }
  };

  // Claim reward
  const handleClaim = async (airdropId: number) => {
    try {
      setClaimingAirdropId(airdropId);
      const result = await InvisibleDropService.claimReward(airdropId);

      if (result.success) {
        alert(result.message);
        // Reload airdrop list
        await loadAirdrops();
      } else {
        alert(`Claim failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Claim failed:', error);
      alert('Claim failed');
    } finally {
      setClaimingAirdropId(null);
    }
  };

  // Format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN');
  };

  // Format address
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    if (address) {
      loadAirdrops();
    }
  }, [address]);

  if (!address) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        Please connect your wallet first
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        Loading...
      </div>
    );
  }

  if (airdrops.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        <h3>No Airdrops</h3>
        <p>There are currently no airdrop activities</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{
          color: '#1e293b',
          margin: 0,
          fontSize: '1.8rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>🎁 Airdrop List</h2>
        <button
          onClick={loadAirdrops}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {airdrops.map((airdrop) => (
          <div
            key={airdrop.id}
            className="glass-card"
            style={{
              padding: '28px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  color: '#1e293b',
                  margin: '0 0 16px 0',
                  fontSize: '1.4rem',
                  fontWeight: '700'
                }}>
                  Airdrop #{airdrop.id}
                  {airdrop.isActive ? (
                    <span style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      marginLeft: '8px',
                      fontWeight: '600',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                    }}>
                      Active
                    </span>
                  ) : (
                    <span style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      marginLeft: '8px'
                    }}>
                      Ended
                    </span>
                  )}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <p style={{ margin: '4px 0', color: '#374151' }}>
                      <strong>Creator:</strong> {formatAddress(airdrop.airdropper)}
                    </p>
                    <p style={{ margin: '4px 0', color: '#374151' }}>
                      <strong>Reward Token:</strong> {formatAddress(airdrop.rewardToken)}
                    </p>
                    <p style={{ margin: '4px 0', color: '#374151' }}>
                      <strong>Reward per User:</strong> {airdrop.rewardPerUser} tokens
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '4px 0', color: '#374151' }}>
                      <strong>End Time:</strong> {formatTime(airdrop.endTime)}
                    </p>
                    <p style={{ margin: '4px 0', color: '#374151' }}>
                      <strong>User Status:</strong>
                      {airdrop.isEligible ? (
                        <span style={{ color: '#10b981' }}> ✅ Eligible</span>
                      ) : (
                        <span style={{ color: '#ef4444' }}> ❌ Not Eligible</span>
                      )}
                    </p>
                    <p style={{ margin: '4px 0', color: '#374151' }}>
                      <strong>Claimable:</strong> {airdrop.claimableAmount} tokens
                    </p>
                  </div>
                </div>

                {/* Condition information */}
                {airdrop.conditions && (
                  <div style={{
                    backgroundColor: '#f9fafb',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '16px'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>Claim Conditions:</h4>
                    {airdrop.conditions.requireNFT && (
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}>
                        🎨 Need to hold NFT: {formatAddress(airdrop.conditions.nftContract)}
                      </p>
                    )}
                    {airdrop.conditions.requireToken && (
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}>
                        🪙 Need to hold tokens: {formatAddress(airdrop.conditions.tokenContract)} ≥ {airdrop.conditions.minTokenAmount}
                      </p>
                    )}
                    {!airdrop.conditions.requireNFT && !airdrop.conditions.requireToken && (
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}>
                        🎉 No conditions required
                      </p>
                    )}
                  </div>
                )}

                {/* User claim status */}
                {airdrop.userClaimInfo && airdrop.userClaimInfo.hasClaimed && (
                  <div style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #d1fae5',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '16px'
                  }}>
                    <p style={{ margin: 0, color: '#065f46' }}>
                      ✅ Claimed at {formatTime(airdrop.userClaimInfo.claimTime)}
                    </p>
                  </div>
                )}
              </div>

              {/* Claim button */}
              <div style={{ marginLeft: '20px' }}>
                {airdrop.canClaim ? (
                  <button
                    onClick={() => handleClaim(airdrop.id)}
                    disabled={claimingAirdropId === airdrop.id}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: claimingAirdropId === airdrop.id ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: claimingAirdropId === airdrop.id ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      minWidth: '100px'
                    }}
                  >
                    {claimingAirdropId === airdrop.id ? 'Claiming...' : '🎁 Claim'}
                  </button>
                ) : (
                  <div style={{
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    color: '#6b7280',
                    fontSize: '14px',
                    textAlign: 'center',
                    minWidth: '100px'
                  }}>
                    {airdrop.userClaimInfo?.hasClaimed ? 'Claimed' :
                     !airdrop.isEligible ? 'Not Eligible' :
                     !airdrop.isActive ? 'Ended' : 'Not Available'}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}