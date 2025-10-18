import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";
// import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable } from "hardhat/config";
import HardhatDeploy from 'hardhat-deploy';
import hardhatLicenseIdentifier from '@solidstate/hardhat-license-identifier';
// 为了解决：下列问题
//  A network request failed. This is an error from the block explorer, 
// not Hardhat. Error: Connect Timeout Error
// 参考：https://www.cnblogs.com/shaozhu520/p/18757397
// https://www.cnblogs.com/shaozhu520/p/18757397
// import { ProxyAgent, setGlobalDispatcher } from "undici";
// const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
// setGlobalDispatcher(proxyAgent);
// 参考 问题.md

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViem, HardhatDeploy, hardhatLicenseIdentifier],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      // 注释：是因为在编译和验证使用同一个编译。default和production对应执行脚本中的--build-profile
      // hardhat ignition默认使用production。其他不知道。注释之后，都是用默认值，编译和验证就会使用一个，
      // 验证就不会出错。
      // production: {
      //   version: "0.8.28",
      //   settings: {
      //     optimizer: {
      //       enabled: true,
      //       runs: 200,
      //     },
      //   },
      // },
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
    amoy: {
      type: "http",
      chainId: 80002,
      url: configVariable("AMOY_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY"), configVariable("SEPOLIA_PRIVATE_KEY2")],
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
