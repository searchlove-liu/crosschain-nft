import { verifyContract } from "@nomicfoundation/hardhat-verify/verify";
import hre from "hardhat";
import { networkConfig1, networkConfig } from "../helper-hardhat-config.ts"
import inquirer from 'inquirer';
import type { EnhancedEnvironment } from "rocketh"
import { Abi_NFTPoolBurnAndMint } from "#generated/abis/NFTPoolBurnAndMint.js"

// npx node ./scripts/utils.ts
// ts脚本运行时，输入数据案例
// interactiveScript();
async function interactiveScript() {
    console.log('智能合约部署脚本');

    // 暂停并获取多个输入
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'network',
            message: '选择部署网络:',
            choices: [
                { name: '以太坊主网', value: 'mainnet' },
                { name: 'Polygon Amoy测试网', value: 'polygon-amoy' },
                { name: '本地开发网', value: 'localhost' }
            ],
            default: 'polygon-amoy'
        },
        {
            type: 'input',
            name: 'contractName',
            message: '输入合约名称:',
            validate: (input: string) => input ? true : '合约名称不能为空'
        },
        {
            type: 'number',
            name: 'initialSupply',
            message: '输入初始供应量:',
            validate: (input) => Number(input) > 0 || '供应量必须大于0'
        },
        {
            type: 'confirm',
            name: 'confirmDeploy',
            message: '确认部署合约?',
            default: false
        },

    ]);

    if (!answers.confirmDeploy) {
        console.log('部署已取消');
        return;
    }

    console.log('开始部署合约...');
    console.log('网络:', answers.network);
    console.log('合约名称:', answers.contractName);
    console.log('初始供应量:', answers.initialSupply);
    // 这里添加实际的部署逻辑
    // await deployContract(answers);
}

interface lockAndCrossParms {
    chainselector: string,
    receiver: string,
    tokeId: bigint,
}

// get parameters of deploy/cross-chain/lock-and-cross.ts参数
// 这个函数的作用：从外部获取代码执行时需要的参数
// getLockAndCrossParmV1和getLockAndCrossParmV2的不同：在获取第一个参数是，如果终端输入为空，提示获取这个参数的命令不同，
// 两个命令都可以获取这个参数。只是刚开始准备完全使用hardhat-deploy进行跨链，所以相关代码放在deploy/cross-chain中，
// getLockAndCrossParmV1就是在deploy/cross-chain/lock-and-cross.ts中被调用。
// 后来失败，转用一般脚本，代码在script/cross-chain中，getLockAndCrossParmV2是在script/cross-chain/lock-and-cross.ts中被调用。

// params:可以处理id的范围tokenidStart---tokenIdEnd
export async function getLockAndCrossParmV1(env: EnhancedEnvironment, tokenidStart: number, tokenIdEnd: number): Promise<lockAndCrossParms> {
    // 参数：chainselector，chain selector of dest chain
    //  receiver: receiver address on dest chain（NFTPoolBurnAndMint address）
    //  tokenid: token ID to be crossed chain

    let parameter: lockAndCrossParms = {
        chainselector: "",
        receiver: "",
        tokeId: 0n
    }
    const tokenIdMessage = `Token ID to be crossed chain. Within the range of  ${tokenidStart} to ${tokenIdEnd}:`
    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "receiver",
            message: "Receiver address on dest chain(NFTPoolBurnAndMint address),it can be obtained by running `npx hardhat deploy --tags nftbmAddr --network amoy': ",
            validate: (input: string) =>
                (input.length !== 0 && input.trim().length !== 0) || "Receiver(NFTPoolBurnAndMint address) is necessary ,it can be obtained by running `npx hardhat deploy --tags nftbmAddr --network amoy'"
        },
        {
            type: "number",
            name: "tokenid",
            message: tokenIdMessage,
            validate: (input) => (
                // [(tokenidStart-1),(tokenidEnd+1)] = [tokenidStart,tokenidEnd]
                Number(input) >= tokenidStart &&
                Number(input) <= tokenIdEnd) ||
                `tokenid must be within the range of ${tokenidStart} to ${tokenIdEnd}`
        }
    ])

    parameter.chainselector = networkConfig.get(env.network.chain.id)?.companionChainSelector as string
    parameter.receiver = answers.receiver
    parameter.tokeId = answers.tokenid;
    return parameter
}

interface BurnAndCrossParms {
    chainselector: string,
    receiver: string,
    tokeId: bigint,
}
// get parameters of deploy/cross-chain/burn-and-cross.ts参数
// 这个函数的作用：从外部获取代码执行时需要的参数
// params:可以处理id的范围tokenidStart---tokenIdEnd
export async function getBurnAndCrossParmV1(env: EnhancedEnvironment, TokenIds: bigint[]): Promise<BurnAndCrossParms> {
    let parameter: BurnAndCrossParms = {
        // chainselector，chain selector of dest chain
        chainselector: "",
        //  receiver: receiver address on dest chain(NFTPoolLockAndRelease address)
        receiver: "",
        //  tokenid: token ID to be crossed chain
        tokeId: 0n
    }
    const tokenIdMessage = `Token ID to be crossed chain. Within the range of  ${TokenIds}:`
    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "receiver",
            message: "Receiver address on source chain(NFTPoolLockAndRelease address),it can obtained by running `npx hardhat deploy --tags nftlrAddr --network sepolia':",
            validate: (input: string) =>
                (input.length !== 0 && input.trim().length !== 0) || "Receiver(NFTPoolLockAndRelease address) is necessary ,it can obtained by running `npx hardhat deploy --tags nftlrAddr --network sepolia'"
        },
        {
            type: "number",
            name: "tokenid",
            message: tokenIdMessage,
            validate: (input) =>
                // 查看输入值是否存在于TokenIds中
                TokenIds.includes(BigInt(input as number)) ||
                `tokenid must be within the range of ${TokenIds}`
        }
    ])

    parameter.chainselector = networkConfig.get(env.network.chain.id)?.companionChainSelector as string
    parameter.receiver = answers.receiver
    parameter.tokeId = answers.tokenid;
    return parameter
}

// get parameters of scripts/cross-chain/lock-and-cross.ts
// 这个函数的作用：从外部获取代码执行时需要的参数
// getLockAndCrossParmV1和getLockAndCrossParmV2的不同：在获取第一个参数是，如果终端输入为空，提示获取这个参数的命令不同，
// 两个命令都可以获取这个参数。只是刚开始准备完全使用hardhat-deploy进行跨链，所以相关代码放在deploy/cross-chain中，
// getLockAndCrossParmV1就是在deploy/cross-chain/lock-and-cross.ts中被调用。
// 后来失败，转用一般脚本，代码在script/cross-chain中，getLockAndCrossParmV2是在script/cross-chain/lock-and-cross.ts中被调用。

// params:可以处理id的范围tokenidStart---tokenIdEnd
export async function getLockAndCrossParmV2(env: EnhancedEnvironment, tokenidStart: number, tokenIdEnd: number): Promise<lockAndCrossParms> {
    // 参数：chainselector，chain selector of dest chain
    //  receiver: receiver address on dest chain(NFTPoolBurnAndMint address)
    //  tokenid: token ID to be crossed chain

    let parameter: lockAndCrossParms = {
        chainselector: "",
        receiver: "",
        tokeId: 0n
    }
    const tokenIdMessage = `Token ID to be crossed chain. Within the range of  ${tokenidStart} to ${tokenIdEnd}:`
    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "receiver",
            message: "Receiver address(NFTPoolLockAndRelease address) on dest chain:",
            validate: (input: string) =>
                (input.length !== 0 && input.trim().length !== 0) || "Receiver is necessary ,it can obtained by running `npx hardhat run scripts/cross-chain/NFTPoolBurnAndMintAddr.ts --network amoy'"
        },
        {
            type: "number",
            name: "tokenid",
            message: tokenIdMessage,
            validate: (input) => (
                // [(tokenidStart-1),(tokenidEnd+1)] = [tokenidStart,tokenidEnd]
                Number(input) >= tokenidStart &&
                Number(input) <= tokenIdEnd) ||
                `tokenid must be within the range of ${tokenidStart} to ${tokenIdEnd}`
        }
    ])

    parameter.chainselector = networkConfig.get(env.network.chain.id)?.companionChainSelector as string
    parameter.receiver = answers.receiver
    parameter.tokeId = answers.tokenid;
    return parameter
}

export function getNetworkName(chainId: number): string {
    // 获取部署的网络
    let networkName: string | undefined;
    networkName = networkConfig1.get(Number(chainId))
    // 断言是否为undefined，如果需要连接的网络在networkConfig不存在，返回undefined。
    if (networkName as undefined === undefined) {
        let errorData = "The network  is\"" + networkName + "\"" + "not defined in your helper-hardhat-config.ts";
        throw new Error(errorData);
    } else {
        networkName = networkName as string;
        return networkName;
    }
}

// 直接从hardhat运行时环境中获取链id，然后获取对应网络名
export async function getNetworkNameV2(): Promise<string> {
    // 获取部署的网络
    const connection = await hre.network.connect();
    const chainId = connection.networkConfig.chainId;
    let networkName: string | undefined;
    networkName = networkConfig1.get(Number(chainId))
    // 断言是否为undefined，如果需要连接的网络在networkConfig不存在，返回undefined。
    if (networkName as undefined === undefined) {
        let errorData = "The network  is\"" + networkName + "\"" + "not defined in your helper-hardhat-config.ts";
        throw new Error(errorData);
    } else {
        networkName = networkName as string;
        return networkName;
    }
}

// 验证合约
export async function verifyMyToken(deployedAddress: string, TokenName: string, TokenSymble: string) {
    verifyContract(
        {
            address: deployedAddress,
            constructorArgs: [TokenName, TokenSymble],
            provider: "etherscan", // or "blockscout" for Blockscout-compatible explorers
        },
        hre,
    );

}