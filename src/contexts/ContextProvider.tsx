import {WalletAdapterNetwork, WalletError} from '@solana/wallet-adapter-base';
import {ConnectionProvider, WalletProvider} from '@solana/wallet-adapter-react';
import {WalletModalProvider as ReactUIWalletModalProvider} from '@solana/wallet-adapter-react-ui';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
    LedgerWalletAdapter,
    // SlopeWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {FC, ReactNode, useCallback, useMemo} from 'react';
import {AutoConnectProvider, useAutoConnect} from './AutoConnectProvider';
import {notify} from "../utils/notifications";

const WalletContextProvider: FC<{ children: ReactNode }> = ({children}) => {
    const {autoConnect} = useAutoConnect();

    // TODO: WALLET ADAPTER IN GENERAL NEEDS WORK, CONNECTING DIFFERENT WALLETS, NETWORK, REFRESH, EVENTS

    {/* TODO: UPDATE CLUSTER PER NETWORK SETTINGS, ADD LOCALHOST + CUSTOMNET | ADAPTER REWORK */
    }
    // const network = WalletAdapterNetwork.Devnet;//TODO MYTODO
    // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const network = "http://127.0.0.1:8899";//TODO MYTODO
    const endpoint = useMemo(() => "http://127.0.0.1:8899", [network]);


    // const endpoint = useMemo(() => "http://127.0.0.1:8899", [network]);
    //const connection = new Connection("http://127.0.0.1:8899", "confirmed");
    //TODO MYTODO
    // Keypair.fromSeed(Uint8Array.from([
    //     174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
    //     222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
    //     15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
    //     121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
    // ]))
    // console.log(PublicKey.isOnCurve(key.toBytes()));

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new SolletWalletAdapter({network}),
            new SolletExtensionWalletAdapter({network}),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            // new SlopeWalletAdapter(),
        ],
        [network]
    );

    const onError = useCallback(
        (error: WalletError) => {
            notify({type: 'error', message: error.message ? `${error.name}: ${error.message}` : error.name});
            console.error(error);
        },
        []
    );

    return (
        // TODO: updates needed for updating and referencing endpoint: wallet adapter rework
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect}>
                <ReactUIWalletModalProvider>{children}</ReactUIWalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export const ContextProvider: FC<{ children: ReactNode }> = ({children}) => {
    return (
        <AutoConnectProvider>
            <WalletContextProvider>{children}</WalletContextProvider>
        </AutoConnectProvider>
    );
};
