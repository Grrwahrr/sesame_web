import {FC, useCallback, useEffect, useState} from 'react';
import {useAnchorWallet, useConnection, useWallet} from '@solana/wallet-adapter-react';
import {TransactionSignature} from "@solana/web3.js";
import {deriveEvent, deriveOrganizer, notifyTxError, ticketProgram} from "../utils/dapp_lib";


export const Organization: FC = () => {

    const {connection} = useConnection();
    const {publicKey} = useWallet();
    const anchorWallet = useAnchorWallet();
    const [organizer, setOrganizer] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!publicKey) return;
            const program = ticketProgram(connection, anchorWallet);
            const [accDataOrganizer, bumpOrganizer] = await deriveOrganizer(program, publicKey);
            const organizer = await program.account.organizer.fetch(accDataOrganizer);
            setOrganizer(organizer);
        }
        fetchData().catch(console.error);
    }, [connection, publicKey, anchorWallet]);

    const onClickOrgaTest = useCallback(async () => {
        const program = ticketProgram(connection, anchorWallet);

        const [accDataOrganizer, bumpOrganizer] = await deriveOrganizer(program, publicKey);
        const [accDataEvent, bumpEvent] = await deriveEvent(program, publicKey, 0);


        const organizer = await program.account.organizer.fetch(accDataOrganizer);

        if (organizer) {
            console.log("Organizer account", organizer);
        } else {

            let tx: TransactionSignature = '';
            try {
                tx = await program.methods
                    .createOrganizer("The Organizers", "https://the.organizers.tldr")
                    .accounts({
                        payer: publicKey,
                        organizer: accDataOrganizer,
                    }).rpc();
                console.log("TX signature:", tx);
            } catch (error: any) {
                notifyTxError("Could not create organization", error, tx);
            }
        }

    }, [publicKey, connection]);


    function createOrganizer() {
        return (
            <div>
                Hero element to create organizer
            </div>
        );
    }

    function showOrganizer(organizer) {
        return (
            <div>
                {organizer.title}
            </div>
        );
    }

    return (
        <div>
            {organizer ? showOrganizer(organizer) : createOrganizer()}
        </div>
    );
};

