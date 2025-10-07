import { loadEnvironmentFromHardhat } from "#rocketh";
import hre from "hardhat";

async function main() {
    const env = await loadEnvironmentFromHardhat({ hre })
    const NFTPoolBurnAndMintAddr = env.deployments["NFTPoolBurnAndMint"].address
    console.log("NFTPoolBurnAndMintAddr = ", NFTPoolBurnAndMintAddr)
}

main()

// npx hardhat run scripts/cross-chain/NFTPoolBurnAndMintAddr.ts --network amoy