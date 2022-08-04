import type {NextPage} from "next";
import Head from "next/head";
import {EventView} from "../views";

const Admin: NextPage = (props) => {
    return (
        <>
            <Head>
                <title>Sesame - Event Manager</title>
                <meta name="description" content="Sesame Event Manager"/>
            </Head>
            <EventView/>
        </>
    );
};

export default Admin;
