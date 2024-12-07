import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3ModalContext } from '../Web3ModalContext';
import './DepositPage.css';
import { supabase } from '../SupabaseClient';
import { useNavigate } from 'react-router-dom';
import tokenAbi from '../abis/dogegov.json'; // Import the ABI

function DepositDogePage() {
  const navigate = useNavigate();
  const { provider, address } = useWeb3ModalContext();
  const [depositAmount, setDepositAmount] = useState('');
  const [status, setStatus] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [balance, setBalance] = useState(0);
  const [depositSuccessful, setDepositSuccessful] = useState(false);

  // Token contract details
  const tokenAddress = '0x1121AcC14c63f3C872BFcA497d10926A6098AAc5'; // ETH Token address
//  const tokenAddress = '0x67f0870BB897F5E1c369976b4A2962d527B9562c'; // Base Token address
 
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
          setBalance(0); // Initialize balance if no record exists
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
  
      // Create a contract instance for the token
      const tokenContract = new  ethers.Contract(tokenAddress, tokenAbi, signer);
  
      // Retrieve the token's decimals
      const decimals = await tokenContract.decimals();
  
      // Convert deposit amount to the token's smallest unit
      const amountInWei = ethers.parseUnits(depositAmount, decimals); // amountInWei is a BigInt
  
      // Check if the user has enough balance of the token
      const userBalance = await tokenContract.balanceOf(address); // userBalance is a BigInt
  
      // Compare BigInt values using standard operators
      if (userBalance < amountInWei) {
        setStatus('Insufficient token balance.');
        return;
      }
  
      // Call the transfer function to send tokens
      const tx = await tokenContract.transfer(
        process.env.REACT_APP_WALLET, // Recipient address
        amountInWei
      );
  
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
          newBalance = parseFloat(amount); // Initialize balance if no record exists
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
      <h2>Deposit DOGEGOV to Play</h2>
      <p className="subtitle">Deposit tokens to start playing. You can withdraw them anytime.</p>
      <p>Current Balance: {balance.toFixed(4)} DOGEGOV</p>
      <div className="deposit-form">
        <input
          type="number"
          placeholder="Enter amount in DOGEGOV"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          min="0"
          step="0.0001"
        />
        <button onClick={handleDeposit}>Deposit</button>
        {depositSuccessful && (
          <button onClick={goToGame} className="play-button">
            Play Game
          </button>
        )}
      </div>
      {status && <p className="status-message2">{status}</p>}
      {transactionHash && (
        <p className="transaction-hash">
          Transaction Hash:{' '}
          <a
            href={`https://basescan.org/tx/${transactionHash}`} // Updated for Base Chain explorer
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

export default DepositDogePage;
