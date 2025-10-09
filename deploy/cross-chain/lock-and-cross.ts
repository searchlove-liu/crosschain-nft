
// NFTPoolLockAndRelease 在锁定NFT时(调用lockAndSendNFT)需要一个参数：目标合约(NFTPoolBurnAndMint)的地址。
// 假设，NFTPoolLockAndRelease部署在A网络，NFTPoolBurnAndMint部署在B网络，
// 在调用NFTPoolLockAndRelease合约中lockAndSendNFT，运行环境是A网络，无法在A网络的运行环境下获取B网络中NFTPoolBurnAndMint的地址。
// 我的想法：在执行NFTPoolLockAndRelease合约中的lockAndSendNFT函数之前，先执行npx hardhat deploy --tags nftbm --network amoy，
// 获取NFTPoolBurnAndMint合约的地址。然后在当前脚本时，通过命令行将合约地址输入。

import { deployScript } from "#rocketh";
import { Abi_MyToken } from "#generated/abis/MyToken.js"
import { getLockAndCrossParmV1 } from "./../../scripts/utils.ts"
import { error, log } from "console"
import { networkConfig } from "./../../helper-hardhat-config.ts"
import { getContract as getViemContract, } from 'viem'
import { LinkTokenAbi_sepolia } from "./abi.ts"
import { createPublicClient, createWalletClient, custom } from 'viem';
import { ethers } from "ethers"

// 参数：chainselector，chain selector of dest chain，
// receiver: receiver address on dest chain
// tokenid: token ID to be crossed chain
export default deployScript(
    async (env) => {
        const deployer = env.namedAccounts.deployer
        const MyTokenDeployment = env.get<Abi_MyToken>("MyToken")
        const totalSupply = await env.read(MyTokenDeployment, {
            functionName: "totalSupply",
            args: [],
            account: deployer
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
        const WritableLinkTokenInstance = getViemContract({
            address: linkToken,
            abi: LinkTokenAbi_sepolia,
            client: { public: publicClient, wallet: walletClient },
        });

        // 4、测试LinkToken实例的正确性
        // 这是查看env.namedAccounts.deployer在linkToken中的token数。
        // token可以从https://faucets.chain.link/获取
        log(`Deployer ${env.namedAccounts.deployer} linkToken amount is ${ethers.formatEther(await WritableLinkTokenInstance.read.balanceOf([env.namedAccounts.deployer]))}ETH`)

        // 5、把env.namedAccounts.deployer在linkToken中的token，转给NFTPoolLockAndRelease合约一些
        const NFTPoolLockAndReleaseDeployment = env.get("NFTPoolLockAndRelease")
        const NFTPoolLockAndReleaseAddr = NFTPoolLockAndReleaseDeployment.address
        const NFTPoolLockAndReleaseLinkTokenAmountUnit = await WritableLinkTokenInstance.read.balanceOf([NFTPoolLockAndReleaseAddr])
        // 参考 https://learnblockchain.cn/ethers_v5/api/utils/display-logic/
        const NFTPoolLockAndReleaseLinkTokenAmountETH = ethers.formatEther(NFTPoolLockAndReleaseLinkTokenAmountUnit)
        console.log(`NFTPoolLockAndRelease with ${NFTPoolLockAndReleaseAddr} LnkToken amount is ${NFTPoolLockAndReleaseLinkTokenAmountETH}ETH.`)
        const minimumLinkTokenAmount = 0.1
        if (parseFloat(NFTPoolLockAndReleaseLinkTokenAmountETH) < minimumLinkTokenAmount) {
            console.log(`Transfer 0.1 LinkToken to ${NFTPoolLockAndReleaseAddr}`)
            await WritableLinkTokenInstance.write.transfer([NFTPoolLockAndReleaseAddr, ethers.parseEther("0.1")], { account: deployer })
        }

        // Mytoken给NFTPoolLockAndRelease授权处理MyToken合约中的NFT
        await env.execute(MyTokenDeployment, {
            functionName: "approve",
            args: [NFTPoolLockAndReleaseAddr, paramenter.tokeId],
            account: deployer
        })

        // 将目标NFT转移给NFTPoolLockAndRelease合约,在目标链,由NFTPoolBurnAndMint合约生成wrappedNFT,给namedAccounts.deployer,
        // 所以需要NFTPoolBurnAndMint合约地址.
        // 因为NFTPoolBurnAndMint部署在amoy网络，执行当前脚本的网络是在sepolia，在调用get时，智能获取deployment/sepolia中的deploymemnt
        // 无法获取deployment/amoy中的deployment，所以通过下面方式无法获取NFTPoolBurnAndMint合约的地址
        // const NFTPoolBurnAndMintAddr = env.get("NFTPoolBurnAndMint").address
        // console.log("NFTPoolBurnAndMintAddr = ", NFTPoolBurnAndMintAddr)

        // 获取转移NFT的原所有者
        let owner = await env.read(MyTokenDeployment, {
            functionName: "ownerOf",
            args: [paramenter.tokeId],
            account: deployer
        })

        console.log(`Before lock-and-send-NFT,owner of NFT with index ${paramenter.tokeId} is ${owner}.`)

        const lockAndSendNFTTx = await env.execute(NFTPoolLockAndReleaseDeployment, {
            functionName: "lockAndSendNFT",
            // uint256 tokenId,address newOwner,uint64 chainSelector,address receiver
            // args: [paramenter.tokeId, env.namedAccounts.deployer, paramenter.chainselector,NFTPoolBurnAndMintAddr ],
            args: [
                paramenter.tokeId,
                // newOwner
                env.namedAccounts.deployer,
                paramenter.chainselector,
                // NFTPoolBurnAndMint合约地址，在这个案例中，这个合约部署在amoy网络
                paramenter.receiver
            ],
            account: deployer
        })

        console.log(`CCIP transaction is sent, the transaction is ${lockAndSendNFTTx.transactionHash}`)
        // CCIP交易发送之后需要等待几分钟，才可以被确认，所以下面代码在交易发送之后调用，就会报错。可以等待6个区块，如下。
        // 但等待事件过长，下面代码就不执行了。交易确认情况可以查看：https://ccip.chain.link/
        // 确认之后使用npx hardhat deploy --tags checkwnft --network amoy
        // publicClient.waitForTransactionReceipt(
        //     {
        //         confirmations: 5,
        //         hash: lockAndSendNFTTx.transactionHash
        //     }
        // )
        // // 获取转移NFT的原所有者
        // owner = await env.read(MyTokenDeployment, {
        //     functionName: "ownerOf",
        //     args: [paramenter.tokeId],
        //     account: deployer
        // })
        // console.log(`After lock-and-send-NFT,owner of NFT with index ${paramenter.tokeId} is ${owner}`)

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