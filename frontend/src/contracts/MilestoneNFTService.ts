import { Contract, Account, CallData } from 'starknet';
import { CONTRACT_ADDRESSES } from './constants';
import { Milestone, UserMilestone, TransactionResult, ContractCallOptions, ContractReadOptions } from './types';
import MilestoneNFTABI from './abis/MilestoneNFT.json';

export class MilestoneNFTService {
  private contract: Contract | null = null;
  private account: Account | null = null;

  constructor() {
    this.initializeContract();
  }

  private initializeContract() {
    try {
      // Initialize read-only contract with real ABI
      this.contract = new Contract(MilestoneNFTABI, CONTRACT_ADDRESSES.MILESTONE_NFT);
    } catch (error) {
      console.error('Failed to initialize MilestoneNFT contract:', error);
    }
  }

  public setAccount(account: Account | null) {
    this.account = account;
    if (this.contract && account) {
      this.contract.connect(account);
    }
  }

  // Read functions
  async getUserMilestones(userAddress: string, options?: ContractReadOptions): Promise<UserMilestone[] | null> {
    if (!this.contract) {
      console.warn('MilestoneNFTService: Contract not initialized');
      return null;
    }

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`MilestoneNFTService: Attempting to get user milestones (attempt ${attempt}/${maxRetries})`);
        
        const milestoneIds = await this.contract.get_user_milestones(userAddress);
        
        const milestones: UserMilestone[] = [];
        for (const id of milestoneIds) {
          const milestoneId = Number(id);
          const milestone = MilestoneNFTService.getMilestoneDefinition(milestoneId);
          if (milestone) {
            milestones.push({
              id: milestoneId,
              name: milestone.name,
              description: milestone.description,
              requirement: milestone.requirement,
              rewardXP: milestone.rewardXP,
              mintedAt: Date.now(), // Would need to get from events in real implementation
              tokenId: BigInt(milestoneId) // Simplified mapping
            });
          }
        }
        
        console.log('MilestoneNFTService: Successfully retrieved user milestones:', milestones);
        return milestones;
      } catch (error) {
        lastError = error as Error;
        console.error(`MilestoneNFTService: Attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    console.error('MilestoneNFTService: All attempts failed:', lastError);
    return null;
  }

  async hasMilestone(userAddress: string, milestoneId: number): Promise<boolean | null> {
    if (!this.contract) return null;

    try {
      const result = await this.contract.has_milestone(userAddress, milestoneId);
      return Boolean(result);
    } catch (error) {
      console.error('Failed to check milestone:', error);
      return null;
    }
  }

  async getMilestoneMetadata(milestoneId: number): Promise<string | null> {
    if (!this.contract) return null;

    try {
      const result = await this.contract.get_milestone_metadata(milestoneId);
      return result;
    } catch (error) {
      console.error('Failed to get milestone metadata:', error);
      return null;
    }
  }

  // Write functions
  async mintMilestone(userAddress: string, milestoneId: number, options?: ContractCallOptions): Promise<TransactionResult | null> {
    if (!this.contract || !this.account) return null;

    try {
      const result = await this.contract.mint_milestone(userAddress, milestoneId, {
        maxFee: options?.maxFee
      });

      return {
        transactionHash: result.transaction_hash,
        status: 'pending'
      };
    } catch (error) {
      console.error('Failed to mint milestone:', error);
      return null;
    }
  }

  async checkAndMintEligibleMilestones(userAddress: string, options?: ContractCallOptions): Promise<TransactionResult | null> {
    if (!this.contract || !this.account) return null;

    try {
      const result = await this.contract.check_and_mint_eligible_milestones(userAddress, {
        maxFee: options?.maxFee
      });

      return {
        transactionHash: result.transaction_hash,
        status: 'pending'
      };
    } catch (error) {
      console.error('Failed to check and mint eligible milestones:', error);
      return null;
    }
  }

  // Static milestone definitions
  static getMilestoneDefinition(id: number): Milestone | null {
    const milestones: Record<number, Milestone> = {
      1: {
        id: 1,
        name: 'First Bake',
        description: 'Complete your first baking session',
        requirement: 'Log 1 bake',
        rewardXP: BigInt(100)
      },
      2: {
        id: 2,
        name: 'Week Warrior',
        description: 'Maintain a 7-day baking streak',
        requirement: 'Achieve 7-day streak',
        rewardXP: BigInt(500)
      },
      3: {
        id: 3,
        name: 'XP Hunter',
        description: 'Accumulate 1000 XP',
        requirement: 'Reach 1000 XP',
        rewardXP: BigInt(200)
      },
      4: {
        id: 4,
        name: 'Pod Creator',
        description: 'Create your first baking pod',
        requirement: 'Create 1 pod',
        rewardXP: BigInt(300)
      },
      5: {
        id: 5,
        name: 'Social Baker',
        description: 'Join 3 different baking pods',
        requirement: 'Join 3 pods',
        rewardXP: BigInt(400)
      },
      6: {
        id: 6,
        name: 'Century Club',
        description: 'Complete 100 baking sessions',
        requirement: 'Log 100 bakes',
        rewardXP: BigInt(1000)
      },
      7: {
        id: 7,
        name: 'Level Master',
        description: 'Reach level 10',
        requirement: 'Achieve level 10',
        rewardXP: BigInt(750)
      },
      8: {
        id: 8,
        name: 'Streak Legend',
        description: 'Maintain a 30-day baking streak',
        requirement: 'Achieve 30-day streak',
        rewardXP: BigInt(1500)
      }
    };

    return milestones[id] || null;
  }

  static getAllMilestones(): Milestone[] {
    return [1, 2, 3, 4, 5, 6, 7, 8].map(id => MilestoneNFTService.getMilestoneDefinition(id)!);
  }

  static getMilestonesByCategory(category: 'streak' | 'xp' | 'social' | 'achievement'): Milestone[] {
    const categoryMap: Record<string, number[]> = {
      streak: [2, 8],
      xp: [3, 7],
      social: [4, 5],
      achievement: [1, 6]
    };

    return (categoryMap[category] || [])
      .map(id => MilestoneNFTService.getMilestoneDefinition(id)!)
      .filter(Boolean);
  }
}

export const milestoneNFTService = new MilestoneNFTService(); 