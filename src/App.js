// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Web3ModalProvider } from "./Web3ModalContext";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import FreePlayGamePage from "./pages/FreePlayGamePage";
import DepositPage from "./pages/DepositPage";
import DepositDogePage from "./pages/DepositeDogePage";
import PlayGamePage from "./pages/PlayGamePage";
import WithdrawalPage from "./pages/WithdrawalPage";
import WithdrawalDogePage from "./pages/WithdrawalDogePage";
import Footer from "./components/Footer";
import FreeGame from "./pages/FreeGame";


function App() {
  return (
    <Web3ModalProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/play" element={<GamePage />} />
          <Route path="/play-game" element={<PlayGamePage />} />
          <Route path="/free" element={<FreeGame />} />
          <Route path="/free-play" element={<FreePlayGamePage />} />
          <Route path="/deposit" element={<DepositPage />} />
          <Route path="/withdrawal" element={<WithdrawalPage />} />
          <Route path="/depositdogegov" element={<DepositDogePage/>}/>
          <Route path="/withdrawaldogegov" element={<WithdrawalDogePage/>}/>
        </Routes>
        <Footer />
      </Router>
    </Web3ModalProvider>
  );
}

export default App;
