import type {NextPage} from "next";
import Head from "next/head";
import {HomeView} from "../views";

const Home: NextPage = (props) => {
    return (
        <>
            <Head>
                <title>Ticket Sensei</title>
                <meta name="description" content="Ticket Sensei"/>
            </Head>
            <HomeView/>
        </>
    );
};

export default Home;
