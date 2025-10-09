// NFTPoolBurnAndMint 在烧掉NFT时(调用lockAndSendNFT)需要一个参数：目标合约(NFTPoolLockAndRelease)的地址。
// 假设，NFTPoolBurnAndMint 部署在A网络，NFTPoolLockAndRelease部署在B网络，
// 在调用NFTPoolBurnAndMint合约中burnAndSendNFT，运行环境是A网络，无法在A网络的运行环境下获取B网络中NFTPoolLockAndRelease的地址。
// 我的想法：在执行FTPoolBurnAndMint合约中burnAndSendNFT函数之前，先执行npx hardhat deploy --tags nftlr --network sepolia，
// 获取NFTPoolBurnAndMint合约的地址。然后在调用NFTPoolBurnAndMint合约中burnAndSendNFT，通过命令行将合约地址输入。

import { deployScript } from "#rocketh";
import { Abi_NFTPoolLockAndRelease } from "#generated/abis/NFTPoolLockAndRelease.js"

export default deployScript(
    async (env) => {
        const NFTPoolLockAndReleasedeployment = env.get<Abi_NFTPoolLockAndRelease>("NFTPoolLockAndRelease")
        console.log("receiver address : ", NFTPoolLockAndReleasedeployment.address)
    },
    // dependencies，保证获取这个地址之前，这个合约被部署，如果没有部署，就会去部署
    { tags: ["nftlrAddr"], dependencies: ["sourcechain"] }

);

// npx hardhat deploy --tags nftlrAddr --network sepolia
