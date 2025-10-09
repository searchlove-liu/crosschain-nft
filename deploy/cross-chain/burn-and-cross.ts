// NFTPoolBurnAndMint 在烧掉NFT时(调用lockAndSendNFT)需要一个参数：目标合约(NFTPoolLockAndRelease)的地址。
// 假设，NFTPoolBurnAndMint 部署在A网络，NFTPoolLockAndRelease部署在B网络，
// 在调用NFTPoolBurnAndMint合约中burnAndSendNFT，运行环境是A网络，无法在A网络的运行环境下获取B网络中NFTPoolLockAndRelease的地址。
// 我的想法：在执行FTPoolBurnAndMint合约中burnAndSendNFT函数之前，先执行npx hardhat deploy --tags nftlr --network sepolia，
// 获取NFTPoolBurnAndMint合约的地址。然后在当前脚本时，通过命令行将合约地址输入。
import { deployScript } from "#rocketh";
import { Abi_WrappedMyToken } from "#generated/abis/WrappedMyToken.js"
import { getBurnAndCrossParmV1 } from "./../../scripts/utils.ts"
import { error, log } from "console"
import { networkConfig } from "./../../helper-hardhat-config.ts"
import { getContract as getViemContract, } from 'viem'
import { LinkTokenAbi_amoy } from "./abi.ts"
import { createPublicClient, createWalletClient, custom } from 'viem';
import { ethers } from "ethers"

// 参数：chainselector，chain selector of dest chain，
// receiver: receiver address on dest chain
// tokenid: token ID to be crossed chain
export default deployScript(
    async (env) => {
        const deployer = env.namedAccounts.deployer
        const WrappedMyTokenDeployment = env.get<Abi_WrappedMyToken>("WrappedMyToken")
        const totalSupply = await env.read(WrappedMyTokenDeployment, {
            functionName: "totalSupply",
            args: [],
            account: deployer
        })
        if (Number(totalSupply) == 0) {
            throw error(`totalSupply = 0,not have enough NFT of ${env.namedAccounts.deployer} .It can obtain a NFT by running 'npx hardhat deploy --tags mint-nft --network sepolia'`)
        }
        // 这里根据TokenIndex获取TokenId
        let TokenIndex: bigint = 0n
        let TokenIds: bigint[] = []
        for (; TokenIndex < totalSupply; TokenIndex++) {
            // 通过TokenIndex获取对应的TokenId
            // console.log("TokenIndex = ", TokenIndex)
            TokenIds[Number(TokenIndex)] = await env.read(WrappedMyTokenDeployment, { functionName: "tokenByIndex", args: [TokenIndex] })
            // 通过TokenId获取对应的owner
            console.log(`TokenId of the Token with index "${TokenIndex}" is "${TokenIds[Number(TokenIndex)]}"`)
        }

        // 获取参数
        const paramenter = await getBurnAndCrossParmV1(env, TokenIds);

        // transfer link token to address of the pool
        let linkToken = networkConfig.get(env.network.chain.id)?.linkToken as `0x${string}`;
        log("linkToken = ", linkToken)

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
            address: linkToken,
            abi: LinkTokenAbi_amoy,
            client: { public: publicClient, wallet: walletClient },
        });

        // 4、测试LinkToken实例的正确性
        // 这是查看env.namedAccounts.deployer在linkToken中的token数。
        // token可以从https://faucets.chain.link/获取
        log(`Deployer ${env.namedAccounts.deployer} linkToken amount is ${ethers.formatEther(await WritableLinkTokenInstance.read.balanceOf([env.namedAccounts.deployer]))}ETH`)

        // 5、把env.namedAccounts.deployer在linkToken中的token，转给NFTPoolLockAndRelease合约一些
        const NFTPoolBurnAndMintDeployment = env.get("NFTPoolBurnAndMint")
        const NFTPoolBurnAndMintAddr = NFTPoolBurnAndMintDeployment.address
        const NFTPoolBurnAndMintLinkTokenAmount_Unit = await WritableLinkTokenInstance.read.balanceOf([NFTPoolBurnAndMintAddr])
        // 参考 https://learnblockchain.cn/ethers_v5/api/utils/display-logic/
        const NFTPoolBurnAndMintLinkTokenAmount_ETH = ethers.formatEther(NFTPoolBurnAndMintLinkTokenAmount_Unit)
        console.log(`NFTPoolLockAndRelease with ${NFTPoolBurnAndMintAddr} LnkToken amount is ${NFTPoolBurnAndMintLinkTokenAmount_ETH}ETH.`)
        const minimumLinkTokenAmount = 0.1
        if (parseFloat(NFTPoolBurnAndMintLinkTokenAmount_ETH) < minimumLinkTokenAmount) {
            console.log(`Transfer 0.1 LinkToken to ${NFTPoolBurnAndMintAddr}`)
            await WritableLinkTokenInstance.write.transfer([NFTPoolBurnAndMintAddr, ethers.parseEther("0.1")], { account: deployer })
        }

        // Mytoken给NFTPoolLockAndRelease授权处理MyToken合约中的NFT
        await env.execute(WrappedMyTokenDeployment, {
            functionName: "approve",
            args: [NFTPoolBurnAndMintAddr, paramenter.tokeId],
            account: deployer
        })

        // 将目标NFT转移给NFTPoolBurnAndMint合约,在源链(sepolia),由NFTPoolLockAndRelease释放NFT,所以需要NFTPoolLockAndRelease地址.
        // 因为NFTPoolLockAndRelease部署在sepolia网络，执行当前脚本的网络是在amoy，在调用get时，智能获取deployment/amoy中的deploymemnt
        // 无法获取deployment/sepolia中的deployment，所以通过下面方式无法获取NFTPoolLockAndRelease合约的地址
        // const NFTPoolLockAndReleaseAddr = env.get("NFTPoolLockAndRelease").address
        // console.log("NFTPoolLockAndReleaseAddr = ", NFTPoolLockAndReleaseAddr)

        // 获取转移之前NFT的原所有者
        let owner = await env.read(WrappedMyTokenDeployment, {
            functionName: "ownerOf",
            args: [paramenter.tokeId],
            account: deployer
        })

        console.log(`Before lock-and-send-NFT,owner of NFT with index ${paramenter.tokeId} is ${owner}.`)

        const BurnAndSendNFTTx = await env.execute(NFTPoolBurnAndMintDeployment, {
            functionName: "burnAndSendNFT",
            // uint256 tokenId,address newOwner,uint64 chainSelector,address receiver
            // args: [paramenter.tokeId, env.namedAccounts.deployer, paramenter.chainselector,NFTPoolBurnAndMintAddr ],
            args: [paramenter.tokeId, deployer, paramenter.chainselector, paramenter.receiver],
            account: deployer
        })

        console.log(`CCIP transaction is sent, the transaction is ${BurnAndSendNFTTx.transactionHash}`)

        // // CCIP交易发送之后需要等待几分钟，才可以被确认，所以下面代码在交易发送之后调用，就会报错。可以等待6个区块，如下。
        // // 但等待事件过长，下面代码就不执行了。交易确认情况可以查看：https://ccip.chain.link/
        // // 等待Status变为Success之后，使用npx hardhat deploy --tags checknft --network sepolia
        // publicClient.waitForTransactionReceipt(
        //     {
        //         confirmations: 5,
        //         hash: BurnAndSendNFTTx.transactionHash
        //     }
        // )
        // // 获取转移之后NFT的新所有者
        // owner = await env.read(WrappedMyTokenDeployment, {
        //     functionName: "ownerOf",
        //     args: [paramenter.tokeId],
        //     account: deployer
        // })
        // // console.log(`After lock-and-send-NFT,owner of NFT with index ${paramenter.tokeId} is ${owner}`)
    },
    // 在调用burnandcross之前确保NFTPoolBurnAndMint合约已经部署
    { tags: ["burnandcross"], dependencies: ["destchain"] }
);

// 命令：npx hardhat deploy --tags burnandcross --network amoy
// 上述命令需要两个个参数，其中一个可以通过以下命令获取receiver：
// npx hardhat deploy --tags nftlr --network sepolia
// sepolia 代表NFTPoolLockAndRelease部署的网络，而NFTPoolBurnAndMint部署在amoy中，
// 所以需要在sepolia的运行环境下执行:
// npx hardhat deploy --tags nftlr --network sepolia
// 来获取NFTPoolLockAndRelease地址
// 然后执行:
// npx hardhat deploy --tags burnandcross --network amoy
// 在sepolia运行环境下进行NFTPoolBurnAndMint合约函数调用