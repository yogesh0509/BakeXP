// Contract services
export { XPTrackerService, xpTrackerService } from './XPTrackerService';
export { BakePodsService, bakePodsService } from './BakePodsService';
export { MilestoneNFTService, milestoneNFTService } from './MilestoneNFTService';
export { ContractManager, contractManager } from './ContractManager';

// Constants and types
export { CONTRACT_ADDRESSES, NETWORK_CONFIG, DEFAULT_NETWORK } from './constants';
export type {
  UserXPData,
  Pod,
  PodStats,
  PodMember,
  Milestone,
  UserMilestone,
  TransactionResult,
  ContractCallOptions,
  ContractReadOptions,
  ContractError
} from './types';

// Utility functions
export { XPTrackerService as XPUtils } from './XPTrackerService';
export { MilestoneNFTService as MilestoneUtils } from './MilestoneNFTService';
export { BakePodsService as PodUtils } from './BakePodsService'; 