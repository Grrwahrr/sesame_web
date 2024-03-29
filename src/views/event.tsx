import {FC, useCallback, useEffect, useState} from 'react';
import {useAnchorWallet, useConnection, useWallet} from '@solana/wallet-adapter-react';
import {TransactionSignature} from "@solana/web3.js";
import {
    deriveEvent,
    deriveEventPass,
    deriveOrganizer, getKeyPairForSecretKeyBase58,
    notifyTxError,
    notifyTxSuccess,
    ticketProgram
} from "../utils/solana";
import Link from "next/link";
import {BN} from "@project-serum/anchor";
import QRCode from "react-qr-code";


export const EventView: FC = () => {
    const {connection} = useConnection();
    const {publicKey} = useWallet();
    const anchorWallet = useAnchorWallet();

    const [view, setView] = useState<String>("loading");
    const [organizer, setOrganizer] = useState<any>({offset: -1, title: "", website: ""});
    const [events, setEvents] = useState<Array<any>>([]);
    const [passes, setPasses] = useState<Array<any>>([]);

    const [editorEvent, setEditorEvent] = useState<any>(undefined);
    const [editorPass, setEditorPass] = useState<any>(undefined);

    const [secretKey, setSecretKey] = useState<any>(undefined);

    const emptyEvent = {
        pubKey: 0,
        offset: -1,
        ticketsLimit: "",
        ticketsIssued: "",
        timestamp: Math.floor(Date.now() / 1000),
        locationType: 0,
        location: "",
        title: "",
        website: "",
        artwork: "",
        ticketAuthorityIssuer: "",
        ticketAuthorityDelete: "",
        ticketAuthorityCheckIn: "",
    };
    const emptyPass = {
        offset: -1,
        passAuthorityIssuer: "",
        passAuthorityDelete: "",
        limitTickets: "",
        limitHolders: "",
        title: "",
        website: "",
        artwork: "",
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!publicKey) {
                return;
            }
            const program = ticketProgram(connection, anchorWallet);
            const [accDataOrganizer, bumpOrganizer] = await deriveOrganizer(program, publicKey);

            // Try to load organizer account
            let offsetEvent: any = 0;
            let offsetPass: any = 0;
            try {
                const chainOrganizer = await program.account.organizer.fetch(accDataOrganizer);
                offsetEvent = chainOrganizer.counterEvents;
                offsetPass = chainOrganizer.counterPasses;
                setOrganizer({offset: 1, ...chainOrganizer});
            } catch (e) {
                setView("init");
                return;
            }

            // Attempt to load all events
            for (let i = offsetEvent - 1; i >= 0; i--) {
                const [accDataEvent, bumpEvent] = await deriveEvent(program, publicKey, i);

                try {
                    const event = await program.account.event.fetch(accDataEvent);
                    await upsertEvent({pubKey: accDataEvent, offset: i, ...event}, true)
                } catch (e) {
                }
            }

            // Attempt to load all passes
            for (let i = offsetPass - 1; i >= 0; i--) {
                const [accDataPass, bumpEvent] = await deriveEventPass(program, publicKey, i);

                try {
                    const eventPass = await program.account.eventPass.fetch(accDataPass);
                    await upsertPass({offset: i, ...eventPass}, true)
                } catch (e) {
                }
            }

            setView("events");
        }
        fetchData().catch(console.error);
    }, [connection, publicKey, anchorWallet]);

    const btnSaveOrganizer = useCallback(async () => {
        console.log("Running Save Organizer");
        const program = ticketProgram(connection, anchorWallet);
        const [accDataOrganizer, bumpOrganizer] = await deriveOrganizer(program, publicKey);
        let chainOrganizer = undefined;
        try {
            chainOrganizer = await program.account.organizer.fetch(accDataOrganizer);
        } catch (error: any) {
        }


        if (organizer === undefined) {
            console.log("Organizer has no data");
            return;
        }

        if (chainOrganizer) {
            if (chainOrganizer.title == organizer.title && chainOrganizer.website == organizer.website) {
                notifyTxError("No changes were made", "", "");
                return;
            }

            let tx: TransactionSignature = '';
            try {
                tx = await program.methods
                    .updateOrganizer(organizer.title, organizer.website)
                    .accounts({
                        authority: publicKey,
                        organizer: accDataOrganizer,
                    }).rpc();
                notifyTxSuccess("Organizer was updated", tx);
            } catch (error: any) {
                notifyTxError("Could not update organizer", error, tx);
            }
        } else {
            let tx: TransactionSignature = '';
            try {
                tx = await program.methods
                    .createOrganizer(organizer.title, organizer.website)
                    .accounts({
                        payer: publicKey,
                        organizer: accDataOrganizer,
                    }).rpc();
                notifyTxSuccess("Organizer was created", tx);
                setOrganizer({...organizer, offset: 1});
                setView("events");
            } catch (error: any) {
                notifyTxError("Could not create organizer", error, tx);
            }
        }
    }, [publicKey, connection, organizer]);

    const btnSaveEvent = useCallback(async () => {
        console.log("Running Save Event");
        if (editorEvent === undefined) {
            console.log("Event has no data");
            return;
        }

        const program = ticketProgram(connection, anchorWallet);
        const [accDataOrganizer, bumpOrganizer] = await deriveOrganizer(program, publicKey);
        let accountOffset: any = 0;

        // If the offset is not negative, we are editing some event
        if (editorEvent.offset >= 0) {
            accountOffset = editorEvent.offset;
        }
        // We will need the organizers counter to know what the next offset is
        else {
            const chainOrganizer = await program.account.organizer.fetch(accDataOrganizer);
            accountOffset = chainOrganizer.counterEvents;
        }

        // Derive account address & load it
        const [accDataEvent, bumpEvent] = await deriveEvent(program, publicKey, accountOffset);
        let event = undefined;
        try {
            event = await program.account.event.fetch(accDataEvent);
        } catch (error: any) {
        }

        // Time to BN
        const unixTimeBN = new BN(editorEvent.timestamp)

        // Editing an existing event
        if (event) {
            // Make sure the data was changed
            if (event.title == editorEvent.title &&
                event.website == editorEvent.website &&
                event.artwork == editorEvent.artwork &&
                event.ticketsLimit == editorEvent.ticketsLimit &&
                event.timestamp == editorEvent.timestamp &&
                event.location == editorEvent.location &&
                event.ticketAuthorityIssuer == editorEvent.ticketAuthorityIssuer &&
                event.ticketAuthorityDelete == editorEvent.ticketAuthorityDelete &&
                event.ticketAuthorityCheckIn == editorEvent.ticketAuthorityCheckIn) {

                notifyTxError("No changes were made", "", "");
                return;
            }

            let tx: TransactionSignature = '';
            try {
                tx = await program.methods
                    .updateEvent(editorEvent.offset, editorEvent.title, editorEvent.website, editorEvent.ticketsLimit, unixTimeBN, editorEvent.locationType, editorEvent.location, editorEvent.artwork)
                    .accounts({
                        authority: publicKey,
                        event: accDataEvent,
                        ticketAuthorityIssuer: editorEvent.ticketAuthorityIssuer,
                        ticketAuthorityDelete: editorEvent.ticketAuthorityDelete,
                        ticketAuthorityCheckIn: editorEvent.ticketAuthorityCheckIn,
                    }).rpc();
                notifyTxSuccess("Event was updated", tx);
                await upsertEvent({offset: accountOffset, ...editorEvent}, false);
            } catch (error: any) {
                notifyTxError("Could not update event", error, tx);
            }
        } else { // Creating a new event
            let tx: TransactionSignature = '';
            try {
                tx = await program.methods
                    .createEvent(editorEvent.title, editorEvent.website, editorEvent.ticketsLimit, unixTimeBN, editorEvent.locationType, editorEvent.location, editorEvent.artwork)
                    .accounts({
                        payer: publicKey,
                        donateTo: publicKey,//TODO: donate to me
                        organizer: accDataOrganizer,
                        ticketAuthorityIssuer: editorEvent.ticketAuthorityIssuer,
                        ticketAuthorityDelete: editorEvent.ticketAuthorityDelete,
                        ticketAuthorityCheckIn: editorEvent.ticketAuthorityCheckIn,
                        event: accDataEvent,
                    }).rpc();
                notifyTxSuccess("Event was created", tx);
                editorEvent.offset = accountOffset;
                await upsertEvent(editorEvent, false);
            } catch (error: any) {
                notifyTxError("Could not create event", error, tx);
            }
        }
    }, [publicKey, connection, editorEvent]);

    const btnSavePass = useCallback(async () => {
        console.log("Running Save Pass");
        if (editorPass === undefined) {
            console.log("Pass has no data");
            return;
        }

        const program = ticketProgram(connection, anchorWallet);
        const [accDataOrganizer, bumpOrganizer] = await deriveOrganizer(program, publicKey);
        let accountOffset: any = 0;

        // If the offset is not negative, we are editing some pass
        if (editorPass.offset >= 0) {
            accountOffset = editorPass.offset;
        }
        // We will need the organizers counter to know what the next offset is
        else {
            const chainOrganizer = await program.account.organizer.fetch(accDataOrganizer);
            accountOffset = chainOrganizer.counterPasses;
        }

        // Derive account address & load it
        const [accDataPass, bumpPass] = await deriveEventPass(program, publicKey, accountOffset);
        let pass = undefined;
        try {
            pass = await program.account.eventPass.fetch(accDataPass);
        } catch (error: any) {
        }

        // Editing an existing pass
        if (pass) {
            // Make sure the data was changed
            if (pass.title == editorPass.title &&
                pass.website == editorPass.website &&
                pass.artwork == editorPass.artwork &&
                pass.limitTickets == editorPass.limitTickets &&
                pass.limitHolders == editorPass.limitHolders &&
                pass.passAuthorityIssuer == editorPass.passAuthorityIssuer &&
                pass.passAuthorityDelete == editorPass.passAuthorityDelete) {

                notifyTxError("No changes were made", "", "");
                return;
            }

            let tx: TransactionSignature = '';//TODO do not have an update pass function
            // try {
            //     tx = await program.methods
            //         .updatePass(editorPass.offset, editorPass.title, editorPass.website, editorPass.artwork, editorPass.limitTickets, editorPass.limitHolders)
            //         .accounts({
            //             authority: publicKey,
            //             pass: accDataPass,
            //             ticketAuthorityIssuer: editorPass.ticketAuthorityIssuer,
            //             ticketAuthorityDelete: editorPass.ticketAuthorityDelete,
            //             ticketAuthorityCheckIn: editorPass.ticketAuthorityCheckIn,
            //         }).rpc();
            //     notifyTxSuccess("Pass was updated", tx);
            //     await upsertPass({offset: accountOffset, ...editorPass}, false);
            // } catch (error: any) {
            //     notifyTxError("Could not update pass", error, tx);
            // }
        } else { // Creating a new pass
            let tx: TransactionSignature = '';
            try {
                tx = await program.methods
                    .createEventPass(editorPass.title, editorPass.website, editorPass.artwork, editorPass.limitTickets, editorPass.limitHolders)
                    .accounts({
                        payer: publicKey,
                        organizer: accDataOrganizer,
                        passAuthorityIssuer: editorPass.passAuthorityIssuer,
                        passAuthorityDelete: editorPass.passAuthorityDelete,
                        eventPass: accDataPass
                    }).rpc();
                notifyTxSuccess("Pass was created", tx);
                editorPass.offset = accountOffset;
                await upsertPass(editorPass, false);
            } catch (error: any) {
                notifyTxError("Could not create pass", error, tx);
            }
        }
    }, [publicKey, connection, editorPass]);

    const upsertEvent = useCallback(async (newEventData, append: boolean) => {
        let tmp = events;
        console.log("UPSERT given event", newEventData);

        tmp = upsert(tmp, newEventData, append);
        setEvents(tmp);
    }, [events]);

    const upsertPass = useCallback(async (newPassData, append: boolean) => {
        let tmp = passes;
        console.log("UPSERT given pass: ", newPassData);

        tmp = upsert(tmp, newPassData, append);
        setPasses(tmp);
    }, [passes]);

    const upsert = (data, item, append: boolean) => {
        // Attempt to update data
        for (let idx = 0; idx < data.length; idx++) {
            if (data[idx].offset === item.offset) {
                data[idx] = item;
                return data;
            }
        }

        // Prepend
        if (append) {
            data.push(item);
        } else {
            data.unshift(item);
        }

        return data;
    }

    const createOrganizerHero = () => {
        return (
            <>
                <div className="w-full items-center">
                    <div className="hero h-50 bg-base-300 w-full md:w-4/5 m-auto rounded-xl">
                        <div className="hero-content text-center">
                            <div className="max-w-md">
                                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#CC6677] to-[#00AADD]">Let&apos;s
                                    get started!</h1>
                                <p className="py-6">First of, we should configure your event organizer account.
                                    You&apos;ll
                                    need that to start creating events.</p>

                                <div className="py-4">
                                    {showOrganizerForm()}
                                </div>

                                <button className="btn btn-primary"
                                        onClick={btnSaveOrganizer}>Create Organizer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const showMainView = () => {
        return (
            <>
                <div className="py-4">
                    Hello, {organizer.title}
                    <button className="mx-2 btn btn-xs btn-outline"
                            onClick={() => {
                                setView("editOrganizer");
                            }}>Edit
                    </button>
                </div>
                <div className="tabs w-full">
                    <a className={"tab tab-lg tab-bordered " + (view === "events" ? "tab-active" : "")}
                       onClick={() => setView("events")}>Events</a>
                    <a className={"tab tab-lg tab-bordered " + (view === "passes" ? "tab-active" : "")}
                       onClick={() => setView("passes")}>Event Passes</a>
                    {view === "editOrganizer" ?
                        <a className={"tab tab-lg tab-bordered " + (view === "editOrganizer" ? "tab-active" : "")}
                           onClick={() => setView("editOrganizer")}>Organizer Editor</a> : ""}
                    {editorEvent !== undefined ?
                        <a className={"tab tab-lg tab-bordered " + (view === "editEvent" ? "tab-active" : "")}
                           onClick={() => setView("editEvent")}>Event Editor</a> : ""}
                    {editorPass !== undefined ?
                        <a className={"tab tab-lg tab-bordered " + (view === "editPass" ? "tab-active" : "")}
                           onClick={() => setView("editPass")}>Event Pass Editor</a> : ""}
                </div>
                {view === "events" ? showEventList() : ""}
                {view === "passes" ? showEventPassList() : ""}
                {view === "editOrganizer" ? showOrganizerEditor() : ""}
                {view === "editEvent" ? showEventEditor() : ""}
                {view === "editPass" ? showPassEditor() : ""}
                {view === "editPassEvents" ? showPassEventsEditor() : ""}
            </>
        );
    }

    const showEventList = () => {
        return (
            <>
                <div className="flex flex-row flex-wrap">
                    {showEventCard({
                        pubKey: 0,
                        offset: -1,
                        title: "Create an Event",
                        artwork: "https://fs-prod-cdn.nintendo-europe.com/media/images/10_share_images/games_15/wii_24/SI_Wii_EACreate_image1600w.jpg"
                    })}
                    {events.map(event => showEventCard(event))}
                </div>
            </>
        );
    }
    const showEventCard = (event) => {
        return (
            <div className="p-5 w-full basis-1/1 md:basis-1/2 lg:basis-1/4" key={event.offset}>
                <div className="h-full card bg-neutral bg-base-300">
                    <figure><img src={event.artwork} alt="Image"/></figure>
                    <div className="card-body">
                        <h2 className="card-title">
                            {event.title}
                            {/*<div className="mx-2 badge badge-secondary">NEW</div>*/}
                        </h2>
                        {
                            event.offset >= 0 ?
                                <>
                                    {showEventTime(event.timestamp)}
                                    {showEventLocation(event.locationType, event.location)}
                                    {showEventTickets(event.ticketsIssued, event.ticketsLimit)}
                                    <div className="h-full items-end card-actions justify-end">
                                        <button className="btn btn-sm btn-secondary"
                                                onClick={() => {
                                                    setEditorEvent(event)
                                                    setView("editEvent")
                                                }}>Edit
                                        </button>
                                        <Link href={event.website}><a target="_blank"
                                                                      className="btn btn-sm btn-outline">Website</a></Link>
                                    </div>
                                </>
                                :
                                <>
                                    <p className="py-5">Feel like hosting another event?</p>
                                    <div className="h-full items-end card-actions justify-end">
                                        <button
                                            className="btn btn-sm animate-pulse bg-gradient-to-r from-[#CC6677] to-[#00AADD] hover:from-pink-500 hover:to-yellow-500 ..."
                                            onClick={() => {
                                                setEditorEvent(emptyEvent)
                                                setView("editEvent")
                                            }}>Create new event
                                        </button>
                                    </div>
                                </>
                        }
                    </div>
                </div>
            </div>
        );
    }
    const showEventTime = (time) => {
        let dateTime = new Date(time * 1000);
        return <p><b>Time:</b><span className="float-right">{dateTime.toLocaleString(undefined, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</span></p>
    }
    const showEventLocation = (type, location) => {
        if (type === "URL") {
            return <p><b>Location:</b><span className="float-right"><Link href={location}><a
                target="_blank">{location}</a></Link></span></p>
        } else if (type === "GPS") {
            return <p><b>Location:</b><span className="float-right"><Link
                href={"https://www.google.com/maps/place/" + location}><a target="_blank">{location}</a></Link></span>
            </p>
        }
        return <p><b>Location:</b><span className="float-right">{location}</span></p>
    }
    const showEventTickets = (issued, total) => {
        return <>
            <p><b>Tickets:</b><span className="float-right">{issued} / {total}</span></p>
            <progress className="my-2 min-h-[6px] progress progress-info" value={issued} max={total}></progress>
        </>
    }

    const showEventPassList = () => {
        return (
            <>
                <div className="flex flex-row flex-wrap">
                    {showEventPassCard({
                        offset: -1,
                        title: "Create an Event Pass",
                        artwork: "https://fs-prod-cdn.nintendo-europe.com/media/images/10_share_images/games_15/wii_24/SI_Wii_EACreate_image1600w.jpg"
                    })}
                    {passes.map(pass => showEventPassCard(pass))}
                </div>
            </>
        );
    }
    const showEventPassCard = (pass) => {
        return (
            <div className="p-5 w-full basis-1/1 md:basis-1/2 lg:basis-1/4" key={pass.offset}>
                <div className="h-full card bg-neutral bg-base-300">
                    <figure><img src={pass.artwork} alt="Image"/></figure>
                    <div className="card-body">
                        <h2 className="card-title">
                            {pass.title}
                            {/*<div className="mx-2 badge badge-secondary">NEW</div>*/}
                        </h2>
                        {
                            pass.offset >= 0 ?
                                <>
                                    <p><b>Tickets per user:</b><span className="float-right">{pass.limitTickets}</span>
                                    </p>
                                    {showPassHolders(pass.counterHolders, pass.limitHolders)}
                                    <div className="h-full items-end card-actions justify-end">
                                        <button className="btn btn-sm btn-info"
                                                onClick={() => {
                                                    setView("editPassEvents")
                                                }}>Add Events
                                        </button>
                                        <button className="btn btn-sm btn-secondary"
                                                onClick={() => {
                                                    setEditorPass(pass)
                                                    setView("editPass")
                                                }}>Edit
                                        </button>
                                        <Link href={pass.website}><a target="_blank"
                                                                     className="btn btn-sm btn-outline">Website</a></Link>
                                    </div>
                                </>
                                :
                                <>
                                    <p className="py-5">Create a new Event Pass?</p>
                                    <div className="h-full items-end card-actions justify-end">
                                        <button
                                            className="btn btn-sm animate-pulse bg-gradient-to-r from-[#CC6677] to-[#00AADD] hover:from-pink-500 hover:to-yellow-500 ..."
                                            onClick={() => {
                                                setEditorPass(emptyPass)
                                                setView("editPass")
                                            }}>Create new event pass
                                        </button>
                                    </div>
                                </>
                        }
                    </div>
                </div>
            </div>
        );
    }
    const showPassHolders = (issued, total) => {
        return <>
            <p><b>Holders:</b><span className="float-right">{issued} / {total}</span></p>
            <progress className="my-2 min-h-[6px] progress progress-info" value={issued} max={total}></progress>
        </>
    }

    const showSpinner = () => {
        return <button className="btn loading">loading</button>
    }

    const showOrganizerEditor = () => {
        return <>
            <div className="p-2 w-full md:w-4/5">
                {/*<h3 className="font-bold text-lg">{organizer.offset<1 ? 'Create' : 'Edit'} Organizer Data</h3>*/}
                <div className="py-4">
                    {showOrganizerForm()}
                </div>
                <div className="modal-action">
                    <button className="btn btn-md btn-primary" onClick={btnSaveOrganizer}>Save</button>
                    <button className="btn btn-md btn-warning"
                            onClick={() => {
                                setView("events")
                            }}>Close
                    </button>
                </div>
            </div>
        </>
    }
    const showOrganizerForm = () => {
        return <>
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">The name of your organization</span>
                </label>
                <input type="text" name="title" onChange={handleOrganizerChange}
                       value={organizer.title} placeholder="Film Festival Organizer"
                       className="input input-bordered input-primary w-full"/>
            </div>
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Link to your website</span>
                </label>
                <input type="text" name="website" onChange={handleOrganizerChange}
                       value={organizer.website} placeholder="https://www.thefilmfestival.xyz"
                       className="input input-bordered input-primary w-full"/>
            </div>
        </>
    };
    const handleOrganizerChange = useCallback((e) => {
        const {name, value} = e.target;
        setOrganizer({...organizer, [name]: value});
    }, [organizer]);

    const showEventEditor = () => {
        return <>
            <div className="p-2 w-full md:w-4/5">
                <div className="py-4">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">The name of your event</span>
                        </label>
                        <input type="text" name="title" onChange={handleEventChange} value={editorEvent.title}
                               placeholder="The Film Festival"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Link to event website</span>
                        </label>
                        <input type="text" name="website" onChange={handleEventChange} value={editorEvent.website}
                               placeholder="https://www.thefilmfestival.xyz"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Date & Time</span>
                        </label>
                        <input type="datetime-local" name="timestamp" onChange={handleEventChange}
                               value={new Date(editorEvent.timestamp * 1000).toISOString().substring(0, 16)}
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Location</span>
                        </label>
                        <input type="text" name="location" onChange={handleEventChange}
                               value={editorEvent.location} placeholder="Earth, Milky Way, Universe"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Artwork</span>
                        </label>
                        <input type="text" name="artwork" onChange={handleEventChange} value={editorEvent.artwork}
                               placeholder="https://www.thefilmfestival.xyz/event.png"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Maximum number of tickets</span>
                        </label>
                        <input type="number" name="ticketsLimit" onChange={handleEventChange}
                               value={editorEvent.ticketsLimit} placeholder="100"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Ticket issuance authority</span>
                        </label>
                        <input type="text" name="ticketAuthorityIssuer" onChange={handleEventChange}
                               value={editorEvent.ticketAuthorityIssuer} placeholder="Account Address"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Ticket delete authority</span>
                        </label>
                        <input type="text" name="ticketAuthorityDelete" onChange={handleEventChange}
                               value={editorEvent.ticketAuthorityDelete} placeholder="Account Address"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Ticket check in authority</span>
                        </label>
                        <input type="text" name="ticketAuthorityCheckIn" onChange={handleEventChange}
                               value={editorEvent.ticketAuthorityCheckIn} placeholder="Account Address"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                </div>
                <div className="modal-action">
                    <button className="btn btn-md btn-primary" onClick={btnSaveEvent}>Save</button>
                    <button className="btn btn-md btn-warning"
                            onClick={() => {
                                setEditorEvent(undefined)
                                setView("events")
                            }}>Close
                    </button>
                </div>
                {showEventDetails()}
            </div>
        </>
    }
    const showEventDetails = () => {
        // Do not show when creating new events
        if (editorEvent.offset < 0) {
            return <></>
        }

        let qr = <p className="my-5">Enter the secret key for the ticket check in authority to generate a qr code that
            can be used to configure the ticket scanner app.</p>

        let keyPair = getKeyPairForSecretKeyBase58(secretKey);
        if (keyPair && keyPair.publicKey.toBase58() === editorEvent.ticketAuthorityCheckIn.toBase58()) {
            let encoded = Buffer.from(JSON.stringify(
                {na: editorEvent.title, sc: secretKey, ev: editorEvent.pubKey}
            )).toString('base64');
            qr = <>
                <div className="my-5">
                    <QRCode className="m-auto" value={encoded}/>
                </div>
                <p>Use this code to configure the ticket reader application. You will need to provide the secret key
                    for the account that is the ticket check in authority.</p>
            </>
        }
        return <>
            <hr className="my-5"/>
            <div className="py-4">
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Event Public Key</span>
                    </label>
                    <input readOnly type="text" name="eventPubKey" value={editorEvent.pubKey}
                           className="input input-bordered input-primary w-full"/>
                </div>
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Check in authority (Secret Key)</span>
                    </label>
                    <input type="text" name="website" value={secretKey} onChange={updateSecret}
                           className="input input-bordered input-primary w-full"/>
                </div>
                {qr}
            </div>
        </>
    }
    const handleEventChange = (e) => {
        let {name, value} = e.target;
        if (name === 'timestamp') {
            const dateTime = new Date(value);
            const unixTime = (dateTime.getTime() / 1000) + (-60 * dateTime.getTimezoneOffset());
            console.log("unix time is: ", unixTime, " for: ", value);
            value = unixTime;
        }
        setEditorEvent({...editorEvent, [name]: value});
    };

    const updateSecret = (e) => {
        setSecretKey(e.target.value)
    };

    const showPassEditor = () => {
        return <>
            <div className="p-2 w-full md:w-4/5">
                <div className="py-4">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">The name of your event pass</span>
                        </label>
                        <input type="text" name="title" onChange={handlePassChange} value={editorPass.title}
                               placeholder="Film Festival Event Pass"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Link to event pass website</span>
                        </label>
                        <input type="text" name="website" onChange={handlePassChange} value={editorPass.website}
                               placeholder="https://www.thefilmfestival.xyz"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Artwork</span>
                        </label>
                        <input type="text" name="artwork" onChange={handlePassChange} value={editorPass.artwork}
                               placeholder="https://www.thefilmfestival.xyz/event.png"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Maximum number of tickets per user</span>
                        </label>
                        <input type="number" name="limitTickets" onChange={handlePassChange}
                               value={editorPass.limitTickets} placeholder="5"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Maximum number of passes that can be created</span>
                        </label>
                        <input type="number" name="limitHolders" onChange={handlePassChange}
                               value={editorPass.limitHolders} placeholder="200"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Ticket issuance authority</span>
                        </label>
                        <input type="text" name="passAuthorityIssuer" onChange={handlePassChange}
                               value={editorPass.passAuthorityIssuer} placeholder="Account Address"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Ticket delete authority</span>
                        </label>
                        <input type="text" name="passAuthorityDelete" onChange={handlePassChange}
                               value={editorPass.passAuthorityDelete} placeholder="Account Address"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                </div>
                <div className="modal-action">
                    <button className="btn btn-md btn-primary" onClick={btnSavePass}>Save</button>
                    <button className="btn btn-md btn-warning"
                            onClick={() => {
                                setEditorPass(undefined)
                                setView("passes")
                            }}>Close
                    </button>
                </div>
            </div>
        </>
    }
    const handlePassChange = (e) => {
        let {name, value} = e.target;
        setEditorPass({...editorPass, [name]: value});
    };

    const showPassEventsEditor = () => {
        return <>
            TODO
        </>
    };

    return <>
        {view === "loading" ? showSpinner() : ""}
        {view !== "loading" && organizer.offset < 0 ? createOrganizerHero() : ''}
        {view !== "loading" && organizer.offset > 0 ? showMainView() : ''}
    </>
};

/*

// TODO edit passed
// TODO add an event to a pass

//TODO break this up in 2 files

//TODO do I need quicknode.com (apparently docu says do not use public one)
use code STOCKHOLM299
bit.ly/stockholmhh

TODO: need a function to delete an individual ticket - requires seat_id - clarify this won't refund
TODO: need a function to delete all ticket accounts & the event itself - "Delete Event" DANGER ZONE

//         title: "Awesome Film Festival",
//         website: "https://www.google.com",
//         artwork: "https://blog.walls.io/wp-content/uploads/2017/02/ideas-for-making-event-more-social.jpg"

//         title: "Crazy Horse Show",
//         website: "https://www.google.com",
//         artwork: "https://intheory.events/wp-content/uploads/2020/11/op_livestreaming_event_stage-1-1536x864.jpg"

//         title: "Tea Drinking Meetup",
//         website: "https://www.google.com",
//         artwork: "https://myhaneerbil.com/wp-content/uploads/960x0.jpg"
 */