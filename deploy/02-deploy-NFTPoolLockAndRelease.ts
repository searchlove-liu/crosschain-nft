// we import what we need from the #rocketh alias, see ../rocketh.ts
import { deployScript, artifacts } from "#rocketh";
import { GasCostPlugin } from "ethers";
import { developmentChains, networkConfig } from "./../helper-hardhat-config.ts"

// 参考rocketh：https://github.com/wighawag/rocketh
// 使用Deployment with Dependencies
export default deployScript(
    async ({ deploy, namedAccounts, get, viem, deployments }) => {
        // 通过下面两种方式都可以获取地址
        // const NFTAddress = deployments["FundMe"].address
        const NFTAddress = get("MyToken").address;
        const { deployer } = namedAccounts;

        let sourceRouter
        let linkToken
        const chainId = await viem.publicClient.getChainId()
        if (developmentChains.includes(chainId)) {
            const mockInstance = viem.getContract("MyCCIPLocalSimulator");
            const returnData = await mockInstance.read.configuration();
            let ccipConfig = returnData as any[];
            sourceRouter = ccipConfig[1];
            linkToken = ccipConfig[4];
        } else {
            sourceRouter = networkConfig.get(chainId)?.router
            linkToken = networkConfig.get(chainId)?.linkToken
        }

        await deploy("NFTPoolLockAndRelease", {
            account: deployer,
            artifact: artifacts.NFTPoolLockAndRelease,
            // address _router,address _link,address NFTAddress
            args: [sourceRouter, linkToken, NFTAddress],
        },);
    },
    // finally you can pass tags and dependencies
    // - **Dependencies**: Tags that a deploy script depends on, ensuring those scripts are executed first.
    // 下面dependencies中是tags，它代表本次部署，下面tags对应合约必须部署。如果没有部署，会进行部署。
    // sourcechain只是代表这个脚本部署,也会部署依赖的两个合约，后面tag--"all"代表部署NFTPoolBurnAndMint和NFTPoolLockAndRelease
    { tags: ["sourcechain", "all"], dependencies: ['mytoken', "mycciplocalsimulator"] }
);

// npx hardhat deploy --tags sourcechain --network localhost