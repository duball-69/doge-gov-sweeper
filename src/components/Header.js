import React, { useState } from 'react';
import { useWeb3ModalContext } from '../Web3ModalContext';
import './Header.css';
import { Link } from 'react-router-dom';
import logo from '../assets/logo192.png';

function Header() {
  const { address, isConnected, connectWallet, disconnectWallet, chainId } = useWeb3ModalContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const CHAIN_NAMES = {
    1: 'Ethereum',
    56: 'BSC',
    42161: 'Arbitrum',
    8453: 'Base',
    11155111: 'Sepolia',
    81457: 'Blast',
    10: 'Optimism',
    42220: 'Celo',
  };

  const chainName = CHAIN_NAMES[chainId] || `Unknown Chain (${chainId})`;

  const handleConnectClick = () => {
    if (!isConnected) {
      connectWallet();
    } else {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsMenuOpen(false);
  };

  const toggleNav = () => setIsNavOpen(!isNavOpen);

  return (
    <header className="header">
      <div className="header-content">
        {/* Left section - Hamburger and nav */}
        <div className="header-left">
          <div className="hamburger-menu" onClick={toggleNav}>
            <div className="hamburger-icon">
              <span></span>
              <span></span>
                <span></span>
            </div>
          </div>
          <nav className={`nav-links ${isNavOpen ? 'open' : ''}`}>
            <Link to="/" onClick={() => setIsNavOpen(false)}>Home</Link>
            <Link to="/play" onClick={() => setIsNavOpen(false)}>Play</Link>
            <Link to="/depositdogegov" onClick={() => setIsNavOpen(false)}>Deposit</Link>
            <Link to="/withdrawaldogegov" onClick={() => setIsNavOpen(false)}>Withdrawal</Link>
            <Link to="/free" onClick={() => setIsNavOpen(false)}>Try for free</Link>
          </nav>
        </div>

        {/* Center section - Logo */}
        <div className="header-center">
          <Link to="/">
            <img src={logo} alt="Logo" className="logo" />
          </Link>
        </div>

        {/* Right section - Connect */}
        <div className="header-right">
          {isConnected ? (
            <div className="wallet-container">
              <button className="connect-button" onClick={handleConnectClick}>
                Options
              </button>
              {isMenuOpen && (
                <div className="wallet-options">
                  <p>Connected to: {chainName}</p>
                  <p>
                    Wallet: {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                  <button onClick={handleDisconnect}>Disconnect</button>
                </div>
              )}
            </div>
          ) : (
            <button className="connect-button" onClick={handleConnectClick}>Connect</button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
