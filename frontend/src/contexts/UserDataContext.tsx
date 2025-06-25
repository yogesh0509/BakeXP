"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useWallet } from './WalletContext';
import * as StarknetService from '@/services/StarknetService';
import { UserMilestone, BakePod } from '@/services/StarknetService';

// Define user stats types
export type GardenStage = 'Seed' | 'Seedling' | 'Sprout' | 'Plant' | 'Tree' | 'Garden';

export type UserStats = {
  xp: number;
  level: number;
  streak: number;
  lastBakeTimestamp: number | null; // Unix timestamp
  totalBakes: number;
  gardenStage: GardenStage;
  milestones: string[]; // Array of milestone IDs earned
  nickname: string;
  percentToNextLevel: number;
  percentToNextGardenStage: number;
  nextGardenStage: GardenStage | null;
  title: string;
};

type BakeLogEntry = {
  id: string;
  timestamp: number;
  description: string;
  imageUrl: string;
  xpEarned: number;
  tags: string[];
};

// Define context type
type UserDataContextType = {
  userStats: UserStats | null;
  bakeHistory: BakeLogEntry[];
  isLoading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
  logBake: (description: string, imageUrl: string, tags: string[]) => Promise<boolean>;
  hasBakedToday: boolean;
};

// Create the context with default values
export const UserDataContext = createContext<UserDataContextType>({
  userStats: null,
  bakeHistory: [],
  isLoading: false,
  error: null,
  refreshUserData: async () => {},
  logBake: async () => false,
  hasBakedToday: false,
});

// Hook to use the user data context
export const useUserData = () => useContext(UserDataContext);

// Calculate title based on level
const calculateTitle = (level: number): string => {
  if (level < 3) return 'Baker';
  if (level < 5) return 'Skilled Baker';
  if (level < 7) return 'Master Baker';
  if (level < 9) return 'Pastry Chef';
  return 'Legendary Baker';
};

// Get next garden stage
const getNextGardenStage = (currentStage: GardenStage): GardenStage | null => {
  switch (currentStage) {
    case 'Seed': return 'Seedling';
    case 'Seedling': return 'Sprout';
    case 'Sprout': return 'Plant';
    case 'Plant': return 'Tree';
    case 'Tree': return 'Garden';
    case 'Garden': return null;
    default: return null;
  }
};

// User Data Provider component
export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { wallet } = useWallet();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [bakeHistory, setBakeHistory] = useState<BakeLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasBakedToday, setHasBakedToday] = useState(false);

  // Load user data when wallet connects
  useEffect(() => {
    if (wallet.connected && wallet.address) {
      refreshUserData();
    } else {
      setUserStats(null);
      setBakeHistory([]);
    }
  }, [wallet.connected, wallet.address]);

  // Check if user has baked today
  useEffect(() => {
    if (userStats?.lastBakeTimestamp) {
      const lastBakeDate = new Date(userStats.lastBakeTimestamp);
      const today = new Date();
      
      setHasBakedToday(
        lastBakeDate.getDate() === today.getDate() &&
        lastBakeDate.getMonth() === today.getMonth() &&
        lastBakeDate.getFullYear() === today.getFullYear()
      );
    } else {
      setHasBakedToday(false);
    }
  }, [userStats]);

  // Refresh user data - connects to Starknet service
  const refreshUserData = async (): Promise<void> => {
    if (!wallet.connected || !wallet.address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get XP and streak from Starknet service
      const xp = await StarknetService.getXp(wallet.address);
      const { streak, lastBake } = await StarknetService.getStreak(wallet.address);
      
      // Load milestones (NFTs)
      const milestones = await StarknetService.getUserMilestones(wallet.address);
      
      // Calculate derived stats using Starknet service
      const level = StarknetService.calculateLevel(xp);
      const gardenStage = StarknetService.calculateGardenStage(streak);
      const nextGardenStage = getNextGardenStage(gardenStage);
      const percentToNextLevel = (xp % 100) / 100 * 100;
      const percentToNextGardenStage = StarknetService.calculatePercentToNextGardenStage(streak, gardenStage);
      const title = calculateTitle(level);
      
      // Get baking history from local storage (in real app would come from contracts)
      const savedHistory = localStorage.getItem(`bakexp_history_${wallet.address}`);
      let bakeHistoryData = [];
      if (savedHistory) {
        bakeHistoryData = JSON.parse(savedHistory);
      }
      
      const totalBakes = bakeHistoryData.length;
      
      // Update user stats with values from service
      const stats: UserStats = {
        xp,
        level,
        streak,
        lastBakeTimestamp: lastBake,
        totalBakes,
        gardenStage,
        milestones: milestones.map(m => m.id),
        nickname: wallet.address?.substring(0, 6) || 'Baker',
        nextGardenStage,
        percentToNextLevel,
        percentToNextGardenStage,
        title,
      };
      
      setUserStats(stats);
      setBakeHistory(bakeHistoryData);
      
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load your baking data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Log a bake - connects to Starknet service
  const logBake = async (description: string, imageUrl: string, tags: string[] = []): Promise<boolean> => {
    if (!wallet.connected || !wallet.address || !userStats) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const now = Date.now();
      const bakeId = `bake-${now}-${Math.floor(Math.random() * 1000)}`;
      const xpEarned = 25; // Standard XP for a bake
      
      // Call contract functions through service layer
      // In real Starknet integration, these would call actual contract functions
      const bakeLogged = await StarknetService.logBake(wallet.address, now);
      const xpAdded = await StarknetService.addXp(wallet.address, xpEarned);
      
      if (!bakeLogged || !xpAdded) {
        throw new Error('Failed to record bake on the Starknet contract');
      }
      
      // Create new bake entry and store in local history
      const newBake: BakeLogEntry = {
        id: bakeId,
        timestamp: now,
        description,
        imageUrl,
        xpEarned,
        tags
      };
      
      // Update history in local state and storage
      const updatedHistory = [newBake, ...bakeHistory];
      setBakeHistory(updatedHistory);
      localStorage.setItem(`bakexp_history_${wallet.address}`, JSON.stringify(updatedHistory));
      
      // Check for milestones based on new stats
      const updatedXp = userStats.xp + xpEarned;
      const { streak } = await StarknetService.getStreak(wallet.address);
      const totalBakes = userStats.totalBakes + 1;
      
      // Check and mint any new milestones
      await StarknetService.checkAndMintMilestones(
        wallet.address,
        updatedXp,
        streak,
        totalBakes
      );
      
      // Refresh user data to get updated stats
      await refreshUserData();
      
      setHasBakedToday(true);
      return true;
      
    } catch (err) {
      console.error('Error logging bake:', err);
      setError('Failed to log your bake. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Memoize context value to avoid unnecessary re-renders
  const contextValue = useMemo(() => ({
    userStats,
    bakeHistory,
    isLoading,
    error,
    refreshUserData,
    logBake,
    hasBakedToday
  }), [userStats, bakeHistory, isLoading, error, hasBakedToday]);
  
  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};

// This context is prepared for easy replacement with actual Starknet contract calls:
// 1. Replace the mock data functions with actual contract calls
// 2. Use starknet-react's useContract or similar to interact with your XP tracker contract
// 3. Keep the same interface so components don't need to change
