// SPDX-License-Identifier: UNLICENSED
// used to local test CCIP
// 参考：https://docs.chain.link/chainlink-local/build/ccip/hardhat/local-simulator#examine-the-code

pragma solidity ^0.8.24;

import {CCIPLocalSimulator} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";

contract MyCCIPLocalSimulator is CCIPLocalSimulator {}