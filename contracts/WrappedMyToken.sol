// SPDX-License-Identifier: MIT
// 目标链会部署的链，用于创造等价于源联的NFT

pragma solidity ^0.8.20;

import {MyToken} from "./MyToken.sol";

contract WrappedMyToken is MyToken {
    constructor(
        string memory tokenName,
        string memory tokenSymble
    ) MyToken(tokenName, tokenSymble) {}

    function mintTokenWithSpecificTokenId(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }
}
