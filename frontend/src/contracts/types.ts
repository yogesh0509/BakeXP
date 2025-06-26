// XP Tracker Types
export interface UserXPData {
  xp: bigint;
  level: number;
  streak: number;
  totalBakes: number;
  lastBakeTimestamp: number;
}

// Pod Types
export interface Pod {
  id: number;
  name: string;
  description: string;
  creator: string;
  memberLimit: number;
  createdAt: number;
  isActive: boolean;
  currentStreak: number;
  targetStreak: number;
}

export interface PodStats {
  podId: number;
  totalBakes: number;
  memberCount: number;
  dailyBakesToday: number;
  currentStreak: number;
  targetStreak: number;
  isActive: boolean;
}

export interface PodMember {
  address: string;
  joinedAt: number;
  totalBakes: number;
  hasBakedToday: boolean;
}

// Milestone Types
export interface Milestone {
  id: number;
  name: string;
  description: string;
  requirement: string;
  rewardXP: bigint;
  imageUrl?: string;
}

export interface UserMilestone {
  id: number;
  name: string;
  description: string;
  requirement: string;
  rewardXP: bigint;
  tokenId: bigint;
  mintedAt: number;
}

// Contract Call Types
export interface ContractCallOptions {
  maxFee?: bigint;
  version?: string;
}

export interface ContractReadOptions {
  blockNumber?: number;
}

// Transaction Result Types
export interface TransactionResult {
  transactionHash: string;
  status: 'pending' | 'accepted' | 'rejected';
}

// Error Types
export interface ContractError {
  code: string;
  message: string;
  details?: any;
} 