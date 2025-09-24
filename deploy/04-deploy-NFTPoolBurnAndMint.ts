// we import what we need from the #rocketh alias, see ../rocketh.ts
import { deployScript, artifacts } from "#rocketh";

// 参考rocketh：https://github.com/wighawag/rocketh
// 使用Deployment with Dependencies
export default deployScript(
    async ({ deploy, namedAccounts, get, viem }) => {
        const { deployer } = namedAccounts;
        // 通过下面方式也可以获取地址
        // const NFTAddress = deployments["FundMe"].address
        const WNFTAddress = get("WrappedMyToken").address;
        // const mockInstance = viem.getContract("MyCCIPLocalSimulator");
        const mockInstance = viem.getWritableContract("MyCCIPLocalSimulator");
        const returnData = await mockInstance.read.configuration();
        const ccipConfig = returnData as any[];

        const destinationRouter = ccipConfig[2];
        const linkToken = ccipConfig[4];

        await deploy("NFTPoolBurnAndMint", {
            account: deployer,
            artifact: artifacts.NFTPoolBurnAndMint,
            // uint64 _destinationChainSelector,
            // address _receiver,
            // bytes memory _text
            args: [destinationRouter, linkToken, WNFTAddress],
        });
    },
    // finally you can pass tags and dependencies
    // - **Dependencies**: Tags that a deploy script depends on, ensuring those scripts are executed first.
    // 下面dependencies中是tags，它代表本次部署，下面tags对应合约必须部署。如果没有部署，会进行部署。
    // destchain只是代表这个脚本部署,也会部署依赖的两个合约，后面tag，"all"代表部署NFTPoolBurnAndMint和NFTPoolLockAndRelease
    { tags: ["destchain", "all"], dependencies: ['wnft', "mycciplocalsimulator"] }
);

// npx hardhat deploy --tags destchain --network localhost