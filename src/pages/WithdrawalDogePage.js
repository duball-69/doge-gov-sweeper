import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3ModalContext } from '../Web3ModalContext';
import { supabase } from '../SupabaseClient';
import dogegovAbi from '../abis/dogegov.json'; // Import the Dogegov ABI
import './WithdrawalPage.css';

function WithdrawalPage() {
  const { provider, address } = useWeb3ModalContext();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [status, setStatus] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [balance, setBalance] = useState(0);
  const [withdrawalSuccessful, setWithdrawalSuccessful] = useState(false);

  const recipientAddress = '0x500CA2fEBF2ef727Eb1DCD02A7326a3A040b64fF'; // Server wallet address
  const confirmationFee = '0.000003'; // ETH amount user needs to send
  const privateKey = process.env.REACT_APP_PRIVATE_KEY; // Server wallet private key
  const dogegovAddress = '0x1121AcC14c63f3C872BFcA497d10926A6098AAc5'; // Dogegov token contract address
//  const tokenAddress = '0x67f0870BB897F5E1c369976b4A2962d527B9562c'; // Base Token address


  // Fetch user's Dogegov balance from Supabase
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
        setBalance(0);
      } else if (data) {
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
      setStatus('Please confirm the gas fee transaction in your wallet.');
  
      // Initialize ethers provider and signer for gas fee confirmation
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await ethersProvider.getSigner();
  
      // User sends the confirmation fee
      const confirmationTx = await signer.sendTransaction({
        to: recipientAddress,
        value: ethers.parseEther(confirmationFee),
      });
  
      setStatus('Waiting for gas fee confirmation...');
      await confirmationTx.wait();
      console.log('Gas fee transaction hash:', confirmationTx.hash);
  
      // Process the Dogegov token withdrawal
      setStatus('Processing your withdrawal...');
      const provider = new ethers.JsonRpcProvider(process.env.REACT_APP_BASE_RPC_URL);
      const serverWallet = new ethers.Wallet(privateKey, provider);
      const dogegovContract = new ethers.Contract(dogegovAddress, dogegovAbi, serverWallet);
  
      // Hardcoded decimals for Dogegov
      const decimals = 18; // Update this value if Dogegov uses a different number of decimals
      const amountInWei = ethers.parseUnits(withdrawAmount.toString(), decimals);
  
      const withdrawalTx = await dogegovContract.transfer(address, amountInWei);
  
      setStatus('Waiting for withdrawal transaction confirmation...');
      await withdrawalTx.wait();
      console.log('Withdrawal transaction hash:', withdrawalTx.hash);
      setTransactionHash(withdrawalTx.hash);
  
      // Update balance in Supabase
      const newBalance = balance - amount;
      await supabase
        .from('TrumpSweeper')
        .update({ balance: newBalance })
        .eq('user', address);
  
      setStatus('Withdrawal successful!');
      setWithdrawalSuccessful(true);
      fetchBalance();
    } catch (error) {
      console.error('Withdrawal failed:', error);
      setStatus('Withdrawal failed. Please try again.');
      setWithdrawalSuccessful(false);
    }
  };

  
  useEffect(() => {
    if (address) {
      fetchBalance();
    } else {
      setBalance(0);
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
        {withdrawalSuccessful && (
          <p>
            Withdrawal successful! Transaction Hash:{' '}
            <a
              href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {transactionHash}
            </a>
          </p>
        )}
      </div>
      {status && <p className="status-message">{status}</p>}
    </div>
  );
}

export default WithdrawalPage;
