import { Abi_MyToken } from "#generated/abis/MyToken.js";
import { Abi_MyCCIPLocalSimulator } from "#generated/abis/MyCCIPLocalSimulator.js";
import { Abi_WrappedMyToken } from "#generated/abis/WrappedMyToken.js";
import { Abi_NFTPoolLockAndRelease } from "#generated/abis/NFTPoolLockAndRelease.js";
import { Abi_NFTPoolBurnAndMint } from "#generated/abis/NFTPoolBurnAndMint.js";

import { loadAndExecuteDeployments } from '#rocketh';

import { EthereumProvider } from 'hardhat/types/providers';
// prepare variable :contract, accounts
export function setupFixtures(provider: EthereumProvider) {
    return {
        async deployAll() {
            // Executes deployment scripts using rocketh's `loadAndExecuteDeployments` function.
            const env = await loadAndExecuteDeployments({
                provider: provider,
            });

            // Deployment are inherently untyped since they can vary from network or even before different from current artifacts
            // so here we type them manually assuming the artifact is still matching
            const MyToken = env.get<Abi_MyToken>('MyToken');
            const WrappedMyToken = env.get<Abi_WrappedMyToken>('WrappedMyToken');
            const MyCCIPLocalSimulator = env.get<Abi_MyCCIPLocalSimulator>("MyCCIPLocalSimulator");
            const NFTPoolLockAndRelease = env.get<Abi_NFTPoolLockAndRelease>("NFTPoolLockAndRelease");
            const NFTPoolBurnAndMint = env.get<Abi_NFTPoolBurnAndMint>("NFTPoolBurnAndMint");
            let CCIPConfig = await env.read(MyCCIPLocalSimulator, { functionName: "configuration", args: [], account: env.namedAccounts.deployer })
            const chainSelector = CCIPConfig[0];


            return {
                env, MyToken, WrappedMyToken, MyCCIPLocalSimulator, NFTPoolLockAndRelease, NFTPoolBurnAndMint, namedAccounts: env.namedAccounts, unnamedAccounts: env.unnamedAccounts, chainSelector
            };
        },
    };
}