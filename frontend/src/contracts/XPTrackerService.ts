import { Contract, Account, CallData } from 'starknet';
import { CONTRACT_ADDRESSES } from './constants';
import { UserXPData, TransactionResult, ContractCallOptions, ContractReadOptions } from './types';
import XPTrackerABI from './abis/XPTracker.json';

export class XPTrackerService {
  private contract: Contract | null = null;
  private account: Account | null = null;

  constructor() {
    this.initializeContract();
  }

  private initializeContract() {
    try {
      // Initialize read-only contract with real ABI
      this.contract = new Contract(XPTrackerABI, CONTRACT_ADDRESSES.XP_TRACKER);
    } catch (error) {
      console.error('Failed to initialize XP Tracker contract:', error);
    }
  }

  public setAccount(account: Account) {
    this.account = account;
    if (this.contract) {
      this.contract.connect(account);
    }
  }

  // Read functions
  async getUserXPData(userAddress: string, options?: ContractReadOptions): Promise<UserXPData | null> {
    if (!this.contract) return null;

    try {
      const [xp, level, streak, totalBakes, lastBakeTimestamp] = await Promise.all([
        this.contract.get_xp(userAddress),
        this.contract.get_level(userAddress),
        this.contract.get_streak(userAddress),
        this.contract.get_total_bakes(userAddress),
        this.contract.get_last_bake_timestamp(userAddress)
      ]);

      return {
        xp: BigInt(xp.toString()),
        level: Number(level),
        streak: Number(streak),
        totalBakes: Number(totalBakes),
        lastBakeTimestamp: Number(lastBakeTimestamp)
      };
    } catch (error) {
      console.error('Failed to get user XP data:', error);
      return null;
    }
  }

  async getUserXP(userAddress: string): Promise<bigint | null> {
    if (!this.contract) return null;

    try {
      const result = await this.contract.get_xp(userAddress);
      return BigInt(result.toString());
    } catch (error) {
      console.error('Failed to get user XP:', error);
      return null;
    }
  }

  async getUserLevel(userAddress: string): Promise<number | null> {
    if (!this.contract) return null;

    try {
      const result = await this.contract.get_level(userAddress);
      return Number(result);
    } catch (error) {
      console.error('Failed to get user level:', error);
      return null;
    }
  }

  async getUserStreak(userAddress: string): Promise<number | null> {
    if (!this.contract) return null;

    try {
      const result = await this.contract.get_streak(userAddress);
      return Number(result);
    } catch (error) {
      console.error('Failed to get user streak:', error);
      return null;
    }
  }

  async getTotalBakes(userAddress: string): Promise<number | null> {
    if (!this.contract) return null;

    try {
      const result = await this.contract.get_total_bakes(userAddress);
      return Number(result);
    } catch (error) {
      console.error('Failed to get total bakes:', error);
      return null;
    }
  }

  async getLastBakeTimestamp(userAddress: string): Promise<number | null> {
    if (!this.contract) return null;

    try {
      const result = await this.contract.get_last_bake_timestamp(userAddress);
      return Number(result);
    } catch (error) {
      console.error('Failed to get last bake timestamp:', error);
      return null;
    }
  }

  // Write functions
  async logBake(userAddress: string, options?: ContractCallOptions): Promise<TransactionResult | null> {
    if (!this.contract || !this.account) return null;

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      
      const result = await this.contract.log_bake(userAddress, timestamp, {
        maxFee: options?.maxFee
      });

      return {
        transactionHash: result.transaction_hash,
        status: 'pending'
      };
    } catch (error) {
      console.error('Failed to log bake:', error);
      return null;
    }
  }

  async addXP(userAddress: string, amount: bigint, options?: ContractCallOptions): Promise<TransactionResult | null> {
    if (!this.contract || !this.account) return null;

    try {
      const result = await this.contract.add_xp(userAddress, amount, {
        maxFee: options?.maxFee
      });

      return {
        transactionHash: result.transaction_hash,
        status: 'pending'
      };
    } catch (error) {
      console.error('Failed to add XP:', error);
      return null;
    }
  }

  // Utility functions
  static calculateLevel(xp: bigint): number {
    // Basic level calculation: level = sqrt(xp / 100)
    const xpNumber = Number(xp);
    return Math.floor(Math.sqrt(xpNumber / 100));
  }

  static getXPForLevel(level: number): bigint {
    // XP required for a level: level^2 * 100
    return BigInt(level * level * 100);
  }

  static getXPToNextLevel(currentXP: bigint): { current: number, next: number, required: bigint } {
    const currentLevel = XPTrackerService.calculateLevel(currentXP);
    const nextLevel = currentLevel + 1;
    const requiredXP = XPTrackerService.getXPForLevel(nextLevel);
    
    return {
      current: currentLevel,
      next: nextLevel,
      required: requiredXP - currentXP
    };
  }
}

export const xpTrackerService = new XPTrackerService(); 