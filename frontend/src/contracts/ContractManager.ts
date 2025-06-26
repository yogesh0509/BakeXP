import { Account } from 'starknet';
import { xpTrackerService } from './XPTrackerService';
import { bakePodsService } from './BakePodsService';
import { milestoneNFTService } from './MilestoneNFTService';

export class ContractManager {
  public setAccount(account: Account | null) {
    if (account) {
      xpTrackerService.setAccount(account);
      bakePodsService.setAccount(account);
      milestoneNFTService.setAccount(account);
    }
  }

  async logBakeWithRewards(userAddress: string, podId?: number) {
    // Combined bake logging with rewards
    const xpResult = await xpTrackerService.logBake(userAddress);
    
    if (podId) {
      await bakePodsService.logPodBake(podId);
    }
    
    await milestoneNFTService.checkAndMintEligibleMilestones(userAddress);
    
    return xpResult;
  }
}

export const contractManager = new ContractManager(); 