import { deployScript } from "#rocketh"
import { Abi_MyToken } from "#generated/abis/MyToken.js"
import { deploy } from "@rocketh/deploy"
export default deployScript(
    async ({ viem, namedAccounts }) => {
        const { deployer } = namedAccounts
        console.log(`will mint a NFT to ${deployer}`)
        const MyToken = viem.getWritableContract("MyToken")
        // account表示deploy执行这个函数
        await MyToken.write.safeMint([namedAccounts.deployer], { account: deployer })
    },
    // mint之前必须部署mytoken,已经部署就不会继续部署，当然说的时deployments文件中是都有对应文件，没有还是会继续部署
    { tags: ["mint-nft"], dependencies: ["mytoken"] }
)
// 根据MyToken，创建一个NFT
// npx hardhat deploy --tags mint-nft --network sepolia