import * as anchor from "@project-serum/anchor";
import {PublicKey, TransactionSignature} from "@solana/web3.js";
import {Sesame} from "../idl/sesame";
import idl from "../idl/sesame.json";
import {notify} from "./notifications";

const textEncoder = new TextEncoder();

const ticketAppId = new PublicKey(idl.metadata.address);

export const ticketProgram = (connection, anchorWallet) => {
    const provider = new anchor.AnchorProvider(connection, anchorWallet, {});
    return new anchor.Program<Sesame>(idl, ticketAppId, provider);
}

export const notifyTxError = (message: string, error, tx: TransactionSignature) => {
    notify({type: 'error', message: message, description: error?.message, txid: tx});
    console.log('error', message, error?.message, tx);
}

export const deriveOrganizer = (program: anchor.Program<Sesame>, owner: anchor.web3.PublicKey) =>
    anchor.web3.PublicKey.findProgramAddress(
        [textEncoder.encode("Organizer"), owner.toBuffer()],
        program.programId
    );

export const deriveEvent = (program: anchor.Program<Sesame>, owner: anchor.web3.PublicKey, offset: number) =>
    anchor.web3.PublicKey.findProgramAddress(
        [textEncoder.encode("Event"), owner.toBuffer(), new anchor.BN(offset).toArrayLike(Buffer, "le", 4)],
        program.programId
    );

export const deriveTicket = (program: anchor.Program<Sesame>, event: anchor.web3.PublicKey, seatId: string) =>
    anchor.web3.PublicKey.findProgramAddress(
        [textEncoder.encode("Ticket"), event.toBuffer(), Buffer.from(seatId, "utf-8")],
        program.programId
    );