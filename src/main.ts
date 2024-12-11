import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { createSignerFromKeypair, publicKey, signerIdentity } from '@metaplex-foundation/umi';
import { mplTokenMetadata, } from "@metaplex-foundation/mpl-token-metadata";
import { privateMint, publicMint } from "./helpers";
import { fetchCandyGuard, fetchCandyMachine, getMerkleRoot, mplCandyMachine, route } from '@metaplex-foundation/mpl-candy-machine';
import { createHydraWalletWithMembers, distributeSol, getWalletAddress, WalletMembers } from './hydra';
import { mplHydra } from '@metaplex-foundation/mpl-hydra';
import { config } from './config';

const main = async () => {
    const umi = createUmi(config.network, { commitment: 'confirmed' });

    umi.use(mplCandyMachine());

    const candyMachineAddress = publicKey(config.candyMachineAddress);

    const candyMachine = await fetchCandyMachine(
        umi,
        candyMachineAddress,
    );

    const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority)

    console.log(candyGuard.groups[0].guards);
}

main().then();
