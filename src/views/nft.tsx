import {FC} from "react";

export const NFTView: FC = ({}) => {

    return (
        <div className="hero mx-auto p-4 min-h-16 py-4">
            <div className="hero-content flex flex-col max-w-lg">
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#CC6677] to-[#00AADD]">
                    Mint an NFT
                </h1>
                <div className="p-2">
                    <p>NFTs could be minted here. Or on the organizers page. It does require a ticket with the secret,
                        event_key and seat_id</p>
                </div>
            </div>
        </div>
    );
};
