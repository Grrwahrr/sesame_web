import type {NextPage} from "next";
import Head from "next/head";
import {EventView} from "../views";

const Admin: NextPage = (props) => {
    return (
        <>
            <Head>
                <title>Ticket Sensei - Manager</title>
                <meta name="description" content="Ticket Sensei Manager"/>
            </Head>
            <EventView/>
        </>
    );
};

export default Admin;
