import { useCallback, useEffect, useState } from 'react';
import { useAccount } from '@starknet-react/core';
import { useWallet } from '@/contexts/WalletContext';
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

  // Monitor contract manager initialization status
  useEffect(() => {
    const checkInitialization = () => {
      const ready = contractManager.isReady() && isConnected && !!address;
      setIsInitialized(Boolean(ready));
    };
    
    checkInitialization();
    
    // Check every 100ms to ensure sync with wallet context
    const interval = setInterval(checkInitialization, 100);
    
    return () => clearInterval(interval);
  }, [isConnected, address]);

  // XP Tracker functions
  const getUserXPData = useCallback(async (): Promise<UserXPData | null> => {
    if (!address || !isInitialized) {
      console.log('getUserXPData: Not ready', { address: !!address, isInitialized });
      return null;
    }
    try {
      const result = await xpTrackerService.getUserXPData(address);
      console.log('getUserXPData result:', result);
      return result;
    } catch (error) {
      console.error('getUserXPData error:', error);
      return null;
    }
  }, [address, isInitialized]);

  const logBake = useCallback(async (): Promise<boolean> => {
    if (!address || !isInitialized) return false;
    const result = await xpTrackerService.logBake(address);
    return result !== null;
  }, [address, isInitialized]);

  const addXP = useCallback(async (amount: number): Promise<boolean> => {
    if (!address || !isInitialized) return false;
    const result = await xpTrackerService.addXP(address, BigInt(amount));
    return result !== null;
  }, [address, isInitialized]);

  // Milestone functions
  const getUserMilestones = useCallback(async (): Promise<UserMilestone[] | null> => {
    if (!address || !isInitialized) {
      console.log('getUserMilestones: Not ready', { address: !!address, isInitialized });
      return null;
    }
    try {
      const result = await milestoneNFTService.getUserMilestones(address);
      console.log('getUserMilestones result:', result);
      return result;
    } catch (error) {
      console.error('getUserMilestones error:', error);
      return null;
    }
  }, [address, isInitialized]);

  const checkAndMintMilestones = useCallback(async (): Promise<boolean> => {
    if (!address || !isInitialized) return false;
    const result = await milestoneNFTService.checkAndMintEligibleMilestones(address);
    return result !== null;
  }, [address, isInitialized]);

  // Pod functions
  const getUserPods = useCallback(async (): Promise<number[] | null> => {
    if (!address || !isInitialized) {
      console.log('getUserPods: Not ready', { address: !!address, isInitialized });
      return null;
    }
    try {
      const result = await bakePodsService.getUserPods(address);
      console.log('getUserPods result:', result);
      return result;
    } catch (error) {
      console.error('getUserPods error:', error);
      return null;
    }
  }, [address, isInitialized]);

  const createPod = useCallback(async (name: string, description: string, targetStreak: number, maxMembers: number): Promise<boolean> => {
    if (!address || !isInitialized) return false;
    const result = await bakePodsService.createPod(name, description, targetStreak, maxMembers);
    return result !== null;
  }, [address, isInitialized]);

  const joinPod = useCallback(async (podId: number): Promise<boolean> => {
    if (!address || !isInitialized) return false;
    const result = await bakePodsService.joinPod(podId);
    return result !== null;
  }, [address, isInitialized]);

  const logPodBake = useCallback(async (podId: number): Promise<boolean> => {
    if (!address || !isInitialized) return false;
    const result = await bakePodsService.logPodBake(podId);
    return result !== null;
  }, [address, isInitialized]);

  // Combined operations
  const logBakeWithRewards = useCallback(async (podId?: number): Promise<boolean> => {
    if (!address || !isInitialized) return false;
    const result = await contractManager.logBakeWithRewards(address, podId);
    return result !== null;
  }, [address, isInitialized]);

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

// Custom hook for loading user data consistently across pages
export const useUserData = () => {
  const { wallet } = useWallet();
  const { isConnected, address, getUserXPData, getUserMilestones, services, isInitialized } = useContracts();
  
  const [data, setData] = useState<{
    userStats: UserXPData | null;
    milestones: UserMilestone[];
    userPods: any[];
    isLoading: boolean;
    error: string | null;
  }>({
    userStats: null,
    milestones: [],
    userPods: [],
    isLoading: true,
    error: null
  });

  const loadData = useCallback(async () => {
    if (!isConnected || !address || !isInitialized) {
      console.log('useUserData: Not ready', { isConnected, hasAddress: !!address, isInitialized });
      if (!wallet.connected) {
        setData(prev => ({ ...prev, isLoading: false }));
      }
      return;
    }

    console.log('useUserData: Loading data - contracts ready');
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Add a small delay to ensure contracts are fully ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Load all data in parallel
      const [userStats, milestones, podIds] = await Promise.all([
        getUserXPData(),
        getUserMilestones(),
        services.bakePods.getUserPods(address)
      ]);

      // Load full pod data if user has pods
      let userPods: any[] = [];
      if (podIds && podIds.length > 0) {
        const podPromises = podIds.map(async (podId) => {
          const [pod, stats] = await Promise.all([
            services.bakePods.getPod(podId),
            services.bakePods.getPodStats(podId)
          ]);
          return pod ? { ...pod, stats } : null;
        });
        const pods = await Promise.all(podPromises);
        userPods = pods.filter(pod => pod !== null);
      }

      setData({
        userStats,
        milestones: milestones || [],
        userPods,
        isLoading: false,
        error: null
      });

      console.log('useUserData: Data loaded successfully');
    } catch (error) {
      console.error('useUserData: Failed to load data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load user data'
      }));
    }
  }, [isConnected, address, isInitialized, wallet.connected, getUserXPData, getUserMilestones, services]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    ...data,
    isInitialized,
    refresh: loadData
  };
}; 