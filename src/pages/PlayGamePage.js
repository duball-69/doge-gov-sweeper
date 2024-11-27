// src/pages/PlayGamePage.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TrumpSweeper from '../components/TrumpSweeper';
import { useWeb3ModalContext } from '../Web3ModalContext';
import { supabase } from '../SupabaseClient';
import './PlayGamePage.css';

function PlayGamePage() {
  const { address, isConnected, connectWallet } = useWeb3ModalContext();
  const [balance, setBalance] = useState(0);
  const [difficulty, setDifficulty] = useState('easy'); // Default difficulty level
  const location = useLocation();

  // Function to fetch balance from Supabase
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
      } else {
        setBalance(parseFloat(parseFloat(data.balance).toFixed(4)));
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    if (address) {
      fetchBalance();
    } else {
      setBalance(0);
    }
  }, [address]);

  // Handle difficulty change
  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value);
  };

  return (
    <div className="play-game-page">
      {isConnected ? (
        <TrumpSweeper
          difficulty={difficulty}
          userAddress={address}
          balance={balance}
          setBalance={setBalance}
        />
      ) : (
        <button onClick={connectWallet} className="connect-button">Connect Wallet to Play</button>
      )}
      
      <div className="difficulty-selection">
        <label htmlFor="difficulty">Select Difficulty: </label>
        <select 
          id="difficulty"
          value={difficulty}
          onChange={handleDifficultyChange}
        >
          <option value="easy">Easy - up to 2x multiplier</option>
          <option value="medium">Medium - up to 3x multiplier</option>
          <option value="hard">Hard - up to 4x multiplier</option>
        </select>
      </div>
    </div>
  );
}

export default PlayGamePage;
