"use client";

/**
 * StarknetService - Now integrates with real Starknet contracts
 * Maintains backwards compatibility with mock implementations
 */

import { GardenStage } from '@/contexts/UserDataContext';
import { contractManager, xpTrackerService, bakePodsService, milestoneNFTService } from '@/contracts';
import type { UserXPData, Pod as ContractPod, UserMilestone as ContractMilestone } from '@/contracts';

// Legacy types for backwards compatibility
export type UserMilestone = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  timestamp: number;
};

export type BakePod = {
  id: string;
  name: string;
  members: string[];
  totalBakes: number;
  activeMilestone: string | null;
  createdAt: number;
};

// -----------------------
// XP TRACKER CONTRACT
// -----------------------

/**
 * Add XP for a user - now uses real contract
 */
export const addXp = async (userAddr: string, amount: number): Promise<boolean> => {
  try {
    const result = await xpTrackerService.addXP(userAddr, BigInt(amount));
    return result !== null;
  } catch (error) {
    console.error('Error adding XP:', error);
    return false;
  }
};

/**
 * Get user's XP - now uses real contract
 */
export const getXp = async (userAddr: string): Promise<number> => {
  try {
    const xp = await xpTrackerService.getUserXP(userAddr);
    return xp ? Number(xp) : 0;
  } catch (error) {
    console.error('Error getting XP:', error);
    return 0;
  }
};

/**
 * Log a bake for a user - now uses real contract
 */
export const logBake = async (userAddr: string, timestamp: number): Promise<boolean> => {
  try {
    const result = await xpTrackerService.logBake(userAddr);
    return result !== null;
  } catch (error) {
    console.error('Error logging bake:', error);
    return false;
  }
};

/**
 * Get user's streak - now uses real contract
 */
export const getStreak = async (userAddr: string): Promise<{streak: number, lastBake: number | null}> => {
  try {
    const userData = await xpTrackerService.getUserXPData(userAddr);
    if (userData) {
      return {
        streak: userData.streak,
        lastBake: userData.lastBakeTimestamp || null
      };
    }
    return { streak: 0, lastBake: null };
  } catch (error) {
    console.error('Error getting streak:', error);
    return { streak: 0, lastBake: null };
  }
};

// -----------------------
// MILESTONE NFT CONTRACT
// -----------------------

/**
 * Mint a milestone NFT for a user - now uses real contract
 */
export const mintMilestone = async (userAddr: string, milestoneId: string): Promise<boolean> => {
  try {
    // Parse milestone ID number directly (assuming it's already a number string)
    const milestoneIdNumber = parseInt(milestoneId, 10);
    if (isNaN(milestoneIdNumber)) return false;
    
    const result = await milestoneNFTService.mintMilestone(userAddr, milestoneIdNumber);
    return result !== null;
  } catch (error) {
    console.error('Error minting milestone:', error);
    return false;
  }
};

/**
 * Get user's milestones - now uses real contract
 */
export const getUserMilestones = async (userAddr: string): Promise<UserMilestone[]> => {
  try {
    const milestones = await milestoneNFTService.getUserMilestones(userAddr);
    if (!milestones) return [];
    
    // Convert contract milestones to legacy format for UI compatibility
    return milestones.map(m => ({
      id: m.id.toString(),
      name: m.name,
      description: m.description,
      imageUrl: '🏆', // Default emoji icon - could be enhanced with metadata
      timestamp: m.mintedAt
    }));
  } catch (error) {
    console.error('Error getting user milestones:', error);
    return [];
  }
};

/**
 * Check and mint eligible milestones - now uses real contract
 */
export const checkAndMintMilestones = async (
  userAddr: string, 
  xp: number, 
  streak: number,
  totalBakes: number
): Promise<string[]> => {
  try {
    const result = await milestoneNFTService.checkAndMintEligibleMilestones(userAddr);
    if (result) {
      // Get updated milestones to see what was newly minted
      const currentMilestones = await milestoneNFTService.getUserMilestones(userAddr);
      return currentMilestones ? currentMilestones.map(m => m.id.toString()) : [];
    }
    return [];
  } catch (error) {
    console.error('Error checking milestones:', error);
    return [];
  }
};

/**
 * Check if user has a specific milestone
 */
const hasMilestone = async (userAddr: string, milestoneId: string): Promise<boolean> => {
  try {
    const milestoneIdNumber = parseInt(milestoneId, 10);
    if (isNaN(milestoneIdNumber)) return false;
    
    const result = await milestoneNFTService.hasMilestone(userAddr, milestoneIdNumber);
    return result || false;
  } catch (error) {
    console.error('Error checking milestone:', error);
    return false;
  }
};

// -----------------------
// BAKE PODS CONTRACT
// -----------------------

/**
 * Create a new baking pod - now uses real contract
 */
export const createPod = async (podName: string, creatorAddr: string, memberAddrs: string[] = []): Promise<string | null> => {
  try {
    const description = `Baking pod created by ${creatorAddr}`;
    const result = await bakePodsService.createPod(podName, description, 7, 50); // Default: 7-day streak, 50 members
    if (result) {
      return result.transactionHash; // Return transaction hash as pod ID for now
    }
    return null;
  } catch (error) {
    console.error('Error creating pod:', error);
    return null;
  }
};

/**
 * Log a bake for a specific pod - now uses real contract
 */
export const logPodBake = async (podId: string, userAddr: string): Promise<boolean> => {
  try {
    const podIdNumber = parseInt(podId, 10);
    if (isNaN(podIdNumber)) return false;
    
    const result = await bakePodsService.logPodBake(podIdNumber);
    return result !== null;
  } catch (error) {
    console.error('Error logging pod bake:', error);
    return false;
  }
};

/**
 * Check if a pod has reached a milestone
 */
export const checkPodMilestone = async (podId: string): Promise<string | null> => {
  try {
    const podIdNumber = parseInt(podId, 10);
    if (isNaN(podIdNumber)) return null;
    
    const podStats = await bakePodsService.getPodStats(podIdNumber);
    if (podStats) {
      // Check various pod milestones
      if (podStats.currentStreak >= podStats.targetStreak) {
        return 'target-streak-reached';
      }
      if (podStats.totalBakes >= 100) {
        return 'hundred-bakes';
      }
      if (podStats.memberCount >= 10) {
        return 'ten-members';
      }
    }
    return null;
  } catch (error) {
    console.error('Error checking pod milestone:', error);
    return null;
  }
};

/**
 * Get pods for a user - now uses real contract
 */
export const getUserPods = async (userAddr: string): Promise<BakePod[]> => {
  try {
    const podIds = await bakePodsService.getUserPods(userAddr);
    if (!podIds) return [];
    
    const pods: BakePod[] = [];
    for (const podId of podIds) {
      const pod = await bakePodsService.getPod(podId);
      const members = await bakePodsService.getPodMembers(podId);
      const stats = await bakePodsService.getPodStats(podId);
      
      if (pod && members && stats) {
        pods.push({
          id: podId.toString(),
          name: pod.name,
          members: members,
          totalBakes: stats.totalBakes,
          activeMilestone: null, // TODO: Implement milestone checking
          createdAt: pod.createdAt
        });
      }
    }
    
    return pods;
  } catch (error) {
    console.error('Error getting user pods:', error);
    return [];
  }
};

// Keep remaining mock implementations for pod invites (not implemented in contracts yet)
const podInvitesStore: Record<string, { podId: string; podName: string }[]> = {};

export const getUserPodInvites = async (userAddr: string): Promise<{ podId: string; podName: string }[]> => {
  try {
    await mockContractDelay();
    return podInvitesStore[userAddr] || [];
  } catch (error) {
    console.error('Error getting pod invites:', error);
    return [];
  }
};

export const inviteUserToPod = async (podId: string, userAddr: string): Promise<boolean> => {
  try {
    await mockContractDelay();
    
    if (!podInvitesStore[userAddr]) {
      podInvitesStore[userAddr] = [];
    }
    
    // Check if invite already exists
    const existingInvite = podInvitesStore[userAddr].find(invite => invite.podId === podId);
    if (existingInvite) {
      return false; // Already invited
    }
    
    podInvitesStore[userAddr].push({
      podId,
      podName: `Pod ${podId}` // In real implementation, fetch from contract
    });
    
    return true;
  } catch (error) {
    console.error('Error inviting user to pod:', error);
    return false;
  }
};

export const acceptPodInvite = async (podId: string, userAddr: string): Promise<boolean> => {
  try {
    const podIdNumber = parseInt(podId, 10);
    if (isNaN(podIdNumber)) return false;
    
    // Join the pod using contract
    const result = await bakePodsService.joinPod(podIdNumber);
    
    if (result) {
      // Remove from invites
      if (podInvitesStore[userAddr]) {
        podInvitesStore[userAddr] = podInvitesStore[userAddr].filter(invite => invite.podId !== podId);
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error accepting pod invite:', error);
    return false;
  }
};

// -----------------------
// UTILITY FUNCTIONS
// -----------------------

const mockContractDelay = async (): Promise<void> => {
  // Simulate network delay for mock operations
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
};

export const calculateGardenStage = (streak: number): GardenStage => {
  if (streak === 0) return 'Seed';
  if (streak >= 1 && streak <= 2) return 'Seedling';
  if (streak >= 3 && streak <= 6) return 'Sprout';
  if (streak >= 7 && streak <= 13) return 'Plant';
  if (streak >= 14 && streak <= 29) return 'Tree';
  return 'Garden';
};

export const calculateLevel = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100));
};

export const calculatePercentToNextGardenStage = (streak: number, currentStage: GardenStage): number => {
  const stageLimits = { 'Seed': 1, 'Seedling': 3, 'Sprout': 7, 'Plant': 14, 'Tree': 30, 'Garden': Infinity };
  const nextStageLimit = stageLimits[currentStage];
  
  if (nextStageLimit === Infinity) return 100;
  
  const previousStageLimit = currentStage === 'Seed' ? 0 : 
    currentStage === 'Seedling' ? 1 :
    currentStage === 'Sprout' ? 3 :
    currentStage === 'Plant' ? 7 :
    currentStage === 'Tree' ? 14 : 30;
  
  const progress = (streak - previousStageLimit) / (nextStageLimit - previousStageLimit);
  return Math.min(100, Math.max(0, progress * 100));
};

export class StarknetService {
  private static instance: StarknetService;
  private mockMode: boolean = false; // Now defaults to real contracts

  private constructor() {}

  public static getInstance(): StarknetService {
    if (!StarknetService.instance) {
      StarknetService.instance = new StarknetService();
    }
    return StarknetService.instance;
  }

  public setMockMode(enabled: boolean) {
    this.mockMode = enabled;
  }

  public isMockMode(): boolean {
    return this.mockMode;
  }

  // Integration with contract manager
  public setAccount(account: any) {
    contractManager.setAccount(account);
  }

  // Combined bake logging with rewards
  public async logBakeWithRewards(userAddr: string, podId?: string): Promise<boolean> {
    try {
      const podIdNumber = podId ? parseInt(podId, 10) : undefined;
      const result = await contractManager.logBakeWithRewards(userAddr, podIdNumber);
      return result !== null;
    } catch (error) {
      console.error('Error logging bake with rewards:', error);
      return false;
    }
  }

  public async getBalance(address: string): Promise<string> {
    // TODO: Implement real balance checking
    return "0.0";
  }
}
