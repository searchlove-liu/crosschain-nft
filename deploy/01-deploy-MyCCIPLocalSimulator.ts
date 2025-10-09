// we import what we need from the #rocketh alias, see ../rocketh.ts
import { deployScript, artifacts } from "#rocketh";
import { developmentChains } from "./../helper-hardhat-config.ts"

export default deployScript(
    async ({ deploy, namedAccounts, viem }) => {
        const { deployer } = namedAccounts;
        const chainId = await viem.publicClient.getChainId()

        // 如果是本地网络
        if (developmentChains.includes(chainId)) {
            await deploy("MyCCIPLocalSimulator", {
                account: deployer,
                artifact: artifacts.MyCCIPLocalSimulator,
                args: [],
            });
        }
    },
    // finally you can pass tags and dependencies
    { tags: ["mycciplocalsimulator"] }
);

// npx hardhat compile
// npx hardhat deploy --tags mycciplocalsimulator --network localhost