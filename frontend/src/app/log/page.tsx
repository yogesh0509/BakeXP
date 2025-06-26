"use client";

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/layout';
import { BakeLogger } from '@/components/ui/bake-logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useContracts } from '@/hooks/useContracts';
import { useWallet } from '@/contexts/WalletContext';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LogPage() {
  const { isConnected, address, getUserXPData } = useContracts();
  const { wallet } = useWallet();
  const [showRecentBakes, setShowRecentBakes] = useState(false);
  const [recentBakes, setRecentBakes] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBakeLogged = async (bakeId: string) => {
    console.log('New bake logged:', bakeId);
    // Refresh recent bakes and user stats
    await loadRecentBakes();
    await loadUserStats();
  };

  const loadRecentBakes = async () => {
    if (!address) return;
    
    const historyKey = `bakexp_history_${address}`;
    const savedHistory = localStorage.getItem(historyKey);
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      setRecentBakes(history.slice(0, 5)); // Show last 5 bakes
    }
  };

  const loadUserStats = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const xpData = await getUserXPData();
      if (xpData) {
        setUserStats(xpData);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      loadRecentBakes();
      loadUserStats();
    }
  }, [address]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if user has baked today
  const hasBakedToday = () => {
    if (!userStats?.lastBakeTimestamp) return false;
    const today = new Date().toDateString();
    const lastBake = new Date(userStats.lastBakeTimestamp * 1000).toDateString();
    return today === lastBake;
  };

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">📝 Log Your Bake</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your baking creations, earn XP, and unlock milestone NFTs!
          </p>
        </div>

        {/* Not connected state */}
        {!wallet.connected && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 text-lg mb-2">🔒</div>
              <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-4">
                Please connect your wallet to log your bakes and earn NFTs
              </p>
              <Link href="/">
                <Button>Connect Wallet</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Already baked today */}
        {wallet.connected && hasBakedToday() && (
          <Card>
            <CardContent className="p-6 text-center bg-green-50 border-green-200">
              <div className="text-green-600 text-4xl mb-2">✅</div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">Already Baked Today!</h2>
              <p className="text-green-700 mb-4">
                You've already logged a bake for today. Come back tomorrow to continue your streak!
              </p>
              <div className="flex gap-2 justify-center">
                <Link href="/dashboard">
                  <Button variant="outline">View Dashboard</Button>
                </Link>
                <Link href="/milestones">
                  <Button>Check Milestones</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats - Real data from contracts */}
        {isConnected && userStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Your Progress
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{Number(userStats.xp)}</div>
                  <div className="text-sm text-gray-600">Total XP</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{userStats.streak}</div>
                  <div className="text-sm text-gray-600">Day streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{userStats.level}</div>
                  <div className="text-sm text-gray-600">Current level</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{userStats.totalBakes}</div>
                  <div className="text-sm text-gray-600">Total bakes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Bake Logger - only show if connected and hasn't baked today */}
        {wallet.connected && !hasBakedToday() && (
          <BakeLogger onBakeLogged={handleBakeLogged} />
        )}

        {/* Tips for Better Rewards */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Tips for Maximum Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  📸 Upload Photos
                </h3>
                <p className="text-sm text-gray-600">
                  Add photos of your bakes to create a visual diary and potentially 
                  unlock special photo-based achievements in the future.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  🔥 Maintain Streaks
                </h3>
                <p className="text-sm text-gray-600">
                  Bake daily to build streaks. Longer streaks unlock rare milestone 
                  NFTs and provide bonus XP multipliers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  👥 Join Pods
                </h3>
                <p className="text-sm text-gray-600">
                  Participating in baking pods gives you additional XP and unlocks 
                  social milestone achievements.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  🏷️ Use Tags
                </h3>
                <p className="text-sm text-gray-600">
                  Tag your bakes with categories like "bread", "dessert", or "experimental" 
                  to track your baking diversity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
