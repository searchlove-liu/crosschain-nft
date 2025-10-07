import { describe, it, before } from 'node:test'; // using node:test as hardhat v3 do not support vitest
import { network } from 'hardhat';
import { setupFixtures } from './utils/index.ts';
import { expect } from 'chai';
import { ethers } from "ethers"
// import hre  from "hardhat";

const { provider, networkHelpers } = await network.connect();
const { deployAll } = setupFixtures(provider);

const { env, MyToken, WrappedMyToken, MyCCIPLocalSimulator, NFTPoolLockAndRelease, NFTPoolBurnAndMint, namedAccounts, chainSelector } = await networkHelpers.loadFixture(deployAll);

describe("source chain ->  dest chain", async () => {

    it("test if user can mint a nft from nft contract successfully", async () => {
        await env.execute(MyToken, {
            functionName: "safeMint",
            args: [namedAccounts.deployer],
            account: namedAccounts.deployer
        })
        // 查看第1个NFT的所有者
        const owner = await env.read(MyToken, {
            functionName: "ownerOf",
            args: [0n],
            account: namedAccounts.deployer
        })
        let ownerLower = owner.toLowerCase()
        expect(ownerLower).to.equal(namedAccounts.deployer)
    })

    it("test if user can lock the nft in the pool and send ccip message on source chain", async () => {
        // NFT owner of namedAccounts.deployer give NFTPoolLockAndRelease promission of handling frist NFT
        await env.execute(MyToken, {
            functionName: "approve",
            args: [NFTPoolLockAndRelease.address, 0n],
            account: namedAccounts.deployer
        });
        // give NFTPoolLockAndRelease some test coin
        await env.execute(MyCCIPLocalSimulator, {
            functionName: "requestLinkFromFaucet",
            args: [NFTPoolLockAndRelease.address, ethers.parseEther("100")],
            account: namedAccounts.deployer
        })

        // 将目标NFT转移给NFTPoolLockAndRelease合约,在目标链生成wrappedNFT,给namedAccounts.deployer
        await env.execute(NFTPoolLockAndRelease, {
            functionName: "lockAndSendNFT",
            // uint256 tokenId,address newOwner,uint64 chainSelector,address receiver
            args: [0n, namedAccounts.deployer, chainSelector, NFTPoolBurnAndMint.address],
            account: namedAccounts.deployer
        })
        // 查看NFT所有者
        let owner = await env.read(MyToken, {
            functionName: "ownerOf",
            args: [0n],
            account: namedAccounts.deployer
        })

        expect(owner.toLowerCase()).to.equal(NFTPoolLockAndRelease.address)
    })

    it("test if user can get a wrapped nft in dest chain", async () => {
        // 查看WrappedMyToken中是否存在一个NFT，并且获取这个NFT的所有者,理论上来说这个所有者是namedAccounts.deployer，
        // 因为在调用NFTPoolLockAndRelease，并执行lockAndSendNFT时在源链将NFT所有者转给NFTPoolLockAndRelease，在目标链创建一个WNFT,转给namedAccounts.deployer
        // 总的来说，就是源链锁定NFT，目标链获取NFT
        const owner = await env.read(WrappedMyToken, { functionName: "ownerOf", args: [0n] })
        expect(owner.toLowerCase()).to.equal(namedAccounts.deployer)
    }
    )

})

describe("dest chain -> source chain", async () => {
    it("test if user can burn a wnft and send ccip menssage on dest chain", async () => {
        await env.execute(WrappedMyToken, {
            functionName: "approve",
            args: [NFTPoolBurnAndMint.address, 0n],
            // 下面地址是合约调用的地址，也是WNFT的所有者
            account: namedAccounts.deployer
        });
        // give NFTPoolBurnAndMint some test coin
        await env.execute(MyCCIPLocalSimulator, {
            functionName: "requestLinkFromFaucet",
            args: [NFTPoolBurnAndMint.address, ethers.parseEther("100")],
            account: namedAccounts.deployer
        })

        // 将目标WNFT燃烧,在源链释放锁住的NFT
        await env.execute(NFTPoolBurnAndMint, {
            functionName: "burnAndSendNFT",
            // uint256 tokenId,address newOwner,uint64 chainSelector,address receiver
            args: [0n, namedAccounts.deployer, chainSelector, NFTPoolLockAndRelease.address],
            account: namedAccounts.deployer
        })
        // 查看WNFT的数量是否变为0
        let totalSupply = await env.read(WrappedMyToken, {
            functionName: "totalSupply",
            args: [],
            account: namedAccounts.deployer
        })

        expect(totalSupply).to.equal(0n)
    })

    it("test if user have the nft unlocked on source chain", async () => {
        const owner = await env.read(MyToken, {
            functionName: "ownerOf", args: [0n],
            account: namedAccounts.deployer
        })

        expect(owner.toLowerCase()).to.equal(namedAccounts.deployer)
    })
})



// TODO测试详情：pnpm test