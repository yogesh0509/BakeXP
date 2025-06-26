"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';
import { contractManager } from '@/contracts';

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

// Format address to short form (0x1234...5678)
const formatShortAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected, account } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect: starkDisconnect } = useDisconnect();
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedConnection, setHasAttemptedConnection] = useState(false);

  // Initialize wallet state
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balance: null,
    shortAddress: null,
  });

  // Update wallet state when account changes
  useEffect(() => {
    if (isConnected && address) {
      setWallet(prev => ({
        ...prev,
        connected: true,
        address: address,
        shortAddress: formatShortAddress(address),
      }));

      // Set account in contract manager when wallet connects
      if (account) {
        console.log('Setting account in contract manager:', address);
        contractManager.setAccount(account as any);
      }
    } else {
      // Only update to disconnected state if we had previously attempted connection
      // This prevents the wallet from appearing disconnected on initial load
      if (hasAttemptedConnection || wallet.connected) {
        setWallet(prev => ({
          ...prev,
          connected: false,
          address: null,
          shortAddress: null,
        }));
        
        console.log('Clearing account in contract manager');
        contractManager.setAccount(null);
      }
    }
  }, [address, isConnected, account, hasAttemptedConnection, wallet.connected]);

  // Connect to wallet (only when explicitly called by user)
  const handleConnect = async (): Promise<boolean> => {
    setError(null);
    setHasAttemptedConnection(true);
    
    try {
      // Get the first available connector
      const connector = connectors[0];
      if (!connector) {
        setError('No wallet found. Please install a supported wallet.');
        return false;
      }

      await connect({ connector });
      return true;
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again.');
      return false;
    }
  };

  // Disconnect from wallet
  const handleDisconnect = () => {
    setError(null);
    setHasAttemptedConnection(false);
    
    // Clear account in contract manager before disconnecting
    contractManager.setAccount(null);
    starkDisconnect();
    
    // Immediately update wallet state
    setWallet({
      connected: false,
      address: null,
      balance: null,
      shortAddress: null,
    });
  };

  // Prepare value object for the context provider
  const value = {
    wallet,
    connect: handleConnect,
    disconnect: handleDisconnect,
    isConnecting: isPending,
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
