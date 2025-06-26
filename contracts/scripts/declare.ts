#!/usr/bin/env tsx

import { Account, RpcProvider } from 'starknet';
import { readFileSync } from 'fs';
import chalk from 'chalk';
import { config, checkContractFiles, saveClassHashes } from './config.js';

class ContractDeclarer {
    private provider: RpcProvider;
    private account: Account;

    constructor() {
        this.provider = new RpcProvider({ nodeUrl: config.rpcUrl });
        this.account = new Account(
            this.provider,
            config.accountAddress,
            config.privateKey,
            "1",  // account version
            "0x3"  // transaction version
        );
    }

    async declareContract(contractName: string, sierraPath: string, casmPath: string): Promise<string> {
        console.log(chalk.blue(`📝 Declaring ${contractName} contract...`));

        // Read contract files
        const sierraContract = JSON.parse(readFileSync(sierraPath, 'utf8'));
        const casmContract = JSON.parse(readFileSync(casmPath, 'utf8'));

        try {
            const declareResponse = await this.account.declare({
                contract: sierraContract,
                casm: casmContract
            });

            console.log(chalk.green(`✅ ${contractName} declared successfully`));
            console.log(chalk.gray(`📋 Class Hash: ${declareResponse.class_hash}`));
            
            return declareResponse.class_hash;
        } catch (error: any) {
            // Parse the error message
            const errorMsg = error.message || '';
            
            // Try to find "Class with hash 0x... is already declared"
            const alreadyDeclaredMatch = errorMsg.match(/Class with hash (0x[a-fA-F0-9]+) is already declared/);
            if (alreadyDeclaredMatch) {
                const classHash = alreadyDeclaredMatch[1];
                console.log(chalk.yellow(`⚠️ ${contractName} already declared`));
                console.log(chalk.gray(`📋 Class Hash: ${classHash}`));
                return classHash;
            }
            
            // Also try to parse JSON error message if present
            try {
                const jsonError = JSON.parse(errorMsg);
                if (jsonError.execution_error && typeof jsonError.execution_error === 'string') {
                    const jsonMatch = jsonError.execution_error.match(/Class with hash (0x[a-fA-F0-9]+) is already declared/);
                    if (jsonMatch) {
                        const classHash = jsonMatch[1];
                        console.log(chalk.yellow(`⚠️ ${contractName} already declared`));
                        console.log(chalk.gray(`📋 Class Hash: ${classHash}`));
                        return classHash;
                    }
                }
            } catch {} // Ignore JSON parse errors

            // If we couldn't extract the class hash, throw the original error
            throw error;
        }
    }
}

async function main() {
    console.log(chalk.cyan('\n=== BakeXP Contract Declaration ===\n'));

    // Check if contract files exist
    if (!checkContractFiles()) {
        process.exit(1);
    }

    const declarer = new ContractDeclarer();
    const classHashes: { [key: string]: string } = {};

    try {
        // Declare XPTracker
        classHashes.XPTracker = await declarer.declareContract(
            'XPTracker',
            config.sierraPathXpTracker,
            config.casmPathXpTracker
        );

        // Declare MilestoneNFT
        classHashes.MilestoneNFT = await declarer.declareContract(
            'MilestoneNFT',
            config.sierraPathMilestoneNft,
            config.casmPathMilestoneNft
        );

        // Declare BakePods
        classHashes.BakePods = await declarer.declareContract(
            'BakePods',
            config.sierraPathBakePods,
            config.casmPathBakePods
        );

        // Save class hashes for deployment
        saveClassHashes(classHashes);

        console.log(chalk.green('\n✅ All contracts declared successfully!'));
        console.log(chalk.blue('📝 Class hashes saved for deployment'));
    } catch (error) {
        console.error(chalk.red('❌ Declaration failed:'), error);
        process.exit(1);
    }
}

main();