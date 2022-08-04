import {useConnection, useWallet} from '@solana/wallet-adapter-react';
import {LAMPORTS_PER_SOL, TransactionSignature} from '@solana/web3.js';
import {FC, useCallback} from 'react';
import {notify} from "../utils/notifications";
import useUserSOLBalanceStore from '../stores/useUserSOLBalanceStore';
import {notifyTxError} from "../utils/dapp_lib";

export const RequestAirdrop: FC = () => {
    const {connection} = useConnection();
    const {publicKey} = useWallet();
    const {getUserSOLBalance} = useUserSOLBalanceStore();

    const onClick = useCallback(async () => {
        if (!publicKey) {
            console.log('error', 'Wallet not connected!');
            notify({type: 'error', message: 'error', description: 'Wallet not connected!'});
            return;
        }

        let signature: TransactionSignature = '';

        try {
            signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
            await connection.confirmTransaction(signature, 'confirmed');
            notify({type: 'success', message: 'Airdrop successful!', txid: signature});

            getUserSOLBalance(publicKey, connection);
        } catch (error: any) {
            notifyTxError("Airdrop failed", error, signature);
        }
    }, [publicKey, connection, getUserSOLBalance]);

    return (
        <div>
            <button
                className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#CC6677] to-[#00AADD] hover:from-pink-500 hover:to-yellow-500 ..."
                onClick={onClick}
            ><span>Airdrop 1 </span></button>
        </div>
    );
};

