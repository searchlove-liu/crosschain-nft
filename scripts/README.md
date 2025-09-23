#### sepolia部署并验证合约
```shell
npx hardhat run --build-profile default scripts/deploy_MyToken.ts --network sepolia
```
#### 使用hardhat-deploy部署合约脚本
``` typescript
// we import what we need from the #rocketh alias, see ../rocketh.ts
import { deployScript, artifacts, loadEnvironmentFromHardhat } from "#rocketh";

// 参考rocketh：https://github.com/wighawag/rocketh
// 使用Deployment with Dependencies
export default deployScript(
    async ({ deploy, namedAccounts, get, viem, deployments }) => {
        const { deployer } = namedAccounts;
        // 通过下面方式也可以获取地址
        // const NFTAddress = deployments["FundMe"].address
        const NFTAddress = get("MyToken").address;
        // const mockInstance = viem.getContract("MyCCIPLocalSimulator");
        const mockInstance = viem.getWritableContract("MyCCIPLocalSimulator");
        const returnData = await mockInstance.read.configuration();
        const ccipConfig = returnData as any[];

        const sourceRouter = ccipConfig[1];
        const linkToken = ccipConfig[4];

        await deploy("NFTPoolLockAndRelease", {
            account: deployer,
            artifact: artifacts.NFTPoolLockAndRelease,
            // address _router,
            // address _link,
            // address NFTAddress
            args: [sourceRouter, linkToken, NFTAddress],
        });
    },
    // finally you can pass tags and dependencies
    // - **Dependencies**: Tags that a deploy script depends on, ensuring those scripts are executed first.
    // 下面dependencies中是tags，它代表本次部署，下面tags对应合约必须部署。如果没有部署，会进行部署。
    { tags: ["all", "nftpoollr"], dependencies: ['mytoken', "mycciplocalsimulator"] }
);
```

#### 本地部署并验证合约
``` shell
npx hardhat node
npx hardhat run scripts/deploy_MyToken.ts --network localhost
```


