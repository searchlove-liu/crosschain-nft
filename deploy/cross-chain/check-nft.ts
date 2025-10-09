import { Abi_MyToken } from "#generated/abis/MyToken.js";
import { deployScript } from "#rocketh"

// 部署合约
export default deployScript(
    async (env) => {
        console.log("check NFT in MyToken contract");
        const myToken = env.get<Abi_MyToken>("MyToken");
        const totalSupply = await env.read(myToken, { functionName: "totalSupply", args: [] })
        let TokenId: bigint = 0n
        for (; TokenId < totalSupply; TokenId++) {
            const owner = await env.read(myToken, { functionName: "ownerOf", args: [TokenId] })
            console.log(`TokenId: ${TokenId} - owner: ${owner}`)
        }
    },
    { tags: ["checknft"] }
)

// 检查已经创建的NFT id和所有者。
// npx hardhat deploy --tags checknft --network sepolia