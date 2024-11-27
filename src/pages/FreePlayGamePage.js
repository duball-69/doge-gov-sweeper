// src/pages/FreePlayGamePage.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import TrumpSweeperFree from '../components/TrumpSweeperFree';
import './FreePlayGamePage.css';

function FreePlayGamePage() {
  const location = useLocation();
  const difficulty = new URLSearchParams(location.search).get('difficulty') || 'easy';

  return (
    <div className="play-game-page">
      <TrumpSweeperFree difficulty={difficulty} />
    </div>
  );
}

export default FreePlayGamePage;
