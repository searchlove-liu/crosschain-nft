// NFTPoolLockAndRelease 在锁定NFT时(调用lockAndSendNFT)需要一个参数：目标合约(NFTPoolBurnAndMint)的地址。
// 这个函数就是获取目标合约地址
// 原因：假设，NFTPoolLockAndRelease部署在A网络，NFTPoolBurnAndMint部署在B网络，
// 在调用NFTPoolLockAndRelease合约中lockAndSendNFT，运行环境是A网络，无法在A网络的运行环境下获取B网络中NFTPoolBurnAndMint的地址。
// 我的想法：在执行NFTPoolLockAndRelease合约中的lockAndSendNFT函数之前，先执行这个函数，获取NFTPoolBurnAndMint合约的地址。
// 然后在执行lockAndSendNFT函数时，通过命令行将合约地址输入。

import { deployScript } from "#rocketh";
import { Abi_NFTPoolBurnAndMint } from "#generated/abis/NFTPoolBurnAndMint.js"

export default deployScript(
    async (env) => {
        const NFTPoolBurnAndMintdeployment = env.get<Abi_NFTPoolBurnAndMint>("NFTPoolBurnAndMint")
        console.log("receiver address : ", NFTPoolBurnAndMintdeployment.address)
    },
    // dependencies，保证获取这个地址之前，这个合约被部署，如果没有部署，就会去部署
    { tags: ["nftbm"], dependencies: ["destchain"] }


);

// npx hardhat deploy --tags nftbm --network amoy
