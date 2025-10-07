import { loadEnvironmentFromHardhat } from "#rocketh";
import hre from "hardhat";
import { network } from "hardhat";
const { viem } = await network.connect();
import { getLockAndCrossParmV2 } from "../utils.ts";
import { error, log } from "console";
import { networkConfig } from "./../../helper-hardhat-config.ts"
import type { KeyedClient, GetContractAtConfig } from "@nomicfoundation/hardhat-viem/types"
import { getContract } from 'viem'
import { LinkTokenAbi } from './abi.ts'
import { publicClient, walletClient } from './client.ts'

async function main() {
    const env = await loadEnvironmentFromHardhat({ hre });
    const MyTokenAddr = env.deployments["MyToken"].address;
    log("MyTokenAddr ", MyTokenAddr)
    const MyTokenInstance = await viem.getContractAt("MyToken", MyTokenAddr)
    const totalSupply = await MyTokenInstance.read.totalSupply()
    // console.log("The total number of mint NFT is ", totalSupply)
    if (Number(totalSupply) == 0) {
        throw error(`totalSupply = 0,not have enough NFT of ${env.namedAccounts.deployer} .It can obtain a NFT by running 'npx hardhat run scripts/cross-chain/mint-nft.ts --network sepolia'`)
    }

    // 获取参数
    const paramenter = await getLockAndCrossParmV2(env, 0, Number(totalSupply) - 1);

    // 从linktoken给 NFTPoolLockAndRelease转一笔钱。（为什么可以从linktoken中给NFTPoolLockAndRelease转钱）
    const connection = await hre.network.connect();
    const chainId = connection.networkConfig.chainId as number;
    log("chainId ", chainId)
    const linkTokenAddr = networkConfig.get(chainId)?.linkToken as `0x${string}`
    log("linkTokenAddr ", linkTokenAddr)

    const KeyedClientInsstance: KeyedClient = {
        wallet: walletClient,
        public: publicClient
    }
    const config: GetContractAtConfig = {
        client: KeyedClientInsstance
    }

    // 1. Create contract instance
    const contract = getContract({
        abi: LinkTokenAbi,
        address: linkTokenAddr,
        client: {
            public: publicClient,
            wallet: walletClient,
        }
    })
    // log(await contract.read.balanceOf([env.namedAccounts.deployer]))
    // log("linkTokenInstance.address ", linkTokenInstance.address)


    // networkConfig.get()
}

main()

// npx hardhat run scripts/cross-chain/lock-and-cross.ts --network sepolia