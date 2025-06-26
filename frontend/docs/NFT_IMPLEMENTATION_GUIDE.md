# BakeXP NFT Implementation Guide

## 🎯 Overview

This guide explains the complete NFT implementation in BakeXP, including image upload, automatic minting, and display functionality.

## 🏗️ Architecture

### Components Created:
1. **ImageUpload** (`src/components/ui/image-upload.tsx`) - File upload with preview
2. **NFTCard** (`src/components/ui/nft-card.tsx`) - Individual NFT display
3. **NFTGallery** (`src/components/ui/nft-gallery.tsx`) - Collection view with filtering
4. **BakeLogger** (`src/components/ui/bake-logger.tsx`) - Enhanced bake logging with auto-NFT minting

### Services:
1. **IPFSService** (`src/services/IPFSService.ts`) - Production image storage
2. **MilestoneNFTService** (Enhanced) - Real contract integration

## 📸 Image Upload Implementation

### Development Mode (Base64):
```typescript
// Automatic fallback for development
const handleImageSelect = (imageData: string, file: File) => {
  // imageData is base64 string
  setImageData(imageData);
  setSelectedFile(file);
};
```

### Production Mode (IPFS):
```typescript
// Environment variables needed:
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud

// Usage:
const imageResult = await ipfsService.uploadImage(file, {
  name: "Bake Photo",
  description: "Today's creation"
});
// Returns: { hash, url }
```

## 🏆 NFT Minting Flow

### Automatic Milestone Detection:
```typescript
// When user logs a bake
const bakeResult = await logBakeWithRewards();

// Contract automatically checks eligibility
const milestoneResult = await checkAndMintMilestones();

// If milestones unlocked, NFTs are minted automatically
```

### Manual NFT Creation (Admin):
```typescript
// For special events or custom milestones
const nftMetadata = await ipfsService.createNFTMetadata(imageFile, {
  name: "Special Achievement",
  description: "Limited time milestone",
  attributes: [
    { trait_type: "Category", value: "Special" },
    { trait_type: "Rarity", value: "Legendary" }
  ]
});

await milestoneNFTService.mintMilestone(userAddress, milestoneId);
```

## 🎨 NFT Metadata Structure

### Standard Milestone NFT:
```json
{
  "name": "Week Warrior",
  "description": "Maintained a 7-day baking streak",
  "image": "ipfs://QmHashOfImage",
  "attributes": [
    { "trait_type": "Category", "value": "Streak" },
    { "trait_type": "Difficulty", "value": "Common" },
    { "trait_type": "XP Reward", "value": "500" },
    { "trait_type": "Unlocked Date", "value": "2024-01-15" }
  ],
  "external_url": "https://bakexp.com/milestones/2"
}
```

### Custom Achievement NFT:
```json
{
  "name": "Sourdough Master",
  "description": "Created 10 sourdough recipes",
  "image": "ipfs://QmCustomImage",
  "attributes": [
    { "trait_type": "Category", "value": "Recipe" },
    { "trait_type": "Recipe Type", "value": "Sourdough" },
    { "trait_type": "Count", "value": "10" },
    { "trait_type": "Rarity", "value": "Rare" }
  ]
}
```

## 📱 User Interface

### Bake Logging Flow:
1. **Upload Image**: Drag & drop or click to select
2. **Add Description**: Required field with character limit
3. **Add Tags**: Optional categorization
4. **Submit**: Single click logs bake + checks milestones
5. **Success**: Shows XP earned + any new NFTs unlocked

### NFT Gallery Features:
- **Filtering**: Common, Rare, Legendary
- **Sorting**: By date, rarity, category
- **Search**: Find specific achievements
- **Details**: Click for full metadata
- **Rarity Indicators**: Color-coded by XP value

## 🔧 Setup Instructions

### 1. Development Setup (Base64):
```bash
# No additional setup needed
# Images stored as base64 in localStorage
npm run dev
```

### 2. Production Setup (IPFS):
```bash
# 1. Create Pinata account (https://pinata.cloud)
# 2. Generate JWT token
# 3. Add to environment variables
echo "NEXT_PUBLIC_PINATA_JWT=your_jwt_here" >> .env.local
echo "NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud" >> .env.local

# 4. Deploy with IPFS enabled
npm run build
npm run start
```

### 3. Contract Configuration:
```typescript
// src/contracts/constants.ts
export const CONTRACT_ADDRESSES = {
  XP_TRACKER: '0x734352fe863098a0813160c9cf255e0b6312a8417c3a68003c05b30ff687e73',
  MILESTONE_NFT: '0x77ac394d657bcb17662b38e2e4864d026483babf9ad7e75e902afacd8215e4c',
  BAKE_PODS: '0x26ee488bb00fec5bda085b15d4a1c483052f74a09b1b80b5f6f6cc61da376b8'
};
```

## 🚀 Usage Examples

### Basic Bake Logging:
```tsx
import { BakeLogger } from '@/components/ui/bake-logger';

function LogPage() {
  const handleBakeLogged = (bakeId: string) => {
    console.log('New bake logged:', bakeId);
    // Refresh data, show success message, etc.
  };

  return <BakeLogger onBakeLogged={handleBakeLogged} />;
}
```

### NFT Gallery Display:
```tsx
import { NFTGallery } from '@/components/ui/nft-gallery';

function MilestonesPage() {
  return (
    <div>
      <h1>My Achievements</h1>
      <NFTGallery />
    </div>
  );
}
```

### Custom Image Upload:
```tsx
import { ImageUpload } from '@/components/ui/image-upload';

function CustomForm() {
  const handleImageSelect = (imageData: string, file: File) => {
    // Handle image selection
    setFormData(prev => ({ ...prev, image: imageData }));
  };

  return (
    <ImageUpload
      onImageSelect={handleImageSelect}
      maxSize={5} // 5MB limit
      preview={true}
    />
  );
}
```

## 🔍 Available Milestones

| ID | Name | Requirement | XP Reward | Rarity |
|----|------|-------------|-----------|---------|
| 1 | First Bake | Log 1 bake | 100 | Common |
| 2 | Week Warrior | 7-day streak | 500 | Rare |
| 3 | XP Hunter | Reach 1000 XP | 200 | Common |
| 4 | Pod Creator | Create 1 pod | 300 | Common |
| 5 | Social Baker | Join 3 pods | 400 | Common |
| 6 | Century Club | Log 100 bakes | 1000 | Legendary |
| 7 | Level Master | Reach level 10 | 750 | Rare |
| 8 | Streak Legend | 30-day streak | 1500 | Legendary |

## 🛠️ Customization

### Adding New Milestones:
1. **Update Contract**: Add milestone definition in MilestoneNFT contract
2. **Update Service**: Add milestone to `MilestoneNFTService.getMilestoneDefinition()`
3. **Test Logic**: Ensure automatic detection works in `checkAndMintEligibleMilestones()`

### Custom NFT Categories:
```typescript
// Add new rarity levels
const getRarityColor = (rewardXP: number) => {
  if (rewardXP >= 2000) return 'bg-gradient-to-r from-purple-400 to-pink-400'; // Mythic
  if (rewardXP >= 1000) return 'bg-yellow-100 border-yellow-300'; // Legendary
  if (rewardXP >= 500) return 'bg-purple-100 border-purple-300'; // Rare
  return 'bg-gray-100 border-gray-300'; // Common
};
```

### Enhanced Metadata:
```typescript
// Add dynamic attributes based on user progress
const generateDynamicAttributes = (userStats: UserXPData) => [
  { trait_type: "User Level", value: userStats.level },
  { trait_type: "Total Bakes", value: userStats.totalBakes },
  { trait_type: "Streak", value: userStats.streak },
  { trait_type: "Unlock Date", value: new Date().toISOString() }
];
```

## 🔐 Security Considerations

### Image Upload:
- **File Type Validation**: Only image files accepted
- **Size Limits**: Maximum 5MB per upload
- **Content Scanning**: Consider adding image content validation

### Contract Interactions:
- **Transaction Validation**: Verify all contract calls
- **Error Handling**: Graceful fallbacks for failed operations
- **Rate Limiting**: Prevent spam minting

### IPFS Storage:
- **Backup Strategy**: Consider multiple IPFS providers
- **Gateway Reliability**: Use reliable IPFS gateways
- **Data Persistence**: Ensure long-term storage via pinning

## 📈 Future Enhancements

### Planned Features:
1. **Animated NFTs**: Support for video/GIF content
2. **NFT Trading**: Marketplace for milestone exchanges
3. **Custom Collections**: User-created achievement sets
4. **Social Sharing**: Direct NFT sharing to social media
5. **AR Integration**: View NFTs in augmented reality

### Technical Improvements:
1. **Batch Minting**: Mint multiple milestones in single transaction
2. **Lazy Minting**: Defer minting until user claims
3. **Off-chain Metadata**: Hybrid on/off-chain approach
4. **Multi-chain Support**: Deploy to other networks

This implementation provides a complete, production-ready NFT system that enhances user engagement while maintaining technical excellence and security. 