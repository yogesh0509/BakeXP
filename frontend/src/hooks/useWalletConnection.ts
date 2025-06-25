"use client";

import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useState } from 'react';

export const useWalletConnection = () => {
  const { wallet, connect, disconnect, isConnecting, error } = useWallet();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  
  // Connect wallet and redirect to dashboard on success
  const handleConnect = async (redirectToDashboard = true) => {
    const success = await connect();
    if (success && redirectToDashboard) {
      router.push('/dashboard');
    }
    return success;
  };
  
  // Show wallet connection modal
  const openConnectModal = () => {
    setShowModal(true);
  };
  
  // Hide wallet connection modal
  const closeConnectModal = () => {
    setShowModal(false);
  };
  
  // Disconnect wallet
  const handleDisconnect = () => {
    disconnect();
    router.push('/');
  };
  
  return {
    wallet,
    isConnecting,
    error,
    handleConnect,
    handleDisconnect,
    showModal,
    openConnectModal,
    closeConnectModal,
  };
};
