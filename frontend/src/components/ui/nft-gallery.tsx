"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { NFTCard } from './nft-card';
import { useContracts } from '@/hooks/useContracts';
import { MilestoneNFTService } from '@/contracts/MilestoneNFTService';
import type { UserMilestone } from '@/contracts';

interface NFTGalleryProps {
  className?: string;
}

interface LocalMilestone {
  id: number;
  name: string;
  description: string;
  rewardXP: bigint;
  mintedAt: number;
  tokenId: bigint;
  achievedAt: number;
}

export const NFTGallery: React.FC<NFTGalleryProps> = ({ className = "" }) => {
  const { getUserMilestones, isConnected, address, getUserXPData } = useContracts();
  const [nfts, setNfts] = useState<UserMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'common' | 'rare' | 'legendary'>('all');

  // Load user's NFTs from contracts and localStorage
  const loadNFTs = async () => {
    if (!isConnected || !address) return;
    
    setIsLoading(true);
    try {
      // Try to get from contracts first
      let milestones = await getUserMilestones();
      
      // If no milestones from contract, check localStorage for achieved milestones
      if (!milestones || milestones.length === 0) {
        milestones = getAchievedMilestonesFromStorage();
      }
      
      setNfts(milestones || []);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
      // Fallback to localStorage
      const localMilestones = getAchievedMilestonesFromStorage();
      setNfts(localMilestones);
    } finally {
      setIsLoading(false);
    }
  };

  // Get achieved milestones from localStorage
  const getAchievedMilestonesFromStorage = (): UserMilestone[] => {
    if (!address) return [];
    
    try {
      const achievedKey = `bakexp_milestones_${address}`;
      const achieved = localStorage.getItem(achievedKey);
      
      if (achieved) {
        const achievedIds = JSON.parse(achieved);
        return achievedIds.map((id: number) => {
          const milestone = MilestoneNFTService.getMilestoneDefinition(id);
          if (milestone) {
            return {
              id: milestone.id,
              name: milestone.name,
              description: milestone.description,
              requirement: milestone.requirement,
              rewardXP: milestone.rewardXP,
              mintedAt: Date.now(),
              tokenId: BigInt(milestone.id)
            };
          }
          return null;
        }).filter(Boolean);
      }
    } catch (error) {
      console.error('Failed to load milestones from storage:', error);
    }
    
    return [];
  };

  // Check and update achieved milestones based on current stats
  const checkAndUpdateMilestones = async () => {
    if (!address) return;
    
    try {
      const userStats = await getUserXPData();
      if (!userStats) return;

      const achievedKey = `bakexp_milestones_${address}`;
      const existingAchieved = JSON.parse(localStorage.getItem(achievedKey) || '[]');
      const newlyAchieved = [];

      // Check each milestone
      const allMilestones = MilestoneNFTService.getAllMilestones();
      for (const milestone of allMilestones) {
        if (existingAchieved.includes(milestone.id)) continue;

        let isAchieved = false;
        switch (milestone.id) {
          case 1: // First Bake
            isAchieved = userStats.totalBakes >= 1;
            break;
          case 2: // Week Warrior (7-day streak)
            isAchieved = userStats.streak >= 7;
            break;
          case 3: // XP Hunter (200 XP)
            isAchieved = Number(userStats.xp) >= 200;
            break;
          case 6: // Century Club (100 bakes)
            isAchieved = userStats.totalBakes >= 100;
            break;
          case 7: // Level Master (level 10)
            isAchieved = userStats.level >= 10;
            break;
          case 8: // Streak Legend (30-day streak)
            isAchieved = userStats.streak >= 30;
            break;
        }

        if (isAchieved) {
          newlyAchieved.push(milestone.id);
        }
      }

      // Update localStorage if new milestones achieved
      if (newlyAchieved.length > 0) {
        const updatedAchieved = [...existingAchieved, ...newlyAchieved];
        localStorage.setItem(achievedKey, JSON.stringify(updatedAchieved));
        
        // Reload NFTs to show new achievements
        await loadNFTs();
        
        console.log('New milestones achieved:', newlyAchieved);
      }
    } catch (error) {
      console.error('Failed to check milestones:', error);
    }
  };

  // Load NFTs when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      loadNFTs();
      checkAndUpdateMilestones();
    }
  }, [isConnected, address]);

  // Filter NFTs by rarity
  const filteredNFTs = nfts.filter(nft => {
    if (filter === 'all') return true;
    const xpValue = Number(nft.rewardXP);
    if (filter === 'legendary') return xpValue >= 1000;
    if (filter === 'rare') return xpValue >= 500 && xpValue < 1000;
    if (filter === 'common') return xpValue < 500;
    return true;
  });

  const getRarityCount = (rarity: 'common' | 'rare' | 'legendary') => {
    return nfts.filter(nft => {
      const xpValue = Number(nft.rewardXP);
      if (rarity === 'legendary') return xpValue >= 1000;
      if (rarity === 'rare') return xpValue >= 500 && xpValue < 1000;
      if (rarity === 'common') return xpValue < 500;
      return false;
    }).length;
  };

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 text-lg mb-2">🔒</div>
          <p className="text-gray-600">Connect your wallet to view your NFT collection</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                🏆 My NFT Collection
                <Badge variant="secondary">{nfts.length}</Badge>
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Achievement NFTs earned through your baking journey
              </p>
            </div>
            <Button 
              onClick={() => {
                checkAndUpdateMilestones();
                loadNFTs();
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Refresh Collection
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Rarity Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({nfts.length})
        </Button>
        <Button
          variant={filter === 'common' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('common')}
        >
          Common ({getRarityCount('common')})
        </Button>
        <Button
          variant={filter === 'rare' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('rare')}
        >
          Rare ({getRarityCount('rare')})
        </Button>
        <Button
          variant={filter === 'legendary' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('legendary')}
        >
          Legendary ({getRarityCount('legendary')})
        </Button>
      </div>

      {/* NFT Grid */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your NFT collection...</p>
          </CardContent>
        </Card>
      ) : filteredNFTs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🎖️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No NFTs Yet' : `No ${filter} NFTs`}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'Start baking to earn your first milestone NFT!'
                : `Keep baking to unlock ${filter} milestone NFTs!`
              }
            </p>
            <Button onClick={() => {
              checkAndUpdateMilestones();
              loadNFTs();
            }}>
              Check for Milestones
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNFTs.map((nft) => (
            <NFTCard
              key={`${nft.id}-${nft.tokenId}`}
              id={nft.id}
              name={nft.name}
              description={nft.description}
              rewardXP={nft.rewardXP}
              mintedAt={nft.mintedAt}
              tokenId={nft.tokenId}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 