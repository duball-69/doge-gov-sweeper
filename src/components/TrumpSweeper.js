// src/components/TrumpSweeper.js
import React, { useState, useEffect, useRef } from 'react';
import './TrumpSweeper.css';
import trumpImage from '../assets/trump.png';
import kamalaImage from '../assets/kamala.png';
import { supabase } from '../SupabaseClient';
import trumpSound from '../assets/trumpsound.mp3';
import kamalaSound from '../assets/kamalasound.mp3';
import kamalaBeating from '../assets/kamalabeating.png';
import trumpGold from '../assets/trumpgold.png';
import trumpFist from '../assets/trumpfist.png';
import { useNavigate } from 'react-router-dom';
import evilGary from "../assets/evilgary.mp4";
import elonDoge from "../assets/elondoge.mp4";

function TrumpSweeper({ difficulty, userAddress, balance, setBalance }) {
  const gridSize = 5;
  const [gamesPlayed, setGamesPlayed] = useState(0);

  // Difficulty settings including Starting Mode with -15% house edge
  const difficultySettings = {
    starting: {
      maxMultiplier: 1.9, // Adjusted for -15% house edge
      mines: 5, // Reduced mines for easier gameplay
      payout: [1.2, 1.4, 1.6, 1.8, 1.9], // Higher payouts for Starting Mode
    },
    easy: {
      maxMultiplier: 2,
      mines: 8,
      payout: [1.1, 1.2, 1.4, 1.6, 1.8, 2],
    },
    medium: {
      maxMultiplier: 2.5,
      mines: 10,
      payout: [1.2, 1.4, 1.6, 1.8, 2.1, 2.5],
    },
    hard: {
      maxMultiplier: 4,
      mines: 12,
      payout: [1.4, 1.8, 2.2, 2.6, 3, 4],
    },
  };

  // Determine the mode based on gamesPlayed
  const mode = gamesPlayed < 5 ? 'starting' : difficulty; // Starting Mode for first 5 games
  const { maxMultiplier, mines, payout } = difficultySettings[mode];

  const [grid, setGrid] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [status, setStatus] = useState('');
  const [cashedOut, setCashedOut] = useState(false);
  const [cashoutAmount, setCashoutAmount] = useState(0);
  const [wonGame, setWonGame] = useState(false); // Track if the user won

  const trumpAudio = useRef(new Audio(trumpSound));
  const kamalaAudio = useRef(new Audio(kamalaSound));

  const navigate = useNavigate();

  useEffect(() => {
    fetchGamesPlayed();
  }, [userAddress]);

  useEffect(() => {
    initializeGame();
  }, [mode]);

  // Function to fetch the number of games played from Supabase
  const fetchGamesPlayed = async () => {
    if (!userAddress) return;
    try {
      const { data, error } = await supabase
        .from('TrumpSweeper')
        .select('games')
        .eq('user', userAddress)
        .single();
      if (error) throw error;
      setGamesPlayed(data?.games || 0);
    } catch (error) {
      console.error('Error fetching games count:', error);
    }
  };

  // Initialize the game grid
  const initializeGame = () => {
    const totalTiles = gridSize * gridSize;
    const newGrid = Array(totalTiles).fill('coin');
    const mineIndices = new Set();

    while (mineIndices.size < mines) {
      mineIndices.add(Math.floor(Math.random() * totalTiles));
    }

    mineIndices.forEach((index) => {
      newGrid[index] = 'mine';
    });

    setGrid(newGrid);
    setRevealed(Array(totalTiles).fill(false));
    setCoinsCollected(0);
    setCurrentMultiplier(1);
    setGameOver(false);
    setGameStarted(false);
    setStatus('');
    setBetAmount('');
    setCashedOut(false);
    setWonGame(false);
  };

  // Add this function to check if balance is sufficient
  const checkBalance = (amount) => {
    if (!amount) return true; // Skip check if no amount entered
    return parseFloat(balance) >= parseFloat(amount);
  };

  // Update the placeBet function
  const placeBet = async () => {
    if (!betAmount || isNaN(betAmount) || parseFloat(betAmount) <= 0) {
      setStatus('Please enter a valid bet amount.');
      return;
    }

    if (!checkBalance(betAmount)) {
      setStatus('Insufficient balance. Please deposit more to play.');
      return;
    }

    try {
      const bet = parseFloat(betAmount);
      const newBalance = balance - bet;
      await updateBalance(userAddress, newBalance);
      setBalance(parseFloat(newBalance.toFixed(4))); // Ensure balance is a number with 4 decimals
      setStatus('Bet placed. Good luck!');
      setGameStarted(true);
      // Do not increment gamesPlayed here; increment after game ends
    } catch (error) {
      console.error('Error placing bet:', error);
      setStatus('Failed to place bet. Please try again.');
    }
  };

  // Increment games played in Supabase
  const incrementGamesPlayed = async () => {
    try {
      const newGamesPlayed = gamesPlayed + 1;
      const { error } = await supabase
        .from('TrumpSweeper')
        .upsert(
          { user: userAddress, games: newGamesPlayed },
          { onConflict: 'user' }
        );
      if (error) throw error;
      setGamesPlayed(newGamesPlayed);
    } catch (error) {
      console.error('Error incrementing games played:', error);
    }
  };

  // Handle tile clicks
  const handleTileClick = (index) => {
    if (!gameStarted || revealed[index] || gameOver || wonGame) return;

    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (grid[index] === 'mine') {
      kamalaAudio.current.currentTime = 0;
      kamalaAudio.current.play().catch(error => console.log('Audio playback failed:', error));
      
      setGameOver(true);
      setStatus('Game Over! You hit a mine.');
      incrementGamesPlayed();
    } else {
      trumpAudio.current.currentTime = 0;
      trumpAudio.current.play().catch(error => console.log('Audio playback failed:', error));
      
      const newCoinsCollected = coinsCollected + 1;
      setCoinsCollected(newCoinsCollected);

      let newMultiplier;
      if (newCoinsCollected <= payout.length) {
        newMultiplier = payout[newCoinsCollected - 1];
      } else {
        newMultiplier = payout[payout.length - 1];
      }
      setCurrentMultiplier(newMultiplier);

      // Check if the max multiplier is reached
      if (newMultiplier >= maxMultiplier) {
        setStatus(
          `Congratulations! You've reached the max multiplier of ${maxMultiplier}x and won the game!`
        );
        setWonGame(true);
        setGameStarted(false);
        handleAutoCashOut();
      }
    }
  };

  // Automatically cash out when max multiplier is reached
  const handleAutoCashOut = async () => {
    // Prevent auto cash out if already cashed out or game is over
    if (gameOver || currentMultiplier <= 1 || cashedOut || !gameStarted) return;

    const winnings = parseFloat(betAmount) * currentMultiplier;
    try {
      const newBalance = balance + winnings;
      await updateBalance(userAddress, newBalance);
      setBalance(parseFloat(newBalance.toFixed(4))); // Ensure balance is a number with 4 decimals
      setCashedOut(true);
      setGameStarted(false);
      incrementGamesPlayed(); // Increment games played after auto cash out
      setStatus(`Congratulations! You've won ${winnings.toFixed(4)} ETH!`);
      initializeGame(); // Reset the game after auto cash out
    } catch (error) {
      console.error('Error updating balance in Supabase:', error);
      setStatus('Failed to update balance. Please try again.');
    }
  };

  // Handle manual cash out
  const handleCashOut = async () => {
    if (gameOver || currentMultiplier <= 1 || !gameStarted || cashedOut) return;

    const winnings = parseFloat(betAmount) * currentMultiplier;
    try {
      const newBalance = balance + winnings;
      await updateBalance(userAddress, newBalance);
      setBalance(parseFloat(newBalance.toFixed(4)));
      setCashoutAmount(winnings);
      setCashedOut(true);
      setGameStarted(false);
      incrementGamesPlayed();
    } catch (error) {
      console.error('Error updating balance in Supabase:', error);
      setStatus('Failed to cash out. Please try again.');
    }
  };

  // Update balance in Supabase
  const updateBalance = async (walletAddress, newBalance) => {
    const { error } = await supabase
      .from('TrumpSweeper')
      .update({ balance: newBalance })
      .eq('user', walletAddress);

    if (error) throw new Error('Failed to update balance');
  };

  // Reset the game manually
  const resetGame = () => {
    initializeGame();
  };

  // Calculate potential winnings
  const potentialWinnings = gameStarted ? (parseFloat(betAmount) * currentMultiplier).toFixed(4) : '0.0000';

  const goToDeposit = () => {
    navigate('/deposit');
  };

  return (
    <div className="game-container">
      <h2 className="title-dogesweeper">
        DogeSweeper -{' '}
        {mode === 'starting'
          ? 'Starting Mode'
          : `${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`}
      </h2>
      
      <p className="game-description">
        Get more you get, the more you win. Cash out before hitting a bomb!
      </p>

      <div className="bet-multiplier-container">
        {!gameStarted && !gameOver && !wonGame && (
          <div className="bet-input-container">
            <input
              type="number"
              placeholder={balance <= 0 ? "Please deposit to play" : "Enter bet amount in DOGEGOV"}
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              min="0"
              step="0.0001"
              disabled={balance <= 0}
            />
            <button 
              onClick={placeBet} 
              disabled={!betAmount || gameOver || balance <= 0}
              className={balance <= 0 ? 'deposit-needed' : ''}
            >
              {balance <= 0 ? 'Deposit to Play' : 'Place Bet'}
            </button>
          </div>
        )}
        <div className="multiplier-cashout-container">
          <p className="current-multiplier">Current Multiplier: {currentMultiplier}x</p>
          {gameStarted && !gameOver && !wonGame && (
            <button
              onClick={handleCashOut}
              className="cashout-button"
              disabled={currentMultiplier <= 1}
            >
              Cash Out
            </button>
          )}
        </div>
      </div>

      <div className="grid">
        {grid.map((tile, index) => (
          <div
            key={index}
            className={`tile ${
              revealed[index] ? 'revealed' : ''
            } ${gameOver && tile === 'mine' ? 'mine' : ''}`}
            onClick={() => handleTileClick(index)}
          >
            {revealed[index] && tile === 'coin' ? (
              <img src={trumpImage} alt="Trump Coin" className="coin-image" />
            ) : (
              revealed[index] && tile === 'mine' ? <img src={kamalaImage} alt="Kamala" className="coin-image" /> : ''
            )}
          </div>
        ))}
      </div>

      <div className="stats-container">
        <p>Games Played: {gamesPlayed}</p>
        <p>Current Balance: {balance.toFixed(4)} ETH</p>
        <p>Coins Collected: {coinsCollected}</p>
        <p className="potential-winnings">
          Potential Win: {potentialWinnings} ETH
        </p>
      </div>

      {status && <p className="status-message">{status}</p>}

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-box">
          <video src={evilGary} autoPlay loop muted className="game-over-image"></video>
            <h3>You Lost!</h3>
            <p>Gary wins again. Give me all your crypto buhahaha</p>
            <button onClick={resetGame} className="try-again-button">
              Try Again
            </button>
          </div>
        </div>
      )}

      {wonGame && (
        <div className="win-message">
          Congratulations! You've won by reaching the max multiplier!
        </div>
      )}

      <button
        onClick={handleCashOut}
        className="cashout-button"
        disabled={
          !gameStarted || gameOver || currentMultiplier === 1 || cashedOut || wonGame
        }
      >
        Cash Out
      </button>
      <div className="game-buttons">
        <button 
          onClick={resetGame} 
          className="reset-button"
          disabled={gameStarted && !gameOver && !wonGame && !cashedOut}
        >
          {gameOver || wonGame ? 'Play Again' : 'Reset Game'}
        </button>
        <button 
          onClick={goToDeposit} 
          className="deposit-button"
        >
          Deposit
        </button>
      </div>

      {cashedOut && (
        <div className="game-over-overlay">
          <div className="cashout-box">
          <video src={elonDoge} autoPlay loop muted className="cashout-image"></video>
            <h3>You Cashed Out!</h3>
            <p>You are a legend and won {cashoutAmount.toFixed(4)} ETH!</p>
            <p className="multiplier-text">({currentMultiplier}x multiplier)</p>
            <button onClick={resetGame} className="play-again-button">
              Play Again
            </button>
          </div>
        </div>
      )}

      {wonGame && (
        <div className="game-over-overlay">
          <div className="win-box">
            <img 
              src={trumpGold} 
              alt="Trump Gold" 
              className="win-image"
            />
            <h3>You are a Legend!</h3>
            <p>You won the maximum {maxMultiplier}x multiplier!</p>
            <p className="suggestion-text">Ready to try the next level?</p>
            <div className="win-buttons">
              <button 
                onClick={() => {
                  const nextDifficulty = difficulty === 'easy' ? 'medium' : 'hard';
                  navigate(`/play-game?difficulty=${nextDifficulty}`);
                }} 
                className="next-level-button"
              >
                Try Next Level
              </button>
              <button onClick={resetGame} className="play-again-button">
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrumpSweeper;
