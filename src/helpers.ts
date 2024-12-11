import { CandyMachine, fetchCandyMachine, getMerkleProof, getMerkleRoot, mintV2, route } from "@metaplex-foundation/mpl-candy-machine";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { generateSigner, publicKey, PublicKey, Signer, some, transactionBuilder, Umi } from "@metaplex-foundation/umi";
import bs58 from "bs58";
import { config } from "./config";


export async function privateMint(umi: Umi, minter: Signer, candyMachine: CandyMachine, allowList: string[]) {
    const nftMint = generateSigner(umi);

    await route(umi, {
        guard: "allowList",
        routeArgs: {
            path: "proof",
            merkleRoot: getMerkleRoot(allowList),
            merkleProof: getMerkleProof(allowList, minter.publicKey),
        },
        candyMachine: candyMachine.publicKey,
        candyGuard: candyMachine.mintAuthority,
        payer: minter,
        group: "privat",
    }).sendAndConfirm(umi);

    const transaction = transactionBuilder()
        .add(setComputeUnitLimit(umi, { units: 800_000 }))
        .add(
            mintV2(umi, {
                minter,
                payer: minter,
                candyMachine: candyMachine.publicKey,
                candyGuard: candyMachine.mintAuthority,
                nftMint,
                collectionMint: candyMachine.collectionMint,
                collectionUpdateAuthority: candyMachine.authority,
                group: "privat",
                mintArgs: {
                    solPayment: some({ destination: publicKey(config.destination_private) }),
                    mintLimit: some({ id: 1 }),
                    allowList: some({ merkleRoot: getMerkleRoot(allowList) })
                },
            })
        );

    const { signature } = await transaction.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
    });

    const txid = bs58.encode(signature);
    console.log(`Mint successful! ${txid}`)
}

export async function publicMint(umi: Umi, minter: Signer, candyMachine: CandyMachine) {
    const nftMint = generateSigner(umi);
    const nftMint1 = generateSigner(umi);
    const nftMint2 = generateSigner(umi);

    const transaction = transactionBuilder()
        .add(setComputeUnitLimit(umi, { units: 800_000 }))
        .add(
            mintV2(umi, {
                minter,
                payer: minter,
                candyMachine: candyMachine.publicKey,
                candyGuard: candyMachine.mintAuthority,
                nftMint,
                collectionMint: candyMachine.collectionMint,
                collectionUpdateAuthority: candyMachine.authority,
                group: "public",
                mintArgs: {
                    solPayment: some({ destination: publicKey(config.destination_public) }),
                },
            })
        );

    const { signature } = await transaction.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
    });

    const txid = bs58.encode(signature);
    console.log(`Mint successful! ${txid}`)
}
