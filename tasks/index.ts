import type { HardhatPlugin } from 'hardhat/types/plugins';
import { task } from 'hardhat/config';


export const checknft: HardhatPlugin = {
    id: 'checknft',
    tasks: [
        task('checknft', 'Check NFT in MyToken contract')
            .setAction(() => import('../deploy/cross-chain/check-nft.ts'))
            .build(),
    ],
    npmPackage: 'checknft',
};
