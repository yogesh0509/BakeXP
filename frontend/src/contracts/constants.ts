// Contract addresses
export const CONTRACT_ADDRESSES = {
  XP_TRACKER: "0x734352fe863098a0813160c9cf255e0b6312a8417c3a68003c05b30ff687e73",
  MILESTONE_NFT: "0x77ac394d657bcb17662b38e2e4864d026483babf9ad7e75e902afacd8215e4c",
  BAKE_PODS: "0x26ee488bb00fec5bda085b15d4a1c483052f74a09b1b80b5f6f6cc61da376b8"
} as const;

// Network configuration
export const NETWORK_CONFIG = {
  MAINNET: "mainnet-alpha",
  TESTNET: "goerli-alpha"
} as const;

// Default network
export const DEFAULT_NETWORK = NETWORK_CONFIG.MAINNET; 