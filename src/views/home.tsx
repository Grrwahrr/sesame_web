import {FC} from 'react';
import Link from "next/link";

export const HomeView: FC = ({}) => {
    return (
        <div className="w-full items-center">
            <div className="hero h-50 bg-base-300 w-full md:w-4/5 m-auto rounded-xl">
                <div className="hero-content text-center">
                    <div className="max-w-md">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#CC6677] to-[#00AADD]">Tickets
                            for Your Event</h1>
                        <p className="py-6">Create events and tickets on the blockchain. Your customers will own their
                            data and tickets.</p>
                        <Link href="/admin">
                            <a className="btn btn-primary rounded-btn">Get Started</a>
                        </Link>
                    </div>
                </div>
            </div>

            <p className="p-5 w-full md:w-3/5 m-auto">The Sesame ticket system runs on the public Solana blockchain. The
                blockchains high throughput and speed enables Sesame to handle large events. This app does not store
                data for you. Thus this app can be used for free. Interacting with the blockchain does however require
                some amount of SOL tokens.</p>

            <div className="hero h-50 bg-base-300 w-full md:w-4/5 m-auto rounded-xl">
                <div className="hero-content text-center">
                    <div className="max-w-md">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#CC6677] to-[#00AADD]">NFTs
                            for your audience</h1>
                        <p className="py-6">Sesame is a blockchain based application. As such, it is possible for your
                            audience to create their own NFT. This NFT is of the POAP kind (Proof of Attendance /
                            Participation)</p>
                        <Link href="/docs">
                            <a className="btn btn-primary rounded-btn">Read the docs</a>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
