"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2, Key, Shield } from 'lucide-react';
import { useConnect } from '@starknet-react/core';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => Promise<boolean>;
  isConnecting: boolean;
  error: string | null;
}

// Helper function to get wallet icon
const WalletIcon = ({ name }: { name: string }) => {
  switch (name.toLowerCase()) {
    case 'argentx':
      return <Key className="w-8 h-8" />;
    case 'braavos':
      return <Shield className="w-8 h-8" />;
    default:
      return <Wallet className="w-8 h-8" />;
  }
};

export default function WalletConnectModal({
  isOpen,
  onClose,
  onConnect,
  isConnecting,
  error
}: WalletConnectModalProps) {
  const { connectors } = useConnect();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  
  const handleWalletSelect = (walletId: string) => {
    setSelectedWallet(walletId);
  };
  
  const handleConnect = async () => {
    const success = await onConnect();
    if (success) {
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Connect your wallet to access BakeXP features
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                selectedWallet === connector.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleWalletSelect(connector.id)}
              disabled={isConnecting}
            >
              <div className="text-2xl">
                <WalletIcon name={connector.name} />
              </div>
              <div className="text-left">
                <h3 className="font-medium">{connector.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {connector.name === 'Braavos'
                    ? 'Connect using Braavos wallet'
                    : connector.name === 'ArgentX'
                    ? 'Connect using ArgentX browser extension'
                    : 'Connect using wallet'}
                </p>
              </div>
            </button>
          ))}
          
          {error && (
            <div className="text-destructive text-sm mt-2 text-center">
              {error}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 mt-2">
          <Button variant="outline" onClick={onClose} disabled={isConnecting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConnect} 
            disabled={!selectedWallet || isConnecting}
            className="gap-2"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                Connect
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
