"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types for our wallet state
type WalletState = {
  connected: boolean;
  address: string | null;
  balance: string | null;
  shortAddress: string | null;
};

// Define types for our wallet context
type WalletContextType = {
  wallet: WalletState;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  isConnecting: boolean;
  error: string | null;
};

// Create the wallet context with default values
export const WalletContext = createContext<WalletContextType>({
  wallet: {
    connected: false,
    address: null,
    balance: null,
    shortAddress: null,
  },
  connect: async () => false,
  disconnect: () => {},
  isConnecting: false,
  error: null,
});

// Hook to use the wallet context
export const useWallet = () => useContext(WalletContext);

// Generate a mock wallet address
const generateMockAddress = () => {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

// Format address to short form (0x1234...5678)
const formatShortAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize wallet state
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balance: null,
    shortAddress: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for saved wallet connection on component mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('bakexp_wallet');
    if (savedWallet) {
      try {
        const walletData = JSON.parse(savedWallet);
        if (walletData.connected && walletData.address) {
          setWallet({
            ...walletData,
            shortAddress: formatShortAddress(walletData.address),
          });
        }
      } catch (e) {
        console.error('Error parsing saved wallet data');
        localStorage.removeItem('bakexp_wallet');
      }
    }
  }, []);

  // Connect to wallet (mock implementation)
  const connect = async (): Promise<boolean> => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock connection success
      const address = generateMockAddress();
      const balance = '1.25'; // ETH
      
      // Update wallet state
      const newWalletState = {
        connected: true,
        address,
        balance,
        shortAddress: formatShortAddress(address),
      };
      
      setWallet(newWalletState);
      
      // Save to local storage
      localStorage.setItem('bakexp_wallet', JSON.stringify(newWalletState));
      
      return true;
    } catch (e) {
      console.error('Error connecting wallet:', e);
      setError('Failed to connect wallet. Please try again.');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Disconnect from wallet
  const disconnect = () => {
    setWallet({
      connected: false,
      address: null,
      balance: null,
      shortAddress: null,
    });
    
    // Remove from local storage
    localStorage.removeItem('bakexp_wallet');
  };
  
  // Prepare value object for the context provider
  const value = {
    wallet,
    connect,
    disconnect,
    isConnecting,
    error,
  };
  
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// This context is prepared to be easily extended with actual Starknet wallet integration
// For a real implementation, you would:
// 1. Add dependencies for starknet.js or use-starknet
// 2. Replace the mock connect function with actual wallet connection logic
// 3. Add support for multiple wallet providers (ArgentX, Braavos, etc.)
// 4. Add contract interaction methods
