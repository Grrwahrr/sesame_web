import type {NextPage} from "next";
import Head from "next/head";
import {NFTView} from "../views";

const NFT: NextPage = (props) => {
    return (
        <>
            <Head>
                <title>Sesame - Mind NFT</title>
                <meta name="description" content="Sesame Mint NFT"/>
            </Head>
            <NFTView/>
        </>
    );
};

export default NFT;
