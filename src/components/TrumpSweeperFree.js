import React, { useState, useEffect } from 'react';
import trumpImage from '../assets/trump.png';
import kamalaImage from '../assets/kamala.png';
import kamalaBeating from '../assets/kamalabeating.png';
import evilGary from "../assets/evilgary.mp4";
import trumpFist from '../assets/trumpfist.png';
import elonDoge from "../assets/elondoge.mp4";
import trumpGold from '../assets/trumpgold.png';
import './TrumpSweeper.css';

function TrumpSweeperFree({ difficulty = 'easy' }) {
  const [grid, setGrid] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [wonGame, setWonGame] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [virtualBet] = useState(1); // Fixed virtual bet of 1
  const [virtualWinnings, setVirtualWinnings] = useState(0);

  // Updated difficulty settings to match main game
  const getDifficultySettings = () => {
    switch (difficulty) {
      case 'medium':
        return { 
          gridSize: 25, 
          mineCount: 10,
          maxMultiplier: 2.5,
          payout: [1.2, 1.4, 1.6, 1.8, 2.1, 2.5]
        };
      case 'hard':
        return { 
          gridSize: 25, 
          mineCount: 12,
          maxMultiplier: 4,
          payout: [1.4, 1.8, 2.2, 2.6, 3, 4]
        };
      default: // easy
        return { 
          gridSize: 25, 
          mineCount: 8,
          maxMultiplier: 2,
          payout: [1.1, 1.2, 1.4, 1.6, 1.8, 2]
        };
    }
  };

  const { gridSize, mineCount, maxMultiplier, payout } = getDifficultySettings();

  const initializeGame = () => {
    const newGrid = Array(gridSize).fill('coin');
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const randomIndex = Math.floor(Math.random() * gridSize);
      if (newGrid[randomIndex] === 'coin') {
        newGrid[randomIndex] = 'mine';
        minesPlaced++;
      }
    }
    setGrid(newGrid);
    setRevealed(Array(gridSize).fill(false));
    setGameOver(false);
    setCurrentMultiplier(1);
    setCoinsCollected(0);
    setGameStarted(false);
    setWonGame(false);
    setCashedOut(false);
    setVirtualWinnings(0);
  };

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  const handleTileClick = (index) => {
    if (revealed[index] || gameOver || !gameStarted || cashedOut) return;

    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (grid[index] === 'mine') {
      setGameOver(true);
      setGameStarted(false);
      setGamesPlayed(prev => prev + 1);
      return;
    }

    const newCoinsCollected = coinsCollected + 1;
    setCoinsCollected(newCoinsCollected);
    
    // Updated multiplier calculation using payout array
    let newMultiplier;
    if (newCoinsCollected <= payout.length) {
      newMultiplier = payout[newCoinsCollected - 1];
    } else {
      newMultiplier = payout[payout.length - 1];
    }
    setCurrentMultiplier(newMultiplier);

    if (newMultiplier >= maxMultiplier) {
      handleCashOut();
      setWonGame(true);
      setGameStarted(false);
    }
  };

  const handleCashOut = () => {
    if (gameOver || currentMultiplier <= 1 || !gameStarted || cashedOut) return;
    
    const winnings = virtualBet * currentMultiplier;
    setVirtualWinnings(winnings);
    setCashedOut(true);
    setGameStarted(false);
    setGamesPlayed(prev => prev + 1);
  };

  const resetGame = () => {
    initializeGame();
  };

  const startGame = () => {
    setGameStarted(true);
  };

  return (
    <div className="game-container">
      <h2 className="title-dogesweeper">
        DogeSweeper Free - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Mode
      </h2>
      
      <p className="game-description">
        The more Elons you get, the more you win.
        Cash out before Gary catches you!
      </p>

      <div className="bet-multiplier-container">
        {!gameStarted && !gameOver && !wonGame && (
          <button onClick={startGame} className="start-button">
            Start Game
          </button>
        )}
        <div className="multiplier-cashout-wrapper">
          <div className="current-multiplier">Current Multiplier: {currentMultiplier.toFixed(2)}x</div>
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

      <div className={`grid grid-${difficulty}`}>
        {grid.map((tile, index) => (
          <div
            key={index}
            className={`tile ${revealed[index] ? 'revealed' : ''} ${gameOver && tile === 'mine' ? 'mine' : ''}`}
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
        <p>Coins Collected: {coinsCollected}</p>
        <p className="potential-winnings">
          Potential Win: {(virtualBet * currentMultiplier).toFixed(2)}x
        </p>
      </div>

      {/* Overlays */}
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

      {cashedOut && (
        <div className="game-over-overlay">
          <div className="cashout-box">
            <video src={elonDoge} autoPlay loop muted className="cashout-image"></video>
            <h3>You Cashed Out!</h3>
            <p>You won {virtualWinnings.toFixed(2)}x!</p>
            <p className="multiplier-text">({currentMultiplier.toFixed(2)}x multiplier)</p>
            <button onClick={resetGame} className="play-again-button">
              Play Again
            </button>
          </div>
        </div>
      )}

      {wonGame && (
        <div className="game-over-overlay">
          <div className="win-box">
            <img src={trumpGold} alt="Trump Gold" className="win-image" />
            <h3>You are a Legend!</h3>
            <p>You won the maximum {maxMultiplier}x multiplier!</p>
            <p className="suggestion-text">Ready to try the next level?</p>
            <div className="win-buttons">
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

export default TrumpSweeperFree;
