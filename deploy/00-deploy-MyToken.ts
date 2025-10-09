// we import what we need from the #rocketh alias, see ../rocketh.ts
import { deployScript, artifacts } from "#rocketh";
import { TOKEN_NAME, TOKEN_SYMBLE } from "../helper-hardhat-config.ts"

export default deployScript(
    async ({ deploy, namedAccounts, }) => {
        const { deployer } = namedAccounts;

        const MyTokenDeploy = await deploy("MyToken", {
            account: deployer,
            artifact: artifacts.MyToken,
            args: [TOKEN_NAME, TOKEN_SYMBLE],
        });
    },
    // finally you can pass tags and dependencies
    { tags: ["mytoken"] }
);

// npx hardhat compile
// npx hardhat deploy --tags mytoken --network localhost
// npx hardhat deploy --tags mytoken --network sepolia
