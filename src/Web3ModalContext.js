// src/Web3ModalContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { createWeb3Modal, defaultConfig, useWeb3Modal } from "@web3modal/ethers/react";
import { ethers } from "ethers";
import { supabase } from './SupabaseClient'; 

const metadata = {
  name: "DogeSweeper",
  description: "An on-chain mining game",
  url: "N/A",
  icons: ["N/A"],
};

const sepoliaMainnet = {
  chainId: 11155111,
  name: "Sepolia",
  currency: "ETH",
  explorerUrl: "https://eth-sepolia.blockscout.com",
  rpcUrl: process.env.REACT_APP_SEPOLIA_RPC_URL,
};


const baseMainnet={chainId:8453,
  name:"Base",
  currency:"ETH",
  explorerUrl:"https://base.blockscout.com/",
  rpcUrl:process.env.REACT_APP_BASE_RPC_URL,
};

const ethereumMainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: process.env.REACT_APP_ETHEREUM_RPC_URL,
};

const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;

const web3ModalInstance = createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata,
    enableInjected: true,
    enableCoinbase: true,
    rpcUrl: process.env.REACT_APP_ETHEREUM_RPC_URL,
    defaultChainId: 1,
  }),
  chains: [ethereumMainnet],
  projectId,
  enableAnalytics: true,
});

const Web3ModalContext = createContext(null);

const Web3ModalProvider = ({ children }) => {
  const [walletInfo, setWalletInfo] = useState({
    address: null,
    chainId: null,
    isConnected: false,
    provider: null,
  });

  const { open, close } = useWeb3Modal(web3ModalInstance);

  // Function to add new wallet to Supabase if it does not exist
  const addUserToSupabase = async (address) => {
    try {
      const { data, error } = await supabase
        .from("TrumpSweeper") // Replace with your table name
        .select("user")
        .eq("user", address)
        .single();

      if (error && error.code === "PGRST116") {
        // If user does not exist, insert new row with initial balance of 0
        const { error: insertError } = await supabase.from("TrumpSweeper").insert([
          { user: address, balance: 0 },
        ]);

        if (insertError) {
          console.error("Error adding new user:", insertError);
        } else {
          console.log("New user added successfully:", address);
        }
      } else if (error) {
        console.error("Supabase fetch error:", error);
      } else {
        console.log("User already exists:", address);
      }
    } catch (error) {
      console.error("Error checking user in Supabase:", error);
    }
  };

  const connectWallet = async () => {
    try {
      // Open the wallet connection modal and wait for connection
      await open();
      
      // Get the provider from window.ethereum after connection
      if (!window.ethereum) {
        throw new Error("No ethereum provider found");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
  
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
  
      setWalletInfo({
        address,
        chainId: network.chainId,
        isConnected: true,
        provider,
      });
  
      localStorage.setItem("address", address);
      localStorage.setItem("chainId", network.chainId.toString());
  
      // Add the user to Supabase
      await addUserToSupabase(address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setWalletInfo({
        address: null,
        chainId: null,
        isConnected: false,
        provider: null,
      });
  
      localStorage.removeItem("address");
      localStorage.removeItem("chainId");
    }
  };

  const disconnectWallet = () => {
    setWalletInfo({
      address: null,
      chainId: null,
      isConnected: false,
      provider: null,
    });
    localStorage.removeItem("address");
    localStorage.removeItem("chainId");
  };

  return (
    <Web3ModalContext.Provider
      value={{
        ...walletInfo,
        connectWallet,
        disconnectWallet,
        close,
      }}
    >
      {children}
    </Web3ModalContext.Provider>
  );
};

export { Web3ModalProvider, Web3ModalContext };
export const useWeb3ModalContext = () => useContext(Web3ModalContext);
