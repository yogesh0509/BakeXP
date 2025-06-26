#!/usr/bin/env tsx

import { existsSync, writeFileSync, readFileSync } from 'fs';
import chalk from 'chalk';
import { prompt } from 'enquirer';

interface SetupConfig {
  ownerAddress: string;
  privateKey: string;
  network: 'sepolia' | 'mainnet';
}

async function checkDependencies() {
  console.log(chalk.blue('🔍 Checking dependencies...'));
  
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
    console.log(chalk.green('✅ package.json found'));
    
    if (!existsSync('node_modules')) {
      console.log(chalk.yellow('⚠️  Dependencies not installed. Installing...'));
      const { execSync } = require('child_process');
      execSync('npm install', { stdio: 'inherit' });
    }
    
    console.log(chalk.green('✅ Dependencies ready'));
  } catch (error) {
    console.log(chalk.red('❌ Error checking dependencies'));
    console.log(chalk.yellow('Please run: npm install'));
    process.exit(1);
  }
}

async function promptForConfig(): Promise<SetupConfig> {
  console.log(chalk.cyan('\n📝 Configuration Setup'));
  console.log(chalk.gray('Please provide your Starknet account details:\n'));
  
  const questions = [
    {
      type: 'input',
      name: 'ownerAddress',
      message: 'Enter your wallet address (0x...):',
      validate: (input: string) => {
        if (!input.startsWith('0x') || input.length !== 66) {
          return 'Please enter a valid Starknet address (0x... with 64 hex characters)';
        }
        return true;
      }
    },
    {
      type: 'password',
      name: 'privateKey',
      message: 'Enter your private key (0x...):',
      validate: (input: string) => {
        if (!input.startsWith('0x') || input.length !== 66) {
          return 'Please enter a valid private key (0x... with 64 hex characters)';
        }
        return true;
      }
    },
    {
      type: 'select',
      name: 'network',
      message: 'Select network:',
      choices: ['sepolia', 'mainnet'],
      initial: 0
    }
  ];
  
  return await prompt(questions) as SetupConfig;
}

function createEnvFile(config: SetupConfig) {
  const envContent = `# BakeXP Deployment Configuration
# Generated on ${new Date().toISOString()}

# Your Starknet wallet address (the owner of the contracts)
OWNER_ADDRESS=${config.ownerAddress}

# Your private key (keep this secret!)
PRIVATE_KEY=${config.privateKey}

# Network to deploy to (sepolia or mainnet)
NETWORK=${config.network}

# RPC URL (optional, defaults to public RPC)
# RPC_URL=https://starknet-${config.network}.public.blastapi.io/rpc/v0_8
`;

  writeFileSync('.env', envContent);
  console.log(chalk.green('✅ .env file created successfully!'));
}

async function main() {
  console.log(chalk.bold.cyan('🔧 BakeXP Deployment Setup\n'));
  
  try {
    // Check if .env already exists
    if (existsSync('.env')) {
      const { overwrite } = await prompt({
        type: 'confirm',
        name: 'overwrite',
        message: '.env file already exists. Overwrite it?',
        initial: false
      }) as { overwrite: boolean };
      
      if (!overwrite) {
        console.log(chalk.yellow('Setup cancelled. Using existing .env file.'));
        return;
      }
    }
    
    // Check dependencies
    await checkDependencies();
    
    // Get configuration from user
    const config = await promptForConfig();
    
    // Create .env file
    createEnvFile(config);
    
    console.log(chalk.cyan('\n🎯 Next Steps:'));
    console.log(chalk.white('1. Make sure you have STRK tokens for deployment fees'));
    
    if (config.network === 'sepolia') {
      console.log(chalk.white('   Get testnet STRK: https://starknet-faucet.vercel.app'));
    }
    
    console.log(chalk.white('2. Run the deployment:'));
    console.log(chalk.gray('   npm run deploy'));
    console.log(chalk.white('3. Or build contracts first:'));
    console.log(chalk.gray('   scarb build && npm run deploy'));
    
    console.log(chalk.green('\n✅ Setup complete! Ready for deployment.\n'));
    
  } catch (error: any) {
    console.error(chalk.red('\n❌ Setup failed:'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// Run setup
main().catch(console.error); 