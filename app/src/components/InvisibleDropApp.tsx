import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { AirdropManager } from './AirdropManager';
import { TokenMinter } from './TokenMinter';
import { AirdropList } from './AirdropList';
import { BalanceViewer } from './BalanceViewer';

export function InvisibleDropApp() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'airdrops' | 'create' | 'mint' | 'balance'>('airdrops');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        minHeight: '100vh'
      }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '30px 40px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            💧 InvisibleDrop
          </h1>
          <p style={{
            color: '#64748b',
            margin: '8px 0 0 0',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>
            Privacy Airdrop Platform - Powered by Zama
          </p>
        </div>
        <ConnectButton />
      </header>

      {!isConnected ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 40px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          margin: '40px 0'
        }}>
          <div
            className="float"
            style={{
              fontSize: '4rem',
              marginBottom: '24px'
            }}
          >🚀</div>
          <h2 style={{
            color: '#1e293b',
            marginBottom: '16px',
            fontSize: '2rem',
            fontWeight: '700'
          }}>
            Welcome to InvisibleDrop
          </h2>
          <p style={{
            color: '#64748b',
            marginBottom: '32px',
            fontSize: '1.1rem',
            lineHeight: '1.6'
          }}>
            Please connect your wallet to start using privacy airdrop features
          </p>
          <ConnectButton />
        </div>
      ) : (
        <div>
          {/* Tab Navigation */}
          <nav style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '32px',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '8px',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            {[
              { key: 'airdrops', label: '🎯 Airdrop List' },
              { key: 'create', label: '➕ Create Airdrop' },
              { key: 'mint', label: '🪙 Mint Tokens' },
              { key: 'balance', label: '💰 My Balance' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                style={{
                  padding: '16px 24px',
                  background: activeTab === key
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : 'transparent',
                  color: activeTab === key ? 'white' : '#475569',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: activeTab === key ? '600' : '500',
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  boxShadow: activeTab === key
                    ? '0 4px 15px rgba(102, 126, 234, 0.3)'
                    : 'none',
                  transform: activeTab === key ? 'translateY(-2px)' : 'none'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== key) {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== key) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div style={{
            minHeight: '500px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '32px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {activeTab === 'airdrops' && <AirdropList />}
            {activeTab === 'create' && <AirdropManager />}
            {activeTab === 'mint' && <TokenMinter />}
            {activeTab === 'balance' && <BalanceViewer />}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        marginTop: '60px',
        padding: '24px 40px',
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '16px',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '14px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <p style={{ margin: '0 0 12px 0' }}>
          InvisibleDrop - Privacy Airdrop Platform Based on Zama |
          <a
            href="https://docs.zama.ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#667eea',
              marginLeft: '8px',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#764ba2'}
            onMouseOut={(e) => e.currentTarget.style.color = '#667eea'}
          >
            Learn about Zama
          </a>
        </p>
        <p style={{
          margin: 0,
          fontSize: '13px',
          opacity: '0.8'
        }}>
          Sepolia Testnet | Contract Address: 0xCb96848DD60c987e67D406A3da966F63270dbA7b
        </p>
      </footer>
      </div>
    </div>
  );
}