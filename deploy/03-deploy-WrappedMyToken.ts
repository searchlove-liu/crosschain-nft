// we import what we need from the #rocketh alias, see ../rocketh.ts
import { deployScript, artifacts } from "#rocketh";
import { WRAP_TOKEN_NAME, WARAP_TOKEN_SYMBLE } from "../helper-hardhat-config.ts"

export default deployScript(
    async ({ deploy, namedAccounts }) => {
        const { deployer } = namedAccounts;

        await deploy("WrappedMyToken", {
            account: deployer,
            artifact: artifacts.WrappedMyToken,
            args: [WRAP_TOKEN_NAME, WARAP_TOKEN_SYMBLE],
        });
    },
    // finally you can pass tags and dependencies
    { tags: ["wnft"] }
);

// npx hardhat compile
// npx hardhat deploy --tags wnft --network localhost
