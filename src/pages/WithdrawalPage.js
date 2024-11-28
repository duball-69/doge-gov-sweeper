import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3ModalContext } from '../Web3ModalContext';
import { supabase } from '../SupabaseClient';
import './WithdrawalPage.css';

function WithdrawalPage() {
  const { address } = useWeb3ModalContext();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [status, setStatus] = useState('');
  const [balance, setBalance] = useState(0);

  const provider = new ethers.JsonRpcProvider(process.env.REACT_APP_SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);

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
        console.error('Error fetching balance:', error);
        setBalance(0); // Default to 0 if an error occurs
      } else {
        setBalance(parseFloat(data.balance));
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setStatus('Error fetching balance.');
    }
  };

  const handleWithdraw = async () => {
    if (!address) {
      setStatus('Please connect your wallet first.');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) {
      setStatus('Invalid withdrawal amount.');
      return;
    }

    try {
      setStatus('Processing withdrawal...');
      
      // Transfer ETH to the user's address
      const tx = await wallet.sendTransaction({
        to: address,
        value: ethers.parseEther(withdrawAmount),
      });

      setStatus('Waiting for transaction confirmation...');
      await tx.wait();

      // Update balance in Supabase
      const newBalance = balance - amount;
      await supabase
        .from('TrumpSweeper')
        .update({ balance: newBalance })
        .eq('user', address);

      setStatus(`Withdrawal successful! Transaction Hash: ${tx.hash}`);
      setWithdrawAmount('');
      fetchBalance(); // Refresh the balance after withdrawal
    } catch (error) {
      console.error('Withdrawal failed:', error);
      setStatus('Withdrawal failed. Please try again.');
    }
  };

  useEffect(() => {
    if (address) {
      fetchBalance();
    }
  }, [address]);

  return (
    <div className="withdrawal-page">
      <h2>Withdraw your DOGEGOV</h2>
      <p>Current Balance: {balance.toFixed(4)} DOGEGOV</p>
      <div className="withdrawal-form">
        <input
          type="number"
          placeholder="Enter amount to withdraw in DOGEGOV"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          min="0"
          step="0.0001"
        />
        <button onClick={handleWithdraw}>Withdraw</button>
      </div>
      {status && <p className="status-message">{status}</p>}
    </div>
  );
}

export default WithdrawalPage;
