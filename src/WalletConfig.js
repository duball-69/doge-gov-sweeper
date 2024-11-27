// walletConfig.js or in your main component file
import { defaultConfig, createWeb3Modal } from "@web3modal/ethers/react";

// Define Sepolia and Ethereum networks
const sepoliaMainnet = {
  chainId: 11155111,
  name: "Sepolia",
  currency: "ETH",
  explorerUrl: "https://eth-sepolia.blockscout.com",
  rpcUrl: process.env.REACT_APP_SEPOLIA_RPC_URL,
};

const ethereumMainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: process.env.REACT_APP_ETHEREUM_RPC_URL,
};

// Define WalletConnect's metadata for TrumpSweeper
const ethersConfig = defaultConfig({
  metadata: {
    name: "TrumpSweeper",
    description: "An on-chain mining game",
    url: "N/A",
    icons: ["N/A"],
  },
  rpcUrl: process.env.REACT_APP_ETHEREUM_RPC_URL, // Default to Ethereum
  defaultChainId: 1, // Set default chain to Ethereum Mainnet
});

// Initialize WalletConnect with Sepolia and Ethereum
const web3Modal = createWeb3Modal({
  ethersConfig,
  chains: [sepoliaMainnet, ethereumMainnet], // Only Sepolia and Ethereum
  projectId: "37aeeb9efa7c2819cd48b2c62ace2529",
  enableAnalytics: true,
});

export { web3Modal };
