import type {NextPage} from "next";
import Head from "next/head";
import {DocsView} from "../views";

const Docs: NextPage = (props) => {
    return (
        <>
            <Head>
                <title>Sesame - Documentation</title>
                <meta name="description" content="Sesame Documentation"/>
            </Head>
            <DocsView/>
        </>
    );
};

export default Docs;
