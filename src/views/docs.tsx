import {FC, useEffect} from "react";
import {SignMessage} from '../components/SignMessage';
import {SendTransaction} from '../components/SendTransaction';
import {RequestAirdrop} from "../components/RequestAirdrop";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import useUserSOLBalanceStore from "../stores/useUserSOLBalanceStore";

export const DocsView: FC = ({}) => {
    const wallet = useWallet();
    const {connection} = useConnection();

    const balance = useUserSOLBalanceStore((s) => s.balance)
    const {getUserSOLBalance} = useUserSOLBalanceStore()

    useEffect(() => {
        if (wallet.publicKey) {
            console.log(wallet.publicKey.toBase58())
            getUserSOLBalance(wallet.publicKey, connection)
        }
    }, [wallet.publicKey, connection, getUserSOLBalance])
    return (
        <div className="hero mx-auto p-4 min-h-16 py-4">
            <div className="hero-content flex flex-col max-w-lg">
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#CC6677] to-[#00AADD]">
                    Documentation
                </h1>
                {/* CONTENT GOES HERE */}
                <div className="p-2 text-center">
                    <SignMessage/>
                    <SendTransaction/>
                    <RequestAirdrop/>
                </div>
                <div className="text-center">
                    {wallet && <p>SOL Balance: {(balance || 0).toLocaleString()}</p>}
                </div>
            </div>
        </div>
    );
};
