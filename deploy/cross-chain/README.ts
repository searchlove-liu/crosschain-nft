// 在使用hardhat-deploy做跨链测试时，因为无法获取linkToken合约，所以没有完成，转成使用script来做跨链测试。

// #### 使用脚本做跨链测试：
// 1、sepolia网络中部署MyToken和NFTPoolLockAndRelease
// 2、amoy网络中部署WrappedMyToken和NFTPoolBurnAndMint
// 3、sepolia中某个地址使用MyToken合约创建一个NFT，
// 4、通过跨链转到amoy中WrappedMyToken

// ccip chainLink 区块链浏览器
// https://ccip.chain.link/

// ----------------------------------------------------------deploy/cross-chain文件介绍

// abi.ts
// 存放ethereum sepolia和polygon amoy网络的两个LinkTokenAbi，用于获取对应网络中的LinkToken实例，
// 并向NFTPoolBurnAndMint和NFTPoolLockAndRelease转一些link，这些link是两个交易池合约进行操作的交易费。

// check-nft.ts
// 查看MyToken合约中NFT的id和对应的所有者

// check-wnft.ts
// 查看WrappedMyToken合约中NFT的id和对应的所有者

// NFTPoolBurnAndMintAddr.ts
// 查看合约NFTPoolBurnAndMint的地址

// NFTPoolLockAndReleaseAddr.ts
// 查看合约NFTPoolLockAndRelease的地址

// mint-nft.ts
// 使用MyToken铸造一个新的NFT

// lock-and-cross.ts
// 将sepolia中的某个NFT转移到amoy中的某个账户
// 1、在sepolia网络中将某个NFT转移给（锁定）合约NFTPoolLockAndRelease，
// 2、在amoy网络中，使用WrappedMyToken合约铸造一个同样的NWFT，WNFT归目标账户

// burn-and-cross.ts
// 1、在polygon amoy网络，NFTPoolBurnAndMint烧毁目标NFT，
// 2、在ethereum sepolia网络中将目标NFT从NFTPoolLockAndRelease合约地址转到目标账户


// ---------------------------------------------------------流程
// 1、部署合约及验证
// MyToken ：npx hardhat deploy --tags mytoken --network sepolia
// NFTPoolLockAndRelease : npx hardhat deploy --tags sourcechain --network sepolia
// WrappedMyToken ：npx hardhat deploy --tags wnft --network amoy
// NFTPoolBurnAndMint：npx hardhat deploy --tags destchain --network amoy
// 验证sepolia中所有部署合约：pnpm rocketh-verify -e sepolia etherscan  
// 验证amoy中所有部署合约：pnpm rocketh-verify -e amoy etherscan

// 2、铸币
// npx hardhat deploy --tags mint-nft --network sepolia

// 3、查看MyToken中所有NFT及所有者
// npx hardhat deploy --tags checknft --network sepolia

// 4、将sepolia网络中目标NFT，转移给amoy网络账户
// 获取目标链的NFTPoolBurnAndMint地址，返回一个地址，在进行转移时需要这个地址作为参数
// npx hardhat deploy --tags nftbmAddr --network amoy
// 转移
// npx hardhat deploy --tags lockandcross --network sepolia

// 5、在https://ccip.chain.link/ 查看交易
// 转移成功之后，会返回一个交易hash，在上面链接中查看交易状态是否为成功。等待交易状态(status)变为success

// 6、查看WrappedMyToken中NFT和其所有者
// npx hardhat deploy --tags checkwnft --network amoy
// 如果查到，且id和所有者正确，说明转移成功

// 7、将amoy网络中的NFT转移到sepolia
// 获取目标链的NFTPoolLockAndRelease地址，返回一个地址，在进行转移时需要这个地址作为参数
// npx hardhat deploy --tags nftlrAddr --network sepolia
// 转移
// npx hardhat deploy --tags burnandcross --network amoy

// 8、在https://ccip.chain.link/ 查看交易
// 转移成功之后，会返回一个交易hash，在上面链接中查看交易状态是否为成功。等待交易状态(status)变为success

// // 3、查看MyToken中所有NFT及所有者
// npx hardhat deploy --tags checknft --network sepolia
// 如果对应id的所有者从NFTPoolLockAndRelease地址转为目标地址说明转移成功