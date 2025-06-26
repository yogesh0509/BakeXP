# BakeXP Contracts - TypeScript Deployment

This document describes how to deploy the BakeXP smart contracts using the TypeScript deployment scripts.

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **Scarb** (Cairo/Starknet build tool)
3. **Starknet Account** with private key
4. **STRK Tokens** for transaction fees

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Configuration

Run the interactive setup to configure your deployment:

```bash
npm run setup
```

This will:
- Prompt for your wallet address and private key
- Select the network (Sepolia or Mainnet)
- Create a `.env` file with your configuration

### 3. Deploy Contracts

```bash
npm run deploy
```

For specific networks:

```bash
npm run deploy:sepolia  # Deploy to Sepolia testnet
npm run deploy:mainnet  # Deploy to Mainnet
```

## Manual Configuration

If you prefer to manually configure, create a `.env` file:

```env
# Your Starknet wallet address (the owner of the contracts)
OWNER_ADDRESS=0x1234567890abcdef1234567890abcdef12345678

# Your private key (keep this secret!)
PRIVATE_KEY=0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890

# Network to deploy to (sepolia or mainnet)
NETWORK=sepolia

# RPC URL (optional, defaults to public RPC)
# RPC_URL=https://starknet-sepolia.public.blastapi.io
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run setup` | Interactive account setup |
| `npm run declare` | Declare all contracts (step 1) |
| `npm run declare:sepolia` | Declare contracts on Sepolia |
| `npm run declare:mainnet` | Declare contracts on Mainnet |
| `npm run deploy-only` | Deploy contracts using class hashes (step 2) |
| `npm run deploy-only:sepolia` | Deploy to Sepolia using class hashes |
| `npm run deploy-only:mainnet` | Deploy to Mainnet using class hashes |
| `npm run deploy` | Full deployment (declare + deploy) |
| `npm run deploy:sepolia` | Full deployment to Sepolia testnet |
| `npm run deploy:mainnet` | Full deployment to Mainnet |
| `npm run build` | Compile TypeScript |

## Two-Step Deployment (Recommended)

The deployment process is split into two steps for better control and cost efficiency:

### Step 1: Declare Contracts

```bash
npm run declare
```

This will:
- Build contracts if needed
- Declare each contract class on the network
- Handle already-declared contracts automatically
- Show class hashes for each contract

### Step 2: Deploy Contracts

```bash
npm run deploy-only
```

Or with inline class hashes:

```bash
CLASS_HASH_XP_TRACKER=0x123... \
CLASS_HASH_MILESTONE_NFT=0x456... \
CLASS_HASH_BAKEPODS=0x789... \
npm run deploy-only
```

**Benefits of Two-Step Approach:**
- Reuse declared contracts across deployments
- Save gas on subsequent deployments
- Deploy with different accounts without re-declaring
- Better error handling and debugging

## Deployment Process

The deployment script will:

1. **Build Contracts** - Compile Cairo contracts using `scarb build`
2. **Check Balance** - Verify you have sufficient STRK tokens
3. **Deploy XPTracker** - The core XP tracking contract
4. **Deploy MilestoneNFT** - NFT contract for milestone rewards
5. **Deploy BakePods** - Main game contract for pod management
6. **Verify Deployments** - Test basic contract functionality
7. **Save Results** - Export deployment details to JSON file

## Contract Dependencies

The contracts are deployed in this order due to dependencies:

```
XPTracker (no dependencies)
    ↓
MilestoneNFT (depends on XPTracker)
    ↓
BakePods (depends on XPTracker and MilestoneNFT)
```

## Output Files

After successful deployment, you'll get:

- **Deployment JSON** - `deployment_<network>_<timestamp>.json`
  Contains all contract addresses, class hashes, and transaction hashes

- **Frontend Config** - Contract addresses formatted for frontend integration

## Verification

The script automatically verifies deployments by:

- Checking XPTracker with `get_xp()` call
- Checking MilestoneNFT with `get_user_milestones()` call  
- Checking BakePods with `get_user_pods()` call

## Troubleshooting

### Insufficient Balance

If you see "Resources bounds exceed balance":

1. **Check Balance**: The script shows your STRK balance
2. **Get Tokens**: 
   - Sepolia: https://starknet-faucet.vercel.app
   - Mainnet: Purchase STRK tokens

### Contract Already Declared

If a contract is already declared, the script will:
- Extract the existing class hash from the error
- Continue with deployment using the existing class hash

### Network Issues

- Verify RPC URL in your `.env` file
- Try a different RPC endpoint if one is failing
- Check network status at https://status.starknet.io

### Build Failures

```bash
# Clean and rebuild
rm -rf target/
scarb build

# Check for syntax errors in Cairo files
scarb check
```

## Security Notes

- **Never commit** your `.env` file to version control
- **Keep your private key** secure and never share it
- **Double-check** the network before deploying to mainnet
- **Verify** contract addresses after deployment

## Frontend Integration

After deployment, update your frontend configuration with the contract addresses:

```typescript
// In your frontend config
export const CONTRACTS = {
  XP_TRACKER: "0x...",      // From deployment output
  MILESTONE_NFT: "0x...",   // From deployment output
  BAKEPODS: "0x..."         // From deployment output
};
```

## Network Configurations

### Sepolia Testnet
- **RPC**: https://starknet-sepolia.public.blastapi.io
- **Explorer**: https://sepolia.starkscan.co
- **Faucet**: https://starknet-faucet.vercel.app

### Mainnet
- **RPC**: https://starknet-mainnet.public.blastapi.io/rpc/v0_8
- **Explorer**: https://starkscan.co

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure your account has sufficient STRK balance
4. Check the Starknet network status

For contract-specific issues, review the Cairo source code in the `src/` directory. 