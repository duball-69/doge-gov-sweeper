// src/components/DepositPage.js

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3ModalContext } from '../Web3ModalContext';
import './DepositPage.css';
import { supabase } from '../SupabaseClient';
import { useNavigate } from 'react-router-dom';

function DepositPage() {
  const navigate = useNavigate();
  const { provider, address } = useWeb3ModalContext();
  const [depositAmount, setDepositAmount] = useState('');
  const [status, setStatus] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [balance, setBalance] = useState(0);
  const [depositSuccessful, setDepositSuccessful] = useState(false);
  const recipientAddress = "0x500CA2fEBF2ef727Eb1DCD02A7326a3A040b64fF";

  // Fetch balance from Supabase
  const fetchBalance = async () => {
    if (!address) return;
    try {
      const { data, error } = await supabase
        .from('TrumpSweeper')
        .select('balance')
        .eq('user', address)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found, initialize balance
          setBalance(0);
        } else {
          throw error;
        }
      } else {
        setBalance(parseFloat(data.balance));
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setStatus('Error fetching balance.');
    }
  };

  const handleDeposit = async () => {
    if (!address) {
      setStatus('Please connect your wallet first.');
      return;
    }

    if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) {
      setStatus('Please enter a valid deposit amount.');
      return;
    }

    try {
      setStatus('Processing deposit...');

      // Initialize ethers provider and signer
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await ethersProvider.getSigner();

      // Send transaction directly to recipient wallet
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: ethers.parseEther(depositAmount),
      });

      setStatus('Waiting for transaction confirmation...');
      await tx.wait();
      setTransactionHash(tx.hash);

      // Update balance in Supabase
      await updateBalanceInSupabase(address, depositAmount);
      setStatus('Deposit successful!');
      setDepositSuccessful(true);
      fetchBalance();
    } catch (error) {
      console.error('Deposit failed:', error);
      setStatus('Deposit failed. Please try again.');
      setDepositSuccessful(false);
    }
  };

  const updateBalanceInSupabase = async (walletAddress, amount) => {
    try {
      // Fetch current balance
      const { data, error } = await supabase
        .from('TrumpSweeper')
        .select('balance')
        .eq('user', walletAddress)
        .single();

      let newBalance = 0;

      if (error) {
        if (error.code === 'PGRST116') {
          // No existing record, initialize balance
          newBalance = parseFloat(amount);
        } else {
          throw error;
        }
      } else {
        newBalance = parseFloat(data.balance) + parseFloat(amount);
      }

      // Upsert the new balance
      const { error: upsertError } = await supabase
        .from('TrumpSweeper')
        .upsert(
          { user: walletAddress, balance: newBalance },
          { onConflict: 'user' }
        );

      if (upsertError) {
        throw upsertError;
      }
    } catch (error) {
      console.error('Error updating balance in Supabase:', error);
      setStatus('Failed to update balance in database.');
    }
  };

  const goToGame = () => {
    navigate('/play');
  };

  useEffect(() => {
    if (address) {
      fetchBalance();
    } else {
      setBalance(0);
    }
  }, [address]);

  return (
    <div className="deposit-page">
      <h2>Deposit ETH to Play</h2>
      <p className="subtitle">Deposit tokens to start playing. You can withdraw them anytime.</p>
      <p>Current Balance: {balance.toFixed(4)} ETH</p>
      <div className="deposit-form">
        <input
          type="number"
          placeholder="Enter amount in ETH"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          min="0"
          step="0.0001"
        />
        <button onClick={handleDeposit}>Deposit</button>
        {depositSuccessful && (
          <button onClick={goToGame} className="play-button">Play Game</button>
        )}
      </div>
      {status && <p className="status-message2">{status}</p>}
      {transactionHash && (
        <p className="transaction-hash">
          Transaction Hash:{' '}
          <a
            href={`https://etherscan.io/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {transactionHash}
          </a>
        </p>
      )}
    </div>
  );
}

export default DepositPage;
