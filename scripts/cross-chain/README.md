#### 使用脚本做跨链测试：
1、sepolia网络中部署MyToken和NFTPoolLockAndRelease
2、amoy网络中部署WrappedMyToken和NFTPoolBurnAndMint
3、sepolia中某个地址使用MyToken合约创建一个NFT，
4、通过跨链转到amoy中WrappedMyToken

#### 
没有完成，因为可以使用hardhat-deploy完成了。
进度：完成获取sepolia网络中LinkToken合约。下一步是需要给NFTPoolLockAndRelease转账
