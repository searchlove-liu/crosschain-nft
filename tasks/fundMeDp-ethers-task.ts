// // 需要插件@nomicfoundation/hardhat-toolbox-mocha-ethers

// import { network } from "hardhat"

// import { verifyContract } from "@nomicfoundation/hardhat-verify/verify";

// import hre from "hardhat";

// import type { NewTaskActionFunction } from 'hardhat/types/tasks';

// interface DeployContractArgs {
//     lockTime?: bigint;
// }

// // 验证合约
// async function verifyFundMe(deployedAddress: string, constructorArgs: bigint) {
//     verifyContract(
//         {
//             address: deployedAddress,
//             constructorArgs: [constructorArgs],
//             provider: "etherscan", // or "blockscout" for Blockscout-compatible explorers
//         },
//         hre,
//     );
// }

// // 部署合约
// const deployContractWithHardhat: NewTaskActionFunction<DeployContractArgs> = async () => {
//     const { ethers } = await network.connect();

//     const args = 1800n
//     // 返回合约实例，ethers是一个合约工厂，1800n代表一个大整数
//     const fundMe = await ethers.deployContract("FundMe", [args]);
//     // ethers.getContractFactory
//     await fundMe.waitForDeployment();
//     console.log("FundMe deployed to:", fundMe.target);

//     // 获取部署的网络
//     // process.argv[0] 是 Node.js 可执行文件的路径
//     // process.argv[1] 是该脚本文件的路径
//     // 从 process.argv[2] 开始是用户传入的参数,获取从process.argv[2]传入的参数
//     let networkName: string = "hardhat";
//     const userArgs = process.argv.slice(2);
//     for (let i = 0; i < userArgs.length; i++) {
//         let arg = userArgs[i];
//         if (arg === "--network") {
//             // console.log("Network type is ",userArgs[i + 1], "\n");
//             networkName = userArgs[i + 1];
//             break;
//         }
//     }

//     if (networkName !== "hardhat") {
//         // 等待区块确认，确保合约已经被区块链网络接受
//         // 太小会报错，无法验证通过
//         let blockConfirmations = 3;
//         console.log("waiting %d blocks for confirmations", blockConfirmations);
//         await fundMe.deploymentTransaction()?.wait(blockConfirmations);

//         // 验证合约(不需要，部署的时候就已经验证通过了)
//         console.log("verifying FundMe contract ", fundMe.target);
//         await verifyFundMe(String(fundMe.target), args);
//     }
// }

// export default deployContractWithHardhat;



