// we import what we need from the #rocketh alias, see ../rocketh.ts
import { deployScript, artifacts } from "#rocketh";
import { TOKEN_NAME, TOKEN_SYMBLE } from "../helper-hardhat-config.ts"

export default deployScript(
    async ({ deploy, namedAccounts }) => {
        const { deployer } = namedAccounts;

        await deploy("MyCCIPLocalSimulator", {
            account: deployer,
            artifact: artifacts.MyCCIPLocalSimulator,
            args: [],
        });
    },
    // finally you can pass tags and dependencies
    { tags: ["all", "mycciplocalsimulator"] }
);