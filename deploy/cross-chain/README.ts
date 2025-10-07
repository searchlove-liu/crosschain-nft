// 在使用hardhat-deploy做跨链测试时，因为无法获取linkToken合约，所以没有完成，转成使用script来做跨链测试。

// #### 使用脚本做跨链测试：
// 1、sepolia网络中部署MyToken和NFTPoolLockAndRelease
// 2、amoy网络中部署WrappedMyToken和NFTPoolBurnAndMint
// 3、sepolia中某个地址使用MyToken合约创建一个NFT，
// 4、通过跨链转到amoy中WrappedMyToken