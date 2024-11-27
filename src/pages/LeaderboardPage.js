// LeaderboardPage.js
import React from 'react';
import { useWeb3ModalContext } from '../Web3ModalContext';

function LeaderboardPage() {
  const { address, isConnected, connectWallet } = useWeb3ModalContext();

  return (
    <div>
      <h1>Leaderboard</h1>
      <p>See where you rank among other players!</p>
      {isConnected ? (
        <p>Connected Address: {address}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
      {/* Display leaderboard information here */}
    </div>
  );
}

export default LeaderboardPage;
