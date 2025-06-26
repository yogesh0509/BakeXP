import { Account } from 'starknet';
import { xpTrackerService } from './XPTrackerService';
import { bakePodsService } from './BakePodsService';
import { milestoneNFTService } from './MilestoneNFTService';

export class ContractManager {
  private currentAccount: Account | null = null;
  private isInitialized = false;

  public setAccount(account: Account | null) {
    console.log('ContractManager: Setting account', account ? 'Connected' : 'Disconnected');
    this.currentAccount = account;
    
    // Set account on all services
    xpTrackerService.setAccount(account);
    bakePodsService.setAccount(account);
    milestoneNFTService.setAccount(account);
    
    this.isInitialized = true;
  }

  public getAccount(): Account | null {
    return this.currentAccount;
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  async logBakeWithRewards(userAddress: string, podId?: number) {
    if (!this.currentAccount) {
      console.warn('ContractManager: No account set for write operations');
      return null;
    }

    try {
      // Combined bake logging with rewards
      const xpResult = await xpTrackerService.logBake(userAddress);
      
      if (podId) {
        await bakePodsService.logPodBake(podId);
      }
      
      await milestoneNFTService.checkAndMintEligibleMilestones(userAddress);
      
      return xpResult;
    } catch (error) {
      console.error('ContractManager: Failed to log bake with rewards:', error);
      return null;
    }
  }
}

export const contractManager = new ContractManager(); 