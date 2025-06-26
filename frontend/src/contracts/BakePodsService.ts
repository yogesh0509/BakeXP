import { Contract, Account, CallData } from 'starknet';
import { CONTRACT_ADDRESSES } from './constants';
import { Pod, PodStats, TransactionResult, ContractCallOptions, ContractReadOptions } from './types';
import BakePodsABI from './abis/BakePods.json';

export class BakePodsService {
  private contract: Contract | null = null;
  private account: Account | null = null;

  constructor() {
    this.initializeContract();
  }

  private initializeContract() {
    try {
      // Initialize read-only contract with real ABI
      this.contract = new Contract(BakePodsABI, CONTRACT_ADDRESSES.BAKE_PODS);
    } catch (error) {
      console.error('Failed to initialize BakePods contract:', error);
    }
  }

  public setAccount(account: Account | null) {
    this.account = account;
    if (this.contract && account) {
      this.contract.connect(account);
    }
  }

  // Write functions
  async createPod(
    name: string, 
    description: string,
    targetStreak: number, 
    maxMembers: number, 
    options?: ContractCallOptions
  ): Promise<TransactionResult | null> {
    if (!this.contract || !this.account) return null;

    try {
      const result = await this.contract.create_pod(name, targetStreak, maxMembers, {
        maxFee: options?.maxFee
      });

      return {
        transactionHash: result.transaction_hash,
        status: 'pending'
      };
    } catch (error) {
      console.error('Failed to create pod:', error);
      return null;
    }
  }

  async joinPod(podId: number, options?: ContractCallOptions): Promise<TransactionResult | null> {
    if (!this.contract || !this.account) return null;

    try {
      const result = await this.contract.join_pod(podId, {
        maxFee: options?.maxFee
      });

      return {
        transactionHash: result.transaction_hash,
        status: 'pending'
      };
    } catch (error) {
      console.error('Failed to join pod:', error);
      return null;
    }
  }

  async leavePod(podId: number, options?: ContractCallOptions): Promise<TransactionResult | null> {
    if (!this.contract || !this.account) return null;

    try {
      const result = await this.contract.leave_pod(podId, {
        maxFee: options?.maxFee
      });

      return {
        transactionHash: result.transaction_hash,
        status: 'pending'
      };
    } catch (error) {
      console.error('Failed to leave pod:', error);
      return null;
    }
  }

  async logPodBake(podId: number, options?: ContractCallOptions): Promise<TransactionResult | null> {
    if (!this.contract || !this.account) return null;

    try {
      const result = await this.contract.log_pod_bake(podId, {
        maxFee: options?.maxFee
      });

      return {
        transactionHash: result.transaction_hash,
        status: 'pending'
      };
    } catch (error) {
      console.error('Failed to log pod bake:', error);
      return null;
    }
  }

  // Read functions
  async getPod(podId: number, options?: ContractReadOptions): Promise<Pod | null> {
    if (!this.contract) return null;

    try {
      const result = await this.contract.get_pod(podId);
      
      return {
        id: Number(result.id),
        name: result.name,
        description: result.description,
        creator: result.creator,
        memberLimit: Number(result.member_limit),
        createdAt: Number(result.created_at),
        isActive: result.is_active,
        currentStreak: Number(result.current_streak),
        targetStreak: Number(result.target_streak)
      };
    } catch (error) {
      console.error('Failed to get pod:', error);
      return null;
    }
  }

  async getPodMembers(podId: number): Promise<string[] | null> {
    if (!this.contract) return null;

    try {
      const result = await this.contract.get_pod_members(podId);
      return result.map((addr: any) => addr.toString());
    } catch (error) {
      console.error('Failed to get pod members:', error);
      return null;
    }
  }

  async getUserPods(userAddress: string): Promise<number[] | null> {
    if (!this.contract) {
      console.warn('BakePodsService: Contract not initialized');
      return null;
    }

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`BakePodsService: Attempting to get user pods (attempt ${attempt}/${maxRetries})`);
        
        const result = await this.contract.get_user_pods(userAddress);
        const podIds = result.map((id: any) => Number(id));
        
        console.log('BakePodsService: Successfully retrieved user pods:', podIds);
        return podIds;
      } catch (error) {
        lastError = error as Error;
        console.error(`BakePodsService: Attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    console.error('BakePodsService: All attempts failed:', lastError);
    return null;
  }

  async getPodStats(podId: number): Promise<PodStats | null> {
    if (!this.contract) return null;

    try {
      const result = await this.contract.get_pod_stats(podId);
      
      return {
        podId: Number(result.pod_id),
        totalBakes: Number(result.total_bakes),
        memberCount: Number(result.member_count),
        dailyBakesToday: Number(result.daily_bakes_today),
        currentStreak: Number(result.current_streak),
        targetStreak: Number(result.target_streak),
        isActive: result.is_active
      };
    } catch (error) {
      console.error('Failed to get pod stats:', error);
      return null;
    }
  }

  async hasUserBakedTodayInPod(podId: number, userAddress: string): Promise<boolean | null> {
    if (!this.contract) return null;

    try {
      const result = await this.contract.has_user_baked_today_in_pod(podId, userAddress);
      return Boolean(result);
    } catch (error) {
      console.error('Failed to check if user baked today in pod:', error);
      return null;
    }
  }

  async checkPodMilestone(podId: number): Promise<string[] | null> {
    if (!this.contract) return null;

    try {
      const result = await this.contract.check_pod_milestone(podId);
      return result;
    } catch (error) {
      console.error('Failed to check pod milestone:', error);
      return null;
    }
  }
}

export const bakePodsService = new BakePodsService(); 