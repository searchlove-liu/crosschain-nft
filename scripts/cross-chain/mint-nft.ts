import { loadEnvironmentFromHardhat } from "#rocketh"
import hre from "hardhat";
import { network } from "hardhat";
const { viem } = await network.connect()

async function main() {
    const env = await loadEnvironmentFromHardhat({ hre })
    const MyTokenAddr = env.deployments["MyToken"].address;
    // console.log("MyToken address:", MyTokenAddr);

    const MyTokenInstance = await viem.getContractAt("MyToken", MyTokenAddr)
    // 第一个参数代表函数的参数，第二个参数代表那个账户调用这个合约函数
    let result = await MyTokenInstance.write.safeMint([env.namedAccounts.deployer], { account: env.namedAccounts.deployer })
    console.log("Minted NFT, transaction hash:", result);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

// 使用已部署的MyToken，铸造一个NFT
// npx hardhat run scripts/cross-chain/mint-nft.ts --network sepolia