// src/pages/FreeGame.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FreeGame.css';
import trumpKamalaCloud from '../assets/trumpkamalacloud.png';

function FreeGame() {
  const [difficulty, setDifficulty] = useState('easy');
  const navigate = useNavigate();

  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value);
  };

  const startGame = () => {
    navigate(`/free-play?difficulty=${difficulty}`);
  };

  const goToRealMoney = () => {
    navigate('/play');
  };

  return (
    <div className="game-page-container">
      <div className="game-page-content">
        
        <h2 className="subtitle">
          Catch all Elons, avoid all Garys,
         
        </h2>

        <div className="real-money-banner">
          <button onClick={goToRealMoney} className="real-money-button">
            Play with Real Money 🚀
          </button>
        </div>

        <div className="game-setup">
          <p className="difficulty-description">
            The bigger risks mean bigger rewards!
          </p>
          
          <div className="difficulty-selector">
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

          <button 
            onClick={startGame} 
            className="start-game-button"
          >
            Test for Free 
          </button>
        </div>
      </div>
    </div>
  );
}

export default FreeGame;
