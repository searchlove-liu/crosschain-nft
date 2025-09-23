// 需要插件@nomicfoundation/hardhat-toolbox-mocha-ethers
import { network } from "hardhat";
import { TOKEN_NAME, TOKEN_SYMBLE, CONFIRMATIONS } from "../helper-hardhat-config.ts";
import { getNetworkName, verifyMyToken } from "./utils.ts"
const { viem } = await network.connect();

// npx hardhat run scripts/deploy_NFTPoolLockAndRelease.ts --network localhost
async function main() {
    const CCIPLocalSimulator = await viem.deployContract("MyCCIPLocalSimulator");
    const CCIPExample = await viem.getContractAt("MyCCIPLocalSimulator", CCIPLocalSimulator.address);
    const ccipConfig = await CCIPExample.read.configuration();

    const sourceRouter = ccipConfig[1];
    // 简化，目标链的linkTokenAddr和源链的linkTokenAddr设为一样。
    const linkToken = ccipConfig[4];

    const MyToken = await viem.deployContract("MyToken", [TOKEN_NAME, TOKEN_SYMBLE]);
    const nftAddr = MyToken.address;

    // address _router,address _link,address NFTAddress
    const NFTPoolLockAndRelease = await viem.deployContract("NFTPoolLockAndRelease", [sourceRouter, linkToken, nftAddr]);

    console.log("NFTPoolLockAndRelease address:", NFTPoolLockAndRelease.address);

    // 使用命令npx hardhat run --build-profile  scripts/deploy_MyToken.ts --network sepolia
    // 之后，会将合约部署，并验证。所以不需要再次验证
    // const networkName = await getNetworkName()
    // if (networkName !== "hardhat") {
    //     // 等待区块确认，确保合约已经被区块链网络接受
    //     // 太小会报错，无法验证通过
    //     console.log("waiting %d blocks for confirmations", CONFIRMATIONS);
    //     await MyToken.deploymentTransaction()?.wait(CONFIRMATIONS);

    //     // 验证合约(不需要，部署的时候就已经验证通过了)
    //     console.log("verifying FundMe contract ", MyToken.target);
    //     await verifyMyToken(String(MyToken.target), TOKEN_NAME, TOKEN_SYMBLE);
    // }
}

main().then().catch((error) => {
    console.error(error);
    process.exit(0);
})

