import { verifyContract } from "@nomicfoundation/hardhat-verify/verify";
import hre from "hardhat";
import { networkConfig } from "../helper-hardhat-config.ts"

export async function getNetworkName(): Promise<string> {
    // 获取部署的网络
    // process.argv[0] 是 Node.js 可执行文件的路径
    // process.argv[1] 是该脚本文件的路径
    // 从 process.argv[2] 开始是用户传入的参数,获取从process.argv[2]传入的参数
    const connection = await hre.network.connect();
    const chainId = connection.networkConfig.chainId;
    let networkName: string | undefined;
    networkName = networkConfig.get(Number(chainId))
    // 断言是否为undefined，如果需要连接的网络在networkConfig不存在，返回undefined。
    if (networkName as undefined === undefined) {
        let errorData = "The network  is\"" + networkName + "\"" + "not defined in your helper-hardhat-config.ts";
        throw new Error(errorData);
    } else {
        networkName = networkName as string;
        return networkName;
    }
}

// ethConnect必须传递过去，如果使用不一样的ethers，在本地网络创建的合约，将不再同一个网络
// ethers在主调函数中的来源：
// import { network } from "hardhat";
// const { ethers, networkHelpers } = await network.connect();
export async function getDataFeed(ethers: HardhatEthers): Promise<string> {
    let dataFeedAddr: string | undefined;
    let networkName = await getNetworkName();
    if (networkName === "hardhat") {
        // 本地网络，创建mock合约，返回地址
        const mock = await ethers.deployContract("MyMockV3Aggregator", [DECIMALS, INITIAL_ANSWER]);
        // console.log("在本地网络部署FundMe，需要部署mock合约。已部署mock合约地址：", mock.target);
        return String(mock.target);
    } else {
        // console.log("mock contract deployment is skipped")
        dataFeedAddr = dataFeedAddrNetworkMap.get(networkName);
        // 断言是否为undefined，如果需要连接的网络在networkConfig不存在，返回undefined。
        if (dataFeedAddr as undefined === undefined) {
            let errorData = "The network  is\"" + networkName + "\"" + "not defined in your helper-hardhat-config.ts";
            throw new Error(errorData);
        } else {
            // 断言dataFeedAddr为string，所以可以直接返回
            dataFeedAddr = dataFeedAddr as string;
            return dataFeedAddr;
        }
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