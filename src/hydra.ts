import { addMemberWallet, distributeWallet, findFanoutMembershipMintVoucherPda, findFanoutMembershipVoucherPda, findFanoutMintPda, findFanoutNativeAccountPda, findFanoutPda, init, initForMint, MembershipModel, mplHydra } from "@metaplex-foundation/mpl-hydra";
import { publicKey, PublicKey, Signer, transactionBuilder, Umi } from "@metaplex-foundation/umi";
import { NATIVE_MINT } from "@solana/spl-token";
import bs58 from "bs58";

export type WalletMembers = { publicKey: PublicKey, share: number }[];

export function getWalletAddress(umi: Umi, walletName: string) {
    const [fanout, fanoutBump] = findFanoutPda(umi, { name: walletName });
    return fanout;
}

export async function createHydraWalletWithMembers(umi: Umi, payer: Signer, members: WalletMembers, walletName: string) {
    let walletCreateTransaction = transactionBuilder()
        .add(createHydraWallet(umi, walletName));

    walletCreateTransaction.setFeePayer(payer);

    await walletCreateTransaction.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
    });

    const [fanout, fanoutBump] = findFanoutPda(umi, { name: walletName });

    let addMemberTransaction = transactionBuilder()
        .add(addMember(umi, fanout, members[0].publicKey, members[0].share))
        .add(addMember(umi, fanout, members[1].publicKey, members[1].share))
        .add(addMember(umi, fanout, members[2].publicKey, members[2].share));

    addMemberTransaction.setFeePayer(payer);

    let { signature } = await addMemberTransaction.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
    });
    const txid = bs58.encode(signature);
    console.log(`Create wallet with members successful! ${txid}`);

    return txid;
}

export function createHydraWallet(umi: Umi, walletName: string) {
    return init(umi, {
        model: MembershipModel.Wallet,
        totalShares: 100,
        name: walletName,
    })
}

export function addMember(umi: Umi, fanout: PublicKey, member: PublicKey, share: number) {
    return addMemberWallet(umi, {
        fanout,
        member,
        shares: share
    })
}

export async function distributeSol(umi: Umi, payer: Signer, member: PublicKey, walletName: string) {
    const [fanout, fanoutBump] = findFanoutPda(umi, { name: walletName });

    const nativeAccount = findFanoutNativeAccountPda(umi, { fanout });

    const fanoutForMint = findFanoutMintPda(umi, { fanout, mint: publicKey(NATIVE_MINT) });

    const fanoutForMintMembershipVoucher = findFanoutMembershipMintVoucherPda(umi, {
        fanout,
        membership: member,
        mint: publicKey(NATIVE_MINT),
    });

    const fanoutMintMemberTokenAccount = findFanoutMembershipVoucherPda(umi, {
        fanout: fanout, member
    })

    const membershipVoucher = findFanoutMembershipVoucherPda(umi, { fanout, member })

    const transaction = transactionBuilder()
        .add(distributeWallet(umi, {
            member,
            membershipVoucher,
            fanout,
            holdingAccount: nativeAccount,
            distributeForMint: false,
            payer,
            // unused arguments
            fanoutForMint,
            fanoutForMintMembershipVoucher,
            fanoutMint: publicKey(NATIVE_MINT),
            fanoutMintMemberTokenAccount,
        }));

    transaction.setFeePayer(payer);

    const { signature } = await transaction.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
    });
    const txid = bs58.encode(signature);
    console.log(`Distribute successfull! ${txid}`);
}
