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
      <div className="content-container">
        <img src={trumphomeImage} alt="Trump vs Kamala" className="trumpvskamala-image" />
        <div className="text-container">
          <h1>Help Elon clean the government</h1>
          <p>
            Play DogeSweeper! Catch them all , but be careful with the libtards. They will take your kids, your crypto. The more ministers you clean, the more you earn!
          </p>
          <button className="small-play-button" onClick={handlePlay}>
            Start Playing
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
