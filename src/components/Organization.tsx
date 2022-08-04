import {FC, useCallback, useEffect, useState} from 'react';
import {useAnchorWallet, useConnection, useWallet} from '@solana/wallet-adapter-react';
import {TransactionSignature} from "@solana/web3.js";
import {deriveOrganizer, notifyTxError, ticketProgram} from "../utils/dapp_lib";


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

    const btnCreateOrganizer = useCallback(async () => {
        const program = ticketProgram(connection, anchorWallet);
        const [accDataOrganizer, bumpOrganizer] = await deriveOrganizer(program, publicKey);
        const organizer = await program.account.organizer.fetch(accDataOrganizer);

        if (organizer) {
            console.log("Organizer already exists", organizer);
            return;
        }

        let tx: TransactionSignature = '';
        try {
            tx = await program.methods
                .createOrganizer("The Organizers", "https://the.organizers.tldr")
                .accounts({
                    payer: publicKey,
                    organizer: accDataOrganizer,
                }).rpc();
            console.log("create organizer tx hash:", tx);
        } catch (error: any) {
            notifyTxError("Could not create organization", error, tx);
        }
    }, [publicKey, connection]);


    function createOrganizer() {
        return (
            <div className="w-full items-center">
                <div className="hero h-50 bg-base-200 w-full md:w-4/5 m-auto">
                    <div className="hero-content text-center">
                        <div className="max-w-md">
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#CC6677] to-[#00AADD]">Create
                                an Organization</h1>
                            <p className="py-6">First of, you will want to setup and organization that will be the host
                                of your events.</p>
                            <button className="btn btn-primary" onClick={btnCreateOrganizer}>Get Started</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    function showOrganizer(organizer) {
        return (
            <div>
                {organizer.title} {organizer.website}
                <button className="btn btn-secondary" onClick={btnCreateOrganizer}>Edit</button>
            </div>
        );
    }

    //TODO: the default state should probably be a "loading" spinner
    return <>{organizer ? showOrganizer(organizer) : createOrganizer()}</>
};
