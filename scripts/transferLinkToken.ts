import { loadEnvironmentFromHardhat } from "#rocketh";
import hre from "hardhat";
import { network } from "hardhat";
const { viem } = await network.connect();
import { getTransferLinkTokenParms } from "./utils.ts";
import { error, log } from "console";
import { networkConfig } from "./../helper-hardhat-config.ts"
import { createPublicClient, createWalletClient, custom } from 'viem';
import { getContract as getViemContract, } from 'viem'
import { LinkTokenAbi_sepolia } from './cross-chain/abi.ts'
import { ethers } from "ethers"

async function main() {

    const env = await loadEnvironmentFromHardhat({ hre });
    // const MyTokenAddr = env.deployments["MyToken"].address;
    // log("MyTokenAddr ", MyTokenAddr)
    // const MyTokenInstance = await viem.getContractAt("MyToken", MyTokenAddr)
    // const totalSupply = await MyTokenInstance.read.totalSupply()
    // console.log("The total number of mint NFT is ", totalSupply)
    // if (Number(totalSupply) == 0) {
    //     throw error(`totalSupply = 0,not have enough NFT of ${env.namedAccounts.deployer} .It can obtain a NFT by running 'npx hardhat run scripts/cross-chain/mint-nft.ts --network sepolia'`)
    // }

    // 获取参数
    const paramenter = await getTransferLinkTokenParms();

    // 从linktoken给 NFTPoolLockAndRelease转一笔钱。（为什么可以从linktoken中给NFTPoolLockAndRelease转钱）
    // const connection = await hre.network.connect();
    // const chainId = connection.networkConfig.chainId as number;
    // log("chainId ", chainId)

    const chainId = paramenter.chainId
    const linkTokenAddr = networkConfig.get(chainId)?.linkToken as `0x${string}`
    // log("linkTokenAddr ", linkTokenAddr)

    // 从linktoken给 NFTPoolBurnAndMint转一笔钱。
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
    const WritableLinkTokenInstance = getViemContract({
        address: linkTokenAddr,
        abi: LinkTokenAbi_sepolia,
        client: { public: publicClient, wallet: walletClient },
    });

    // 5、把env.namedAccounts.deployer在linkToken中的token，转给NFTPoolLockAndRelease合约一些
    // const NFTPoolBurnAndMintDeployment = env.get("NFTPoolBurnAndMint")
    // const NFTPoolBurnAndMintAddr = NFTPoolBurnAndMintDeployment.address
    // const NFTPoolBurnAndMintLinkTokenAmount_Unit = await WritableLinkTokenInstance.read.balanceOf([NFTPoolBurnAndMintAddr])
    // 参考 https://learnblockchain.cn/ethers_v5/api/utils/display-logic/
    // const NFTPoolBurnAndMintLinkTokenAmount_ETH = ethers.formatEther(NFTPoolBurnAndMintLinkTokenAmount_Unit)
    // console.log(`NFTPoolLockAndRelease with ${NFTPoolBurnAndMintAddr} LnkToken amount is ${NFTPoolBurnAndMintLinkTokenAmount_ETH}ETH.`)
    // const minimumLinkTokenAmount = 0.1
    // if (parseFloat(NFTPoolBurnAndMintLinkTokenAmount_ETH) < minimumLinkTokenAmount) {
    // console.log(`Transfer 0.1 LinkToken to ${NFTPoolBurnAndMintAddr}`)
    const tx = await WritableLinkTokenInstance.write.transfer([paramenter.to as `0x${string}`, ethers.parseEther("10")], { account: env.namedAccounts.deployer })
    console.log("交易 hash =", tx)
    // }

}

main().then().catch((error) => {
    console.error(error);
    process.exit(0);
})

// 后期执行，如果要给别人转账要修改金额
// npx hardhat run scripts/transferLinkToken.ts  --network sepolia