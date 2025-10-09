import { Abi_WrappedMyToken } from "#generated/abis/WrappedMyToken.js";
import { deployScript } from "#rocketh"

// 部署合约
export default deployScript(
    async (env) => {
        console.log("check WNFT in WrappedMyToken contract");
        const wrappedMyToken = env.get<Abi_WrappedMyToken>("WrappedMyToken");
        const totalSupply = await env.read(wrappedMyToken, { functionName: "totalSupply", args: [] })
        console.log(`totalSupply = ${totalSupply}`)

        // WrappedMyToken假设mint了3个token。然后第1Token的TokenIndex=TokenId=0，第2个Token的TokenIndex=TokenId=1 ，
        // 第3个Token的TokenIndex=TokenId=2.
        // 假设第1个Token被合约NFTPoolBurnAndMint 烧掉（burn），剩下第2和第3个合约，及WrappedMyToken的totalSupply变为2，
        // 那么剩下的第一个合约的tokenIndex=0，TokenId=1；剩余第二个合约的tokenIndex=1，TokenId=2
        let TokenIndex: bigint = 0n
        let TokenId: bigint
        for (; TokenIndex < totalSupply; TokenIndex++) {
            // 通过TokenIndex获取对应的TokenId
            // console.log("TokenIndex = ", TokenIndex)
            TokenId = await env.read(wrappedMyToken, { functionName: "tokenByIndex", args: [TokenIndex] })
            // 通过TokenId获取对应的owner
            console.log(`TokenId of the Token with index "${TokenIndex}" is "${TokenId}"`)
            const owner = await env.read(wrappedMyToken, { functionName: "ownerOf", args: [TokenId] }).catch((error) => {
                console.log(error)
            })
            console.log(`WNFTId TokenId:${TokenId} - owner: ${owner}.`)
        }
    },
    { tags: ["checkwnft"] }
)

// 检查已经创建的NFT id和所有者。
// npx hardhat deploy --tags checkwnft --network amoy