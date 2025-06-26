#!/usr/bin/env tsx

import { Account, RpcProvider, CallData } from 'starknet';
import chalk from 'chalk';
import { config, loadClassHashes } from './config.js';

class ContractDeployer {
    private provider: RpcProvider;
    private account: Account;

    constructor() {
        this.provider = new RpcProvider({ 
            nodeUrl: config.rpcUrl,
            specVersion: '0.7.1'  // Explicitly set to match the node's version
        });
        
        this.account = new Account(
            this.provider,
            config.accountAddress,
            config.privateKey,
            '1'  // Chain ID
        );
    }

    async deployContract(contractName: string, classHash: string, constructorParams: any): Promise<{ address: string }> {
        console.log(chalk.blue(`🚀 Deploying ${contractName} contract...`));
        console.log(chalk.gray(`📋 Using Class Hash: ${classHash}`));
        console.log(chalk.gray(`🔧 Constructor params: ${JSON.stringify(constructorParams)}`));

        const constructorCalldata = CallData.compile(constructorParams);

        try {
            // Use v1 transaction format for RPC 0.7.1
            const deployResponse = await this.account.deployContract({
                classHash,
                constructorCalldata,
                salt: "0x" + Math.floor(Math.random() * 100000).toString(16).padStart(64, '0')
            }, {
                maxFee: "0x1234567890"  // Use maxFee instead of resourceBounds for v1
            });

            console.log(chalk.green(`✅ ${contractName} deployed successfully`));
            console.log(chalk.gray(`📋 Contract Address: ${deployResponse.contract_address}`));
            console.log(chalk.gray(`🔗 Transaction Hash: ${deployResponse.transaction_hash}`));

            // Wait for transaction to be accepted
            console.log(chalk.blue('⏳ Waiting for deployment confirmation...'));
            await this.provider.waitForTransaction(deployResponse.transaction_hash);
            console.log(chalk.green('✅ Deploy transaction confirmed!'));

            return { address: deployResponse.contract_address };
        } catch (error: any) {
            console.error(chalk.red('❌ Deployment error details:'));
            if (error.message) console.error(chalk.yellow('Message:', error.message));
            if (error.baseError?.data) console.error(chalk.yellow('Data:', error.baseError.data));
            throw error;
        }
    }
}

async function main() {
    console.log(chalk.cyan('\n=== BakeXP Contract Deployment ===\n'));

    // Load class hashes
    const classHashes = loadClassHashes();
    if (!classHashes.XPTracker || !classHashes.MilestoneNFT || !classHashes.BakePods) {
        console.error(chalk.red('❌ Missing class hashes. Run declare.ts first.'));
        process.exit(1);
    }

    const deployer = new ContractDeployer();
    try {
        // const rpcVersion = await deployer.provider.getSpecVersion();
        // console.log(chalk.blue(`📡 RPC Version: ${rpcVersion}`));
        // Deploy XPTracker
        const xpTracker = await deployer.deployContract(
            'XPTracker',
            classHashes.XPTracker,
            { owner: config.accountAddress }
        );

        // Deploy MilestoneNFT
        const milestoneNft = await deployer.deployContract(
            'MilestoneNFT',
            classHashes.MilestoneNFT,
            {
                owner: config.accountAddress,
                xp_tracker_contract: xpTracker.address
            }
        );

        // Deploy BakePods
        const bakePods = await deployer.deployContract(
            'BakePods',
            classHashes.BakePods,
            {
                xp_tracker_contract: xpTracker.address,
                milestone_nft_contract: milestoneNft.address
            }
        );

        console.log(chalk.green('\n✅ All contracts deployed successfully!'));
        console.log(chalk.cyan('\n📋 Deployment Summary:'));
        console.log(chalk.white(`XPTracker: ${xpTracker.address}`));
        console.log(chalk.white(`MilestoneNFT: ${milestoneNft.address}`));
        console.log(chalk.white(`BakePods: ${bakePods.address}`));

    } catch (error) {
        console.error(chalk.red('❌ Deployment failed:'), error);
        process.exit(1);
    }
}

main();