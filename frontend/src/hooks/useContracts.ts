import { useCallback, useEffect, useState } from 'react';
import { useAccount } from '@starknet-react/core';
import { 
  contractManager, 
  xpTrackerService, 
  bakePodsService, 
  milestoneNFTService,
  type UserXPData,
  type Pod,
  type UserMilestone
} from '@/contracts';

export const useContracts = () => {
  const { account, address, isConnected } = useAccount();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize contract manager with account
  useEffect(() => {
    if (isConnected && account) {
      contractManager.setAccount(account as any);
      setIsInitialized(true);
    } else {
      contractManager.setAccount(null);
      setIsInitialized(false);
    }
  }, [account, isConnected]);

  // XP Tracker functions
  const getUserXPData = useCallback(async (): Promise<UserXPData | null> => {
    if (!address) return null;
    return await xpTrackerService.getUserXPData(address);
  }, [address]);

  const logBake = useCallback(async (): Promise<boolean> => {
    if (!address) return false;
    const result = await xpTrackerService.logBake(address);
    return result !== null;
  }, [address]);

  const addXP = useCallback(async (amount: number): Promise<boolean> => {
    if (!address) return false;
    const result = await xpTrackerService.addXP(address, BigInt(amount));
    return result !== null;
  }, [address]);

  // Milestone functions
  const getUserMilestones = useCallback(async (): Promise<UserMilestone[] | null> => {
    if (!address) return null;
    return await milestoneNFTService.getUserMilestones(address);
  }, [address]);

  const checkAndMintMilestones = useCallback(async (): Promise<boolean> => {
    if (!address) return false;
    const result = await milestoneNFTService.checkAndMintEligibleMilestones(address);
    return result !== null;
  }, [address]);

  // Pod functions
  const getUserPods = useCallback(async (): Promise<number[] | null> => {
    if (!address) return null;
    return await bakePodsService.getUserPods(address);
  }, [address]);

  const createPod = useCallback(async (name: string, description: string, targetStreak: number, maxMembers: number): Promise<boolean> => {
    if (!address) return false;
    const result = await bakePodsService.createPod(name, description, targetStreak, maxMembers);
    return result !== null;
  }, [address]);

  const joinPod = useCallback(async (podId: number): Promise<boolean> => {
    if (!address) return false;
    const result = await bakePodsService.joinPod(podId);
    return result !== null;
  }, [address]);

  const logPodBake = useCallback(async (podId: number): Promise<boolean> => {
    if (!address) return false;
    const result = await bakePodsService.logPodBake(podId);
    return result !== null;
  }, [address]);

  // Combined operations
  const logBakeWithRewards = useCallback(async (podId?: number): Promise<boolean> => {
    if (!address) return false;
    const result = await contractManager.logBakeWithRewards(address, podId);
    return result !== null;
  }, [address]);

  return {
    // Status
    isInitialized,
    isConnected,
    address,

    // XP Tracker
    getUserXPData,
    logBake,
    addXP,

    // Milestones
    getUserMilestones,
    checkAndMintMilestones,

    // Pods
    getUserPods,
    createPod,
    joinPod,
    logPodBake,

    // Combined operations
    logBakeWithRewards,

    // Direct service access
    services: {
      xpTracker: xpTrackerService,
      milestoneNFT: milestoneNFTService,
      bakePods: bakePodsService,
      manager: contractManager
    }
  };
}; 