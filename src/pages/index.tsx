import type {NextPage} from "next";
import Head from "next/head";
import {HomeView} from "../views";

const Home: NextPage = (props) => {
    return (
        <>
            <Head>
                <title>Sesame Tickets</title>
                <meta name="description" content="Sesame Tickets"/>
            </Head>
            <HomeView/>
        </>
    );
};

export default Home;
