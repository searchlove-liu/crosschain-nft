
// NFTPoolLockAndRelease 在锁定NFT时(调用lockAndSendNFT)需要一个参数：目标合约(NFTPoolBurnAndMint)的地址。
// 这个函数就是获取目标合约地址
// 原因：假设，NFTPoolLockAndRelease部署在A网络，NFTPoolBurnAndMint部署在B网络，
// 在调用NFTPoolLockAndRelease合约中lockAndSendNFT，运行环境是A网络，无法在A网络的运行环境下获取B网络中NFTPoolBurnAndMint的地址。
// 我的想法：在执行NFTPoolLockAndRelease合约中的lockAndSendNFT函数之前，先执行这个函数，获取NFTPoolBurnAndMint合约的地址。
// 然后在执行lockAndSendNFT函数时，通过命令行将合约地址输入。

import { deployScript } from "#rocketh";
import { Abi_MyToken } from "#generated/abis/MyToken.js"
import { getLockAndCrossParmV1 } from "./../../scripts/utils.ts"
import { error, log } from "console"
import { networkConfig } from "./../../helper-hardhat-config.ts"
import { getContract as getViemContract, } from 'viem'
import { LinkTokenAbi } from "./abi.ts"
// import { publicClient, walletClient } from "./client.ts"
import { createPublicClient, createWalletClient, custom } from 'viem';
import { viem } from "@rocketh/viem";

// 参数：chainselector，chain selector of dest chain，
// receiver: receiver address on dest chain
// tokenid: token ID to be crossed chain
export default deployScript(
    async (env) => {
        const MyTokenDeployment = env.get<Abi_MyToken>("MyToken")
        const totalSupply = await env.read(MyTokenDeployment, {
            functionName: "totalSupply",
            args: [],
            account: env.namedAccounts.deployer
        })
        if (Number(totalSupply) == 0) {
            throw error(`totalSupply = 0,not have enough NFT of ${env.namedAccounts.deployer} .It can obtain a NFT by running 'npx hardhat deploy --tags mint-nft --network sepolia'`)
        }
        // 获取参数
        const paramenter = await getLockAndCrossParmV1(env, 0, Number(totalSupply) - 1);

        // transfer link token to address of the pool
        let linkToken = networkConfig.get(env.network.chain.id)?.linkToken as `0x${string}`;
        // log("linkToken = ", linkToken)

        // 从linktoken给 NFTPoolLockAndRelease转一笔钱。
        // 下面是获取linktoken合约的abi。无法将获取的abi赋值给getViemContract，所以下面获取abi方式失效
        // const apiKey = process.env.ETHERSCAN_API_KEY
        // // console.log(apiKey)
        // const url = `https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=${linkToken}&apikey=${apiKey}`;
        // const response = await fetch(url);
        // const linkTokenAbi = await response.json() as Abi;

        // 参考env.viem.getWritableContract()的实现
        // 1、获取钱包客户端
        const walletClient = createWalletClient({
            chain: env.network.chain,
            transport: custom(env.network.provider),
        });

        // 2、获取公共客户端
        const publicClient = createPublicClient({
            chain: env.network.chain,
            transport: custom(env.network.provider),
        });

        // 3、获取LinkToken合约实例
        const LinkTokenWritableContract = getViemContract({
            address: linkToken,
            abi: LinkTokenAbi,
            client: { public: publicClient, wallet: walletClient },
        });

        // 4、测试LinkToken实例的正确性
        // 这是查看env.namedAccounts.deployer在linkToken中的token数。
        // token可以从https://faucets.chain.link/获取
        log(await LinkTokenWritableContract.read.balanceOf([env.namedAccounts.deployer]))

        // 5、把env.namedAccounts.deployer在linkToken中的token，给

        // const NFTPoolLockAndReleaseAddress = env.get<Abi_NFTPoolLockAndRelease>("NFTPoolLockAndRelease").address;
    },
    // 在调用lockandcross之前确保NFTPoolLockAndRelease合约已经部署
    { tags: ["lockandcross"], dependencies: ["sourcechain"] }
);

// 命令：npx hardhat deploy --tags lockandcross --network sepolia
// 上述命令需要两个个参数，其中一个可以通过以下命令获取receiver：
// npx hardhat deploy--tags nftbm--network amoy
// amoy代表NFTPoolBurnAndMint部署的网络，而NFTPoolLockAndRelease部署在sepolia中，
// 所以需要在amoy的运行环境下执行npx hardhat deploy --tags nftbm --network amoy，来获取NFTPoolBurnAndMint地址
// 然后执行npx hardhat deploy --tags lockandcross --network sepolia，在sepolia运行环境下进行合约函数调用