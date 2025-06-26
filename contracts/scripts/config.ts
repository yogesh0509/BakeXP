import { existsSync, writeFileSync, readFileSync } from 'fs';
import chalk from 'chalk';
import dotenv from 'dotenv';
dotenv.config();

// Contract file paths (constant)
const CONTRACT_PATHS = {
    sierraPathXpTracker: 'target/dev/bakexp_contracts_XPTracker.contract_class.json',
    casmPathXpTracker: 'target/dev/bakexp_contracts_XPTracker.compiled_contract_class.json',
    sierraPathMilestoneNft: 'target/dev/bakexp_contracts_MilestoneNFT.contract_class.json',
    casmPathMilestoneNft: 'target/dev/bakexp_contracts_MilestoneNFT.compiled_contract_class.json',
    sierraPathBakePods: 'target/dev/bakexp_contracts_BakePods.contract_class.json',
    casmPathBakePods: 'target/dev/bakexp_contracts_BakePods.compiled_contract_class.json'
};

// Load and validate environment configuration
function loadEnvConfig() {
    const requiredEnvVars = ['STARKNET_RPC', 'STARKNET_ACCOUNT_ADDRESS', 'STARKNET_PRIVATE_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error(chalk.red('❌ Missing required environment variables:'));
        missingVars.forEach(varName => {
            console.error(chalk.yellow(`   ${varName}`));
        });
        console.error(chalk.blue('\nAdd them to your .env file:'));
        console.error(chalk.gray('STARKNET_RPC=<your_rpc_url>'));
        console.error(chalk.gray('STARKNET_ACCOUNT_ADDRESS=<your_account_address>'));
        console.error(chalk.gray('STARKNET_PRIVATE_KEY=<your_private_key>'));
        process.exit(1);
    }

    return {
        rpcUrl: process.env.STARKNET_RPC!,
        accountAddress: process.env.STARKNET_ACCOUNT_ADDRESS!,
        privateKey: process.env.STARKNET_PRIVATE_KEY!,
        ...CONTRACT_PATHS
    };
}

// Export the configuration
export const config = loadEnvConfig();

// Class hashes storage
const CLASS_HASHES_FILE = '.class_hashes.json';

export interface ClassHashes {
    XPTracker?: string;
    MilestoneNFT?: string;
    BakePods?: string;
}

export function saveClassHashes(hashes: ClassHashes) {
    writeFileSync(CLASS_HASHES_FILE, JSON.stringify(hashes, null, 2));
    console.log(chalk.green('✅ Class hashes saved successfully'));
}

export function loadClassHashes(): ClassHashes {
    try {
        if (!existsSync(CLASS_HASHES_FILE)) {
            return {};
        }
        return JSON.parse(readFileSync(CLASS_HASHES_FILE, 'utf8'));
    } catch (error) {
        console.log(chalk.yellow('⚠️ No class hashes found'));
        return {};
    }
}

export function checkContractFiles(): boolean {
    console.log(chalk.blue('🔍 Checking contract files...'));
    
    const contracts = [
        { name: 'XPTracker', sierra: config.sierraPathXpTracker, casm: config.casmPathXpTracker },
        { name: 'MilestoneNFT', sierra: config.sierraPathMilestoneNft, casm: config.casmPathMilestoneNft },
        { name: 'BakePods', sierra: config.sierraPathBakePods, casm: config.casmPathBakePods }
    ];

    let allExist = true;
    
    for (const contract of contracts) {
        if (!existsSync(contract.sierra) || !existsSync(contract.casm)) {
            console.log(chalk.red(`❌ Missing files for ${contract.name}`));
            allExist = false;
        } else {
            console.log(chalk.green(`✅ ${contract.name} files found`));
        }
    }

    if (!allExist) {
        console.log(chalk.yellow('\n💡 Run: scarb build'));
        return false;
    }

    return true;
}

export function displayConfig(): void {
    console.log(chalk.cyan('\n📋 DEPLOYMENT CONFIGURATION'));
    console.log(chalk.cyan('================================'));
    console.log(chalk.white(`🔗 RPC URL: ${config.rpcUrl}`));
    console.log(chalk.white(`👛 Account Address: ${config.accountAddress}`));
    console.log(chalk.cyan('================================\n'));
}

export function validateConfig(): boolean {
    if (!config.accountAddress || !config.privateKey || !config.rpcUrl) {
        console.log(chalk.red('❌ Missing required environment variables'));
        return false;
    }
    return true;
} 