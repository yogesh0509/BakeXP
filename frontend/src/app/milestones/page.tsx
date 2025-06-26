"use client";

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/layout';
import { NFTGallery } from '@/components/ui/nft-gallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useContracts } from '@/hooks/useContracts';
import { useWallet } from '@/contexts/WalletContext';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { MilestoneNFTService } from '@/contracts/MilestoneNFTService';

export default function MilestonesPage() {
  const { wallet } = useWallet();
  const { isConnected, address, getUserXPData } = useContracts();
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get available milestones from contract service
  const availableMilestones = MilestoneNFTService.getAllMilestones();

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
      loadUserStats();
    }
  }, [address]);

  const getMilestoneEmoji = (name: string) => {
    if (name.toLowerCase().includes('first')) return '🍰';
    if (name.toLowerCase().includes('week') || name.toLowerCase().includes('streak')) return '🔥';
    if (name.toLowerCase().includes('xp') || name.toLowerCase().includes('hunter')) return '⭐';
    if (name.toLowerCase().includes('pod') || name.toLowerCase().includes('social')) return '👥';
    if (name.toLowerCase().includes('century') || name.toLowerCase().includes('100')) return '💯';
    if (name.toLowerCase().includes('level') || name.toLowerCase().includes('master')) return '👑';
    if (name.toLowerCase().includes('legend')) return '🏆';
    return '🎖️';
  };

  const getRarityColor = (rewardXP: number) => {
    if (rewardXP >= 1000) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    if (rewardXP >= 500) return 'bg-purple-100 border-purple-300 text-purple-800';
    return 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const getRarityLabel = (rewardXP: number) => {
    if (rewardXP >= 1000) return 'Legendary';
    if (rewardXP >= 500) return 'Rare';
    return 'Common';
  };

  // Check if user qualifies for a milestone (read-only check, no contract execution)
  const checkMilestoneQualification = (milestone: any) => {
    if (!userStats) return false;
    
    switch (milestone.id) {
      case 1: // First Bake
        return userStats.totalBakes >= 1;
      case 2: // Week Warrior (7-day streak)
        return userStats.streak >= 7;
      case 3: // XP Hunter (200 XP) - Updated requirement to match actual milestone  
        return Number(userStats.xp) >= 200;
      case 4: // Pod Creator (requires pod data - placeholder)
        return false; // Would need pod contract integration
      case 5: // Social Baker (requires pod data - placeholder) 
        return false; // Would need pod contract integration
      case 6: // Century Club (100 bakes)
        return userStats.totalBakes >= 100;
      case 7: // Level Master (level 10)
        return userStats.level >= 10;
      case 8: // Streak Legend (30-day streak)
        return userStats.streak >= 30;
      default:
        return false;
    }
  };

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">🏆 Milestone NFTs</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Earn exclusive NFTs by achieving baking milestones. Each NFT is a permanent 
            record of your achievements on the Starknet blockchain.
          </p>
        </div>

        {/* Not connected state */}
        {!wallet.connected && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 text-lg mb-2">🔒</div>
              <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-4">
                Please connect your wallet to view your milestone progress and NFT collection
              </p>
              <Link href="/">
                <Button>Connect Wallet</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚡ How Milestone NFTs Work
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="text-3xl">🍰</div>
                <h3 className="font-semibold">1. Bake & Earn XP</h3>
                <p className="text-sm text-gray-600">
                  Log your daily bakes to earn XP and build streaks
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl">🎯</div>
                <h3 className="font-semibold">2. Reach Milestones</h3>
                <p className="text-sm text-gray-600">
                  Complete challenges like 7-day streaks or earning 1000 XP
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl">🏆</div>
                <h3 className="font-semibold">3. Get NFT</h3>
                <p className="text-sm text-gray-600">
                  NFTs are automatically minted when you achieve milestones through baking
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Progress (only show if connected) */}
        {isConnected && userStats && (
          <Card>
            <CardHeader>
              <CardTitle>📊 Your Progress</CardTitle>
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

        {/* Available Milestones */}
        <Card>
          <CardHeader>
            <CardTitle>🎖️ Available Milestones</CardTitle>
            <p className="text-gray-600">
              Complete these challenges to unlock exclusive NFTs
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableMilestones.map((milestone) => {
                const isQualified = userStats && checkMilestoneQualification(milestone);
                return (
                  <div
                    key={milestone.id}
                    className={`p-4 rounded-lg border-2 ${getRarityColor(Number(milestone.rewardXP))} relative`}
                  >
                    {isQualified && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}
                    <div className="text-center space-y-2">
                      <div className="text-4xl">{getMilestoneEmoji(milestone.name)}</div>
                      <h3 className="font-semibold">{milestone.name}</h3>
                      <p className="text-xs">{milestone.requirement}</p>
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline" className="text-xs">
                          Achievement
                        </Badge>
                        <span className="font-medium">+{Number(milestone.rewardXP)} XP</span>
                      </div>
                      <Badge className="text-xs">
                        {getRarityLabel(Number(milestone.rewardXP))}
                      </Badge>
                      {isQualified && (
                        <Badge variant="default" className="bg-green-500 text-xs">
                          Qualified!
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* User's NFT Collection */}
        {isConnected && <NFTGallery />}

        {/* NFT Information */}
        <Card>
          <CardHeader>
            <CardTitle>ℹ️ About Your NFTs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">🔒 Blockchain Security</h3>
                <p className="text-sm text-gray-600">
                  Your NFTs are stored on Starknet, ensuring permanent ownership 
                  and verifiable achievements that can't be faked or lost.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📈 Future Value</h3>
                <p className="text-sm text-gray-600">
                  Early milestone NFTs may become more valuable as the BakeXP 
                  community grows. You'll always be recognized as an early adopter.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🎨 Unique Metadata</h3>
                <p className="text-sm text-gray-600">
                  Each NFT contains metadata about when and how you achieved 
                  the milestone, creating a permanent record of your journey.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🔄 Auto-Minting</h3>
                <p className="text-sm text-gray-600">
                  NFTs are automatically minted when you log bakes that achieve milestones. 
                  The system checks your progress and mints NFTs seamlessly!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
