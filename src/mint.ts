import { createSignerFromKeypair, publicKey, signerIdentity } from "@metaplex-foundation/umi";
import process from "process";
import { privateMint, publicMint } from "./helpers";
import { config } from "./config";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { fetchCandyMachine, mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";

async function handleConsoleArgs() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.log("Пожалуйста, укажите mint: 'public' или 'private'.");
    }

    const mintType = args[0].toLowerCase();

    const umi = createUmi(config.network, { commitment: 'confirmed' });

    const signer = createSignerFromKeypair(umi, umi.eddsa.createKeypairFromSecretKey(new Uint8Array(config.walletPrivateKey)));

    umi.use(signerIdentity(signer)).use(mplCandyMachine()).use(mplTokenMetadata());

    const candyMachine = await fetchCandyMachine(umi, publicKey(config.candyMachineAddress));

    switch (mintType) {
        case "public":
            publicMint(umi, signer, candyMachine);
            break;
        case "private":
            privateMint(umi, signer, candyMachine, config.allowList);
            break;
        default:
            console.log("Некорректный выбор. Используйте 'public' или 'private'.");
            break;
    }
}

handleConsoleArgs().then();
