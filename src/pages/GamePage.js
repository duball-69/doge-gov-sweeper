// src/pages/GamePage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3ModalContext } from '../Web3ModalContext';
import { supabase } from '../SupabaseClient';
import './GamePage.css';
import trumpKamalaCloud from '../assets/trumpkamalacloud.png';

function GamePage() {
  const { address, isConnected, connectWallet } = useWeb3ModalContext();
  const [balance, setBalance] = useState(0);
  const [difficulty, setDifficulty] = useState('easy');
  const [gamesPlayed, setGamesPlayed] = useState(null);
  const [isStartingMode, setIsStartingMode] = useState(false);
  const navigate = useNavigate();

  // Fetch user's balance from Supabase
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
          // No existing record, set balance to 0
          setBalance(0);
        } else {
          throw error;
        }
      } else {
        setBalance(parseFloat(data.balance).toFixed(4));
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
    }
  };

  // Fetch the number of games played from Supabase
  const fetchGamesPlayed = async () => {
    if (!address) return;
    try {
      const { data, error } = await supabase
        .from('TrumpSweeper')
        .select('games')
        .eq('user', address)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No existing record, set gamesPlayed to 0
          setGamesPlayed(0);
          setIsStartingMode(true);
        } else {
          throw error;
        }
      } else {
        const games = data?.games || 0;
        setGamesPlayed(games);
        setIsStartingMode(games < 5); // Adjust the threshold as needed
      }
    } catch (error) {
      console.error('Error fetching games count:', error);
      setGamesPlayed(0);
      setIsStartingMode(true);
    }
  };

  useEffect(() => {
    if (address) {
      fetchBalance();
      fetchGamesPlayed();
    } else {
      setBalance(0);
      setGamesPlayed(null);
      setIsStartingMode(false);
    }
  }, [address]);

  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value);
  };

  const startGame = () => {
    if (isStartingMode) {
      navigate(`/play-game?difficulty=starting`);
    } else {
      navigate(`/play-game?difficulty=${difficulty}`);
    }
  };

  const goToDeposit = () => {
    navigate('/deposit');
  };

  const goToFreePlay = () => {
    navigate('/free');
  };

  return (
    <div
      className="game-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <img src={trumpKamalaCloud} alt="Trump Kamala Cloud" className="header-image" />
      <h3>
       The more the ministers you get, 
        <br />
       the more you win!
      </h3>
      {!isConnected ? (
        <div className="button-container">
          <button onClick={connectWallet} className="connect-button">Play to Earn</button>
          <button onClick={goToFreePlay} className="free-play-button">Play For Free</button>
        </div>
      ) : (
        <>
          {isStartingMode ? (
            <>
              <p>
                Welcome! You are in <strong>Starting Mode</strong> for your first 5 games.
              </p>
              <p>Starting Mode offers a special house edge and higher payouts!</p>
            </>
          ) : (
            <>
              <p style={{ margin: '10px 0' }}>
                Choose your difficulty level - bigger risks mean bigger rewards! Deposit ETH to play.
              </p>
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
            </>
          )}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '20px',
            }}
          >
            <button onClick={startGame}>Start Game</button>
            <button onClick={goToDeposit}>Deposit</button>
          </div>
        </>
      )}
    </div>
  );
}

export default GamePage;
