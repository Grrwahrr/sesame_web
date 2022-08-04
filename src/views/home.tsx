import {FC} from 'react';

export const HomeView: FC = ({}) => {
    return (
        <div className="w-full items-center">
            <div className="hero h-50 bg-base-200 w-full md:w-4/5 m-auto">
                <div className="hero-content text-center">
                    <div className="max-w-md">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#CC6677] to-[#00AADD]">Tickets
                            for Your Event</h1>
                        <p className="py-6">Create events and tickets on the blockchain. Your customers will own their
                            data and tickets. And can choose to mint NFT POAPs.</p>
                        <button className="btn btn-primary">Get Started</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
