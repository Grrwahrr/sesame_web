import {Keypair, PublicKey, TransactionSignature} from "@solana/web3.js";
import idl from "../idl/sesame.json";
import {notify} from "./notifications";
import {AnchorProvider, BN, Program} from "@project-serum/anchor";
import {bs58} from "@project-serum/anchor/dist/cjs/utils/bytes";

const textEncoder = new TextEncoder();


export const ticketProgram = (connection, anchorWallet) => {
    const provider = new AnchorProvider(connection, anchorWallet, {});
    // @ts-ignore
    return new Program(idl, new PublicKey(idl.metadata.address), provider);
}

export const notifyTxError = (message: string, error: any, tx: TransactionSignature) => {
    notify({type: 'error', message: message, description: error?.message, txid: tx});
    console.log('error', message, error?.message, tx);
}

export const notifyTxSuccess = (message: string, tx: TransactionSignature) => {
    notify({type: 'success', message: message, txid: tx});
}


// Account derivation
export const deriveOrganizer = (program: Program, owner: PublicKey) =>
    PublicKey.findProgramAddress(
        [textEncoder.encode("Organizer"), owner.toBuffer()],
        program.programId
    );

export const deriveEvent = (program: Program, owner: PublicKey, offset: number) =>
    PublicKey.findProgramAddress(
        [textEncoder.encode("Event"), owner.toBuffer(), new BN(offset).toArrayLike(Buffer, "le", 4)],
        program.programId
    );

export const deriveTicket = (program: Program, event: PublicKey, offset: number) =>
    PublicKey.findProgramAddress(
        [textEncoder.encode("Ticket"), event.toBuffer(), new BN(offset).toArrayLike(Buffer, "le", 2)],
        program.programId
    );

export const deriveEventPass = (program: Program, owner: PublicKey, offset: number) =>
    PublicKey.findProgramAddress(
        [textEncoder.encode("EventPass"), owner.toBuffer(), new BN(offset).toArrayLike(Buffer, "le", 4)],
        program.programId
    );

export const deriveEventPassValidEvent = (program: Program, eventPass: PublicKey, offset: number) =>
    PublicKey.findProgramAddress(
        [textEncoder.encode("EventPassValidEvent"), eventPass.toBuffer(), new BN(offset).toArrayLike(Buffer, "le", 2)],
        program.programId
    );

export const deriveEventPassHolder = (program: Program, eventPass: PublicKey, offset: number) =>
    PublicKey.findProgramAddress(
        [textEncoder.encode("EventPassHolder"), eventPass.toBuffer(), new BN(offset).toArrayLike(Buffer, "le", 2)],
        program.programId
    );

export const deriveEventPassHolderTicket = (program: Program, eventPassHolder: PublicKey, event: PublicKey) =>
    PublicKey.findProgramAddress(
        [textEncoder.encode("EventPassHolderTicket"), eventPassHolder.toBuffer(), event.toBuffer()],
        program.programId
    );

export const getKeyPairForSecretKeyBase58 = (secretKeyBase58) => {
    try {
        return Keypair.fromSecretKey(bs58.decode(secretKeyBase58));
    } catch (e) {
        return undefined;
    }
}