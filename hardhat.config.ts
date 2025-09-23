import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";
import HardhatDeploy from 'hardhat-deploy';
// 为了解决：下列问题
//  A network request failed. This is an error from the block explorer, 
// not Hardhat. Error: Connect Timeout Error
// 参考：https://www.cnblogs.com/shaozhu520/p/18757397
import { ProxyAgent, setGlobalDispatcher } from "undici";
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
setGlobalDispatcher(proxyAgent);

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViem, HardhatDeploy],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      chainId: 11155111,
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY"), configVariable("SEPOLIA_PRIVATE_KEY2")],
    },
  },
  verify: {
    etherscan: {
      apiKey: configVariable("ETHERSCAN_API_KEY"),
    },
    blockscout: {
      enabled: false,
    },
  },
};

export default config;
