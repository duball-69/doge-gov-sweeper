// src/pages/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';
import trumphomeImage from '../assets/trump2.png';


function HomePage() {
  const navigate = useNavigate();

  const handlePlay = () => {
    navigate('/play'); // Redirects to the game page
  };

  return (
    <div className="homepage">
      <img src={trumphomeImage} alt="Trump vs Kamala" className="trumpvskamala-image" />
      <h1>Welcome to President TrumpSweeper</h1>
      <p>
        Play TrumpSweeper! Reveal tiles to get Trump, but watch out for Kamala. She will take your crypto. The more Trump you get, the more you earn!
      </p>
      <button className="play-button" onClick={handlePlay}>
        Start Playing
      </button>
    </div>
  );
}

export default HomePage;
