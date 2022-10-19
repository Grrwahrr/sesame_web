import {FC} from 'react';
import Link from "next/link";

import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {useAutoConnect} from '../contexts/AutoConnectProvider';

export const AppBar: FC = props => {
    const {autoConnect, setAutoConnect} = useAutoConnect();

    return (
        <div className="flex-none">

            {/* NavBar / Header */}
            <div className="navbar mb-10 shadow-lg bg-neutral text-neutral-content">
                <div className="navbar-start">
                    <label htmlFor="my-drawer" className="btn btn-square btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                             className="inline-block w-6 h-6 stroke-current">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </label>
                    <div className="p-2">
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#CC6677] to-[#00AADD]">
                            Ticket Sensei
                        </h1>
                    </div>
                </div>

                {/* Nav Links */}
                <div className="hidden md:flex navbar-center">
                    <div className="flex items-stretch">
                        <Link href="/">
                            <a className="btn btn-ghost btn-sm rounded-btn">Home</a>
                        </Link>
                        <Link href="/docs">
                            <a className="btn btn-ghost btn-sm rounded-btn">Documentation</a>
                        </Link>
                        <Link href="/admin">
                            <a className="btn btn-ghost btn-sm rounded-btn">Manage Event</a>
                        </Link>
                    </div>
                </div>

                {/* Wallet & Settings */}
                <div className="navbar-end bordered">
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} className="btn btn-square btn-ghost">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        </div>
                        <ul tabIndex={0}
                            className="p-3 shadow menu dropdown-content bg-neutral rounded-box w-52 outline outline-blue-500">
                            <li>
                                <div className="form-control">
                                    <label className="cursor-pointer label">
                                        <a>Autoconnect</a>
                                        <input type="checkbox" checked={autoConnect}
                                               onChange={(e) => setAutoConnect(e.target.checked)} className="toggle"/>
                                    </label>
                                </div>
                            </li>
                            <li><a>Main Net</a></li>
                            <li><a>Dev Net</a></li>
                            <li><a>Local Net</a></li>
                        </ul>
                    </div>
                    <WalletMultiButton className="btn btn-ghost mr-2"/>
                </div>
            </div>
            {props.children}
        </div>
    );
};
