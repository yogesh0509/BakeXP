// #!/usr/bin/env tsx

// import chalk from 'chalk';
// import { CallData } from 'starknet';
// import { loadConfig, createAccount, formatExplorerLink } from './utils.js';

// interface DeploymentData {
//   contracts: {
//     xpTracker: { address: string };
//     milestoneNft: { address: string };
//     bakePods: { address: string };
//   };
//   network: string;
// }

// async function verifyContract(
//   account: any,
//   contractAddress: string,
//   contractName: string,
//   testCalls: Array<{ method: string; calldata: string[]; description: string }>
// ) {
//   console.log(chalk.blue(`\n🧪 Verifying ${contractName} at ${contractAddress}`));
  
//   for (const test of testCalls) {
//     try {
//       const result = await account.callContract({
//         contractAddress,
//         entrypoint: test.method,
//         calldata: CallData.compile(test.calldata)
//       });
      
//       console.log(chalk.green(`✅ ${test.description}: Success`));
//       if (result && result.length > 0) {
//         console.log(chalk.gray(`   Result: ${result[0]}`));
//       }
//     } catch (error: any) {
//       console.log(chalk.yellow(`⚠️  ${test.description}: ${error.message}`));
//     }
//   }
// }

// async function main() {
//   console.log(chalk.bold.cyan('🔍 Contract Verification Tool\n'));
  
//   try {
//     // Load configuration
//     const config = loadConfig();
//     console.log(chalk.blue(`Network: ${config.network}`));
//     console.log(chalk.blue(`Owner: ${config.ownerAddress}\n`));
    
//     // Create account
//     const account = createAccount(config);
    
//     // Check for deployment file
//     const fs = await import('fs');
//     const deploymentFiles = fs.readdirSync('.')
//       .filter(f => f.startsWith(`deployment_${config.network}_`) && f.endsWith('.json'))
//       .sort()
//       .reverse(); // Most recent first
    
//     if (deploymentFiles.length === 0) {
//       console.log(chalk.red('❌ No deployment files found.'));
//       console.log(chalk.yellow('Run deployment first: npm run deploy'));
//       process.exit(1);
//     }
    
//     const latestDeployment = deploymentFiles[0];
//     console.log(chalk.blue(`📄 Using deployment file: ${latestDeployment}\n`));
    
//     const deploymentData: DeploymentData = JSON.parse(
//       fs.readFileSync(latestDeployment, 'utf-8')
//     );
    
//     // Verify XPTracker
//     await verifyContract(
//       account,
//       deploymentData.contracts.xpTracker.address,
//       'XPTracker',
//       [
//         {
//           method: 'get_xp',
//           calldata: [config.ownerAddress],
//           description: 'Check XP for owner'
//         },
//         {
//           method: 'get_level',
//           calldata: [config.ownerAddress],
//           description: 'Check level for owner'
//         }
//       ]
//     );
    
//     // Verify MilestoneNFT
//     await verifyContract(
//       account,
//       deploymentData.contracts.milestoneNft.address,
//       'MilestoneNFT',
//       [
//         {
//           method: 'get_user_milestones',
//           calldata: [config.ownerAddress],
//           description: 'Check milestones for owner'
//         },
//         {
//           method: 'name',
//           calldata: [],
//           description: 'Get NFT collection name'
//         }
//       ]
//     );
    
//     // Verify BakePods
//     await verifyContract(
//       account,
//       deploymentData.contracts.bakePods.address,
//       'BakePods',
//       [
//         {
//           method: 'get_user_pods',
//           calldata: [config.ownerAddress],
//           description: 'Check pods for owner'
//         },
//         {
//           method: 'get_available_pods',
//           calldata: [],
//           description: 'Get available pod types'
//         }
//       ]
//     );
    
//     console.log(chalk.green('\n🎉 Contract verification completed!'));
    
//     // Print explorer links
//     console.log(chalk.cyan('\n🔗 Explorer Links:'));
//     Object.entries(deploymentData.contracts).forEach(([name, contract]) => {
//       const link = formatExplorerLink(contract.address, 'contract', config.network);
//       console.log(chalk.white(`${name}: ${link}`));
//     });
    
//   } catch (error: any) {
//     console.error(chalk.red('\n❌ Verification failed:'));
//     console.error(chalk.red(error.message));
//     process.exit(1);
//   }
// }

// // Run verification
// main().catch(console.error); 