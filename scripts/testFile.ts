import { network } from "hardhat";
const { ethers } = await network.connect()
const mytokenAddr = "0x5fbdb2315678afecb367f032d93f642f64180aa3"
const mytoken = await ethers.getContractAtFromArtifact()
console.log("address :", mytoken.target)