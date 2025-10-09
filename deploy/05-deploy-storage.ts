import { deployScript, artifacts } from "#rocketh";
import { exec, execSync, spawn } from 'child_process';
import { promisify } from 'util';

export default deployScript(
    async ({ deploy, namedAccounts, }) => {
        const { deployer } = namedAccounts;

        const StorageDeploy = await deploy("Storage", {
            account: deployer,
            artifact: artifacts.Storage,
            args: [],
        });

        // console.log('🧪 验证合约...');
        // const cmd = `npx hardhat verify ----build-profile default  --network sepolia ${StorageDeploy.address}`
        // try {
        //     const { stdout, stderr } = exec(cmd);
        //     if (stderr) {
        //         console.warn('命令执行警告:', stderr);
        //     }
        //     // console.log('✅ 验证通过');
        //     console.log(`${stdout}`)
        // } catch (error) {
        //     console.error('❌ 验证失败', error);
        //     throw error;
        // }
    },
    // finally you can pass tags and dependencies
    { tags: ["storage"] }
);

// 用于测试合约的验证
// npx hardhat deploy --tags storage --network localhost
// npx hardhat deploy --tags storage --network sepolia