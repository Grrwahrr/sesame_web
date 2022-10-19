import type {NextPage} from "next";
import Head from "next/head";
import {DocsView} from "../views";

const Docs: NextPage = (props) => {
    return (
        <>
            <Head>
                <title>Ticket Sensei - Documentation</title>
                <meta name="description" content="Ticket Sensei Documentation"/>
            </Head>
            <DocsView/>
        </>
    );
};

export default Docs;
