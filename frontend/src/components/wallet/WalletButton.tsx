"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, ChevronDown, User, ExternalLink } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import WalletConnectModal from "./WalletConnectModal";
import { useWalletConnection } from "@/hooks/useWalletConnection";

export default function WalletButton() {
  const { 
    wallet, 
    isConnecting, 
    error, 
    handleConnect, 
    handleDisconnect,
    showModal,
    openConnectModal,
    closeConnectModal
  } = useWalletConnection();

  return (
    <>
      {wallet.connected ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <span className="hidden md:inline">{wallet.shortAddress}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="flex justify-between text-sm text-muted-foreground">
              <span>Balance</span>
              <span className="font-medium text-foreground">{wallet.balance} ETH</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex w-full cursor-pointer items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex cursor-pointer items-center text-muted-foreground">
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>View on Explorer</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="flex cursor-pointer items-center text-destructive focus:text-destructive"
              onClick={handleDisconnect}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Disconnect</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button 
          onClick={openConnectModal}
          className="gap-2" 
          disabled={isConnecting}
        >
          <Wallet className="h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}

      <WalletConnectModal
        isOpen={showModal}
        onClose={closeConnectModal}
        onConnect={handleConnect}
        isConnecting={isConnecting}
        error={error}
      />
    </>
  );
}
