"use client";

/**
 * StarknetService - Mock implementation that mirrors the structure of the Cairo contracts
 * 
 * When ready to integrate with real Starknet contracts:
 * 1. Install starknet-react, get-starknet, starknet.js
 * 2. Replace these mock methods with actual contract calls
 * 3. Keep the same method signatures so the rest of the app doesn't need to change
 */

import { GardenStage } from '@/contexts/UserDataContext';

// Types matching Cairo contract interfaces
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

// Mock storage for XP tracker (will be replaced by contract reads)
const userXpStore: Record<string, { xp: number, streak: number, lastBake: number | null }> = {};

/**
 * Add XP for a user (mirrors add_xp function in xp_tracker.cairo)
 */
export const addXp = async (userAddr: string, amount: number): Promise<boolean> => {
  try {
    // Mock contract interaction
    await mockContractDelay();
    
    if (!userXpStore[userAddr]) {
      userXpStore[userAddr] = { xp: 0, streak: 0, lastBake: null };
    }
    
    userXpStore[userAddr].xp += amount;
    return true;
  } catch (error) {
    console.error('Error adding XP:', error);
    return false;
  }
};

/**
 * Get user's XP (mirrors get_xp function in xp_tracker.cairo)
 */
export const getXp = async (userAddr: string): Promise<number> => {
  try {
    await mockContractDelay();
    return userXpStore[userAddr]?.xp || 0;
  } catch (error) {
    console.error('Error getting XP:', error);
    return 0;
  }
};

/**
 * Log a bake for a user (mirrors log_bake function in xp_tracker.cairo)
 */
export const logBake = async (userAddr: string, timestamp: number): Promise<boolean> => {
  try {
    await mockContractDelay();
    
    if (!userXpStore[userAddr]) {
      userXpStore[userAddr] = { xp: 0, streak: 0, lastBake: null };
    }
    
    const today = new Date(timestamp);
    today.setHours(0, 0, 0, 0);
    
    // Calculate streak
    if (userXpStore[userAddr].lastBake) {
      const lastBakeDate = new Date(userXpStore[userAddr].lastBake);
      lastBakeDate.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastBakeDate.getTime() === yesterday.getTime()) {
        // Baked yesterday, increment streak
        userXpStore[userAddr].streak += 1;
      } else if (lastBakeDate.getTime() < yesterday.getTime()) {
        // Missed a day, reset streak
        userXpStore[userAddr].streak = 1;
      }
      // If already baked today, streak stays the same
    } else {
      // First bake
      userXpStore[userAddr].streak = 1;
    }
    
    userXpStore[userAddr].lastBake = timestamp;
    
    // This method only updates streak, not XP
    // XP is handled by separate addXp call
    
    return true;
  } catch (error) {
    console.error('Error logging bake:', error);
    return false;
  }
};

/**
 * Get user's streak (mirrors get_streak function in xp_tracker.cairo)
 */
export const getStreak = async (userAddr: string): Promise<{streak: number, lastBake: number | null}> => {
  try {
    await mockContractDelay();
    
    if (!userXpStore[userAddr]) {
      return { streak: 0, lastBake: null };
    }
    
    return {
      streak: userXpStore[userAddr].streak,
      lastBake: userXpStore[userAddr].lastBake
    };
  } catch (error) {
    console.error('Error getting streak:', error);
    return { streak: 0, lastBake: null };
  }
};

// -----------------------
// MILESTONE NFT CONTRACT
// -----------------------

// Mock storage for milestones
const userMilestonesStore: Record<string, UserMilestone[]> = {};
const MILESTONE_DEFINITIONS: Record<string, Omit<UserMilestone, 'timestamp'>> = {
  'first-bake': {
    id: 'first-bake',
    name: 'First Bake',
    description: 'Completed your first bake on BakeXP',
    imageUrl: '🍰'
  },
  'streak-3': {
    id: 'streak-3',
    name: 'Three-Day Streak',
    description: 'Maintained a 3-day baking streak',
    imageUrl: '🔥'
  },
  'streak-7': {
    id: 'streak-7',
    name: 'Week-Long Baker',
    description: 'Baked consistently for a full week',
    imageUrl: '📅'
  },
  'streak-30': {
    id: 'streak-30',
    name: 'Master Baker',
    description: 'Maintained a month-long baking streak',
    imageUrl: '👨‍🍳'
  },
  'xp-100': {
    id: 'xp-100',
    name: 'XP Beginner',
    description: 'Earned 100 XP on BakeXP',
    imageUrl: '⭐'
  },
  'xp-500': {
    id: 'xp-500',
    name: 'XP Enthusiast',
    description: 'Earned 500 XP on BakeXP',
    imageUrl: '🌟'
  }
};

/**
 * Mint a milestone NFT for a user (mirrors mint_milestone function in milestone_nft.cairo)
 */
export const mintMilestone = async (userAddr: string, milestoneId: string): Promise<boolean> => {
  try {
    await mockContractDelay();
    
    if (!MILESTONE_DEFINITIONS[milestoneId]) {
      return false;
    }
    
    if (!userMilestonesStore[userAddr]) {
      userMilestonesStore[userAddr] = [];
    }
    
    // Check if user already has this milestone
    const existingMilestone = userMilestonesStore[userAddr].find(m => m.id === milestoneId);
    if (existingMilestone) {
      return true; // Already minted
    }
    
    // Create new milestone with timestamp
    const newMilestone: UserMilestone = {
      ...MILESTONE_DEFINITIONS[milestoneId],
      timestamp: Date.now()
    };
    
    userMilestonesStore[userAddr].push(newMilestone);
    return true;
  } catch (error) {
    console.error('Error minting milestone:', error);
    return false;
  }
};

/**
 * Get user's milestones (mirrors get_user_milestones function in milestone_nft.cairo)
 */
export const getUserMilestones = async (userAddr: string): Promise<UserMilestone[]> => {
  try {
    await mockContractDelay();
    return userMilestonesStore[userAddr] || [];
  } catch (error) {
    console.error('Error getting milestones:', error);
    return [];
  }
};

/**
 * Check if a milestone should be minted based on user stats
 */
export const checkAndMintMilestones = async (
  userAddr: string, 
  xp: number, 
  streak: number,
  totalBakes: number
): Promise<string[]> => {
  try {
    const mintedMilestones: string[] = [];
    
    // First bake milestone
    if (totalBakes === 1) {
      const success = await mintMilestone(userAddr, 'first-bake');
      if (success) mintedMilestones.push('first-bake');
    }
    
    // Streak milestones
    if (streak >= 3) {
      const success = await mintMilestone(userAddr, 'streak-3');
      if (success) mintedMilestones.push('streak-3');
    }
    
    if (streak >= 7) {
      const success = await mintMilestone(userAddr, 'streak-7');
      if (success) mintedMilestones.push('streak-7');
    }
    
    if (streak >= 30) {
      const success = await mintMilestone(userAddr, 'streak-30');
      if (success) mintedMilestones.push('streak-30');
    }
    
    // XP milestones
    if (xp >= 100) {
      const success = await mintMilestone(userAddr, 'xp-100');
      if (success) mintedMilestones.push('xp-100');
    }
    
    if (xp >= 500) {
      const success = await mintMilestone(userAddr, 'xp-500');
      if (success) mintedMilestones.push('xp-500');
    }
    
    return mintedMilestones;
  } catch (error) {
    console.error('Error checking milestones:', error);
    return [];
  }
};

// -----------------------
// BAKEPODS CONTRACT
// -----------------------

// Mock storage for BakePods
const bakePodsStore: Record<string, BakePod> = {};
const userPodMemberships: Record<string, string[]> = {};
const podInvites: Record<string, string[]> = {};

/**
 * Create a new bake pod (mirrors create_pod function in bakepods.cairo)
 */
export const createPod = async (podName: string, creatorAddr: string, memberAddrs: string[] = []): Promise<string | null> => {
  try {
    await mockContractDelay();
    
    // Generate a pod ID
    const podId = `pod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create the pod with the creator and members
    const allMembers = [creatorAddr, ...memberAddrs.filter(addr => addr !== creatorAddr)];
    
    bakePodsStore[podId] = {
      id: podId,
      name: podName,
      members: allMembers,
      totalBakes: 0,
      activeMilestone: null,
      createdAt: Date.now()
    };
    
    // Update user memberships
    allMembers.forEach(addr => {
      if (!userPodMemberships[addr]) {
        userPodMemberships[addr] = [];
      }
      userPodMemberships[addr].push(podId);
    });
    
    return podId;
  } catch (error) {
    console.error('Error creating pod:', error);
    return null;
  }
};

/**
 * Log a bake for a pod member (mirrors log_pod_bake function in bakepods.cairo)
 */
export const logPodBake = async (podId: string, userAddr: string): Promise<boolean> => {
  try {
    await mockContractDelay();
    
    const pod = bakePodsStore[podId];
    if (!pod) return false;
    
    // Check if user is a member of this pod
    if (!pod.members.includes(userAddr)) return false;
    
    // Increment total bakes count for pod
    pod.totalBakes += 1;
    
    // In a real implementation, you'd also check for pod milestones here
    await checkPodMilestone(podId);
    
    return true;
  } catch (error) {
    console.error('Error logging pod bake:', error);
    return false;
  }
};

/**
 * Check for pod milestones (mirrors check_pod_milestone function in bakepods.cairo)
 */
export const checkPodMilestone = async (podId: string): Promise<string | null> => {
  try {
    await mockContractDelay();
    
    const pod = bakePodsStore[podId];
    if (!pod) return null;
    
    // Simple milestone check based on total bakes
    if (pod.totalBakes >= 50 && pod.activeMilestone !== 'pod-50-bakes') {
      pod.activeMilestone = 'pod-50-bakes';
      return 'pod-50-bakes';
    }
    
    if (pod.totalBakes >= 20 && pod.activeMilestone !== 'pod-20-bakes') {
      pod.activeMilestone = 'pod-20-bakes';
      return 'pod-20-bakes';
    }
    
    if (pod.totalBakes >= 10 && pod.activeMilestone !== 'pod-10-bakes') {
      pod.activeMilestone = 'pod-10-bakes';
      return 'pod-10-bakes';
    }
    
    return null;
  } catch (error) {
    console.error('Error checking pod milestone:', error);
    return null;
  }
};

/**
 * Get all pods for a user
 */
export const getUserPods = async (userAddr: string): Promise<BakePod[]> => {
  try {
    await mockContractDelay();
    
    const podIds = userPodMemberships[userAddr] || [];
    return podIds.map(id => bakePodsStore[id]).filter(Boolean);
  } catch (error) {
    console.error('Error getting user pods:', error);
    return [];
  }
};

/**
 * Get pod invites for a user
 */
export const getUserPodInvites = async (userAddr: string): Promise<{ podId: string; podName: string }[]> => {
  try {
    await mockContractDelay();
    
    const invitePodIds = podInvites[userAddr] || [];
    return invitePodIds
      .map(id => {
        const pod = bakePodsStore[id];
        return pod ? { podId: id, podName: pod.name } : null;
      })
      .filter(Boolean) as { podId: string; podName: string }[];
  } catch (error) {
    console.error('Error getting pod invites:', error);
    return [];
  }
};

/**
 * Invite a user to a pod
 */
export const inviteUserToPod = async (podId: string, userAddr: string): Promise<boolean> => {
  try {
    await mockContractDelay();
    
    const pod = bakePodsStore[podId];
    if (!pod) return false;
    
    if (pod.members.includes(userAddr)) return false; // Already a member
    
    if (!podInvites[userAddr]) {
      podInvites[userAddr] = [];
    }
    
    if (!podInvites[userAddr].includes(podId)) {
      podInvites[userAddr].push(podId);
    }
    
    return true;
  } catch (error) {
    console.error('Error inviting user to pod:', error);
    return false;
  }
};

/**
 * Accept a pod invitation
 */
export const acceptPodInvite = async (podId: string, userAddr: string): Promise<boolean> => {
  try {
    await mockContractDelay();
    
    const pod = bakePodsStore[podId];
    if (!pod) return false;
    
    // Check if user is invited
    if (!podInvites[userAddr] || !podInvites[userAddr].includes(podId)) {
      return false;
    }
    
    // Add user to pod members
    pod.members.push(userAddr);
    
    // Add pod to user memberships
    if (!userPodMemberships[userAddr]) {
      userPodMemberships[userAddr] = [];
    }
    userPodMemberships[userAddr].push(podId);
    
    // Remove invitation
    podInvites[userAddr] = podInvites[userAddr].filter(id => id !== podId);
    
    return true;
  } catch (error) {
    console.error('Error accepting pod invite:', error);
    return false;
  }
};

// -----------------------
// UTILITY FUNCTIONS
// -----------------------

/**
 * Helper function to simulate contract call delay
 */
const mockContractDelay = async (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
};

/**
 * Calculate garden stage based on streak (will be handled by contract in real implementation)
 */
export const calculateGardenStage = (streak: number): GardenStage => {
  if (streak < 1) return 'Seed';
  if (streak < 3) return 'Seedling';
  if (streak < 7) return 'Sprout';
  if (streak < 14) return 'Plant';
  if (streak < 30) return 'Tree';
  return 'Garden';
};

/**
 * Calculate level based on XP (will be handled by contract in real implementation)
 */
export const calculateLevel = (xp: number): number => {
  return 1 + Math.floor(xp / 100);
};

/**
 * Calculate percent to next garden stage
 */
export const calculatePercentToNextGardenStage = (streak: number, currentStage: GardenStage): number => {
  switch (currentStage) {
    case 'Seed': return Math.min(streak / 1 * 100, 100);
    case 'Seedling': return Math.min((streak - 1) / 2 * 100, 100);
    case 'Sprout': return Math.min((streak - 3) / 4 * 100, 100);
    case 'Plant': return Math.min((streak - 7) / 7 * 100, 100);
    case 'Tree': return Math.min((streak - 14) / 16 * 100, 100);
    case 'Garden': return 100;
    default: return 0;
  }
};
