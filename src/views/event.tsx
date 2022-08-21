import {FC, useCallback, useEffect, useState} from 'react';
import {useAnchorWallet, useConnection, useWallet} from '@solana/wallet-adapter-react';
import {TransactionSignature} from "@solana/web3.js";
import {deriveEvent, deriveOrganizer, notifyTxError, notifyTxSuccess, ticketProgram} from "../utils/dapp_lib";
import Link from "next/link";
import {BN} from "@project-serum/anchor";


export const EventView: FC = () => {
    const {connection} = useConnection();
    const {publicKey} = useWallet();
    const anchorWallet = useAnchorWallet();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [view, setView] = useState<String>("events");
    const [organizer, setOrganizer] = useState<any>(undefined);
    const [events, setEvents] = useState<Array<any>>([]);

    const [editorOrganizer, setEditorOrganizer] = useState<any>(undefined);
    const [editorEvent, setEditorEvent] = useState<any>(undefined);

    const emptyOrganizer = {title: "", website: ""};
    const emptyEvent = {
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

    useEffect(() => {
        const fetchData = async () => {
            if (!publicKey) {
                return;
            }
            const program = ticketProgram(connection, anchorWallet);
            const [accDataOrganizer, bumpOrganizer] = await deriveOrganizer(program, publicKey);

            // Try to load organizer account
            let eventOffset = 0;
            try {
                const organizer = await program.account.organizer.fetch(accDataOrganizer);
                eventOffset = organizer.counterEvents;
                setOrganizer(organizer);
            } catch (e) {
                setIsLoading(false);
                return;
            }

            // Attempt to load all events
            for (let i = eventOffset - 1; i >= 0; i--) {
                const [accDataEvent, bumpEvent] = await deriveEvent(program, publicKey, i);

                try {
                    const event = await program.account.event.fetch(accDataEvent);
                    await upsertEvent({offset: i, ...event}, true)
                } catch (e) {
                }
            }

            setIsLoading(false);
        }
        fetchData().catch(console.error);
    }, [connection, publicKey, anchorWallet]);

    const btnSaveOrganizer = useCallback(async () => {
        console.log("Running Save Organizer");
        const program = ticketProgram(connection, anchorWallet);
        const [accDataOrganizer, bumpOrganizer] = await deriveOrganizer(program, publicKey);
        let organizer = undefined;
        try {
            organizer = await program.account.organizer.fetch(accDataOrganizer);
        } catch (error: any) {
        }


        if (editorOrganizer === undefined) {
            console.log("only save with modal open");
            return;
        }

        if (organizer) {
            if (organizer.title == editorOrganizer.title && organizer.website == editorOrganizer.website) {
                notifyTxError("No changes were made", "", "");
                return;
            }

            let tx: TransactionSignature = '';
            try {
                tx = await program.methods
                    .updateOrganizer(editorOrganizer.title, editorOrganizer.website)
                    .accounts({
                        authority: publicKey,
                        organizer: accDataOrganizer,
                    }).rpc();
                notifyTxSuccess("Organizer was updated", tx);
                setOrganizer(editorOrganizer);
            } catch (error: any) {
                notifyTxError("Could not update organizer", error, tx);
            }
        } else {
            let tx: TransactionSignature = '';
            try {
                tx = await program.methods
                    .createOrganizer(editorOrganizer.title, editorOrganizer.website)
                    .accounts({
                        payer: publicKey,
                        organizer: accDataOrganizer,
                    }).rpc();
                notifyTxSuccess("Organizer was created", tx);
                setOrganizer(editorOrganizer);
            } catch (error: any) {
                notifyTxError("Could not create organizer", error, tx);
            }
        }
    }, [publicKey, connection, editorOrganizer]);

    const btnSaveEvent = useCallback(async () => {
        console.log("Running Save Event");
        if (editorEvent === undefined) {
            console.log("only save with modal open");
            return;
        }

        const program = ticketProgram(connection, anchorWallet);
        const [accDataOrganizer, bumpOrganizer] = await deriveOrganizer(program, publicKey);
        let accountOffset = 0;

        // If the offset is not negative, we are editing some event
        if (editorEvent.offset >= 0) {
            accountOffset = editorEvent.offset;
        }
        // We will need the organizers counter to know what the next offset is
        else {
            const organizer = await program.account.organizer.fetch(accDataOrganizer);
            accountOffset = organizer.counterEvents;
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
                event.location == editorEvent.location) {

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

    const upsertEvent = useCallback(async (newEventData, append: boolean) => {
        let tmp = events;
        console.log("given newEventData", newEventData);

        // Attempt to update data
        let updated = false;
        for (let idx = 0; idx < tmp.length; idx++) {
            if (tmp[idx].offset === newEventData.offset) {
                tmp[idx] = newEventData;
                updated = true;
            }
        }

        // Prepend
        if (!updated) {
            if (append) {
                tmp.push(newEventData);
            } else {
                tmp.unshift(newEventData);
            }
        }

        setEvents(tmp);
    }, [events]);


    const createOrganizerHero = () => {
        return (
            <div className="w-full items-center">
                <div className="hero h-50 bg-base-300 w-full md:w-4/5 m-auto rounded-xl">
                    <div className="hero-content text-center">
                        <div className="max-w-md">
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#CC6677] to-[#00AADD]">Let&apos;s
                                get started!</h1>
                            <p className="py-6">First of, we should configure your event organizer account. You&apos;ll
                                need that to start creating events.</p>
                            <button className="btn btn-primary"
                                    onClick={() => {
                                        setEditorOrganizer(emptyOrganizer);
                                        setView("editOrganizer");
                                    }}>Create Organizer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const showMainView = () => {
        return (
            <>
                <div className="py-4">
                    Hello, {organizer.title}
                    <button className="mx-2 btn btn-xs btn-outline"
                            onClick={() => {
                                setEditorOrganizer(organizer);
                                setView("editOrganizer");
                            }}>Edit
                    </button>
                </div>
                <div className="tabs w-full">
                    <a className={"tab tab-lg tab-bordered " + (view === "events" ? "tab-active" : "")}
                       onClick={() => setView("events")}>Events</a>
                    <a className={"tab tab-lg tab-bordered " + (view === "passes" ? "tab-active" : "")}
                       onClick={() => setView("passes")}>Event Passes</a>
                    {editorOrganizer !== undefined ?
                        <a className={"tab tab-lg tab-bordered " + (view === "editOrganizer" ? "tab-active" : "")}
                           onClick={() => setView("editOrganizer")}>Organizer Editor</a> : ""}
                    {editorEvent !== undefined ?
                        <a className={"tab tab-lg tab-bordered " + (view === "editEvent" ? "tab-active" : "")}
                           onClick={() => setView("editEvent")}>Event Editor</a> : ""}
                    {/*{editorEventPass[0] ? <a className={"tab tab-lg tab-bordered " + (view==="editEventPass" ? "tab-active" : "")} onClick={() => setView("editEventPass")}>Event Pass Editor</a> : ""}*/}
                </div>
                {view === "events" ? showEventList() : ""}
                {view === "passes" ? showEventPassList() : ""}
                {view === "editOrganizer" ? showOrganizerEditor() : ""}
                {view === "editEvent" ? showEventEditor() : ""}
                {view === "editPass" ? showPassEditor() : ""}
            </>
        );
    }

    const showEventList = () => {
        return (
            <>
                <div className="flex flex-row flex-wrap">
                    {showEventCard({
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
                TODO :)
                {/*<div className="flex flex-row flex-wrap">*/}
                {/*    {showEventCard({*/}
                {/*        offset: -1,*/}
                {/*        title: "Create an Event",*/}
                {/*        artwork: "https://fs-prod-cdn.nintendo-europe.com/media/images/10_share_images/games_15/wii_24/SI_Wii_EACreate_image1600w.jpg"*/}
                {/*    })}*/}
                {/*    {events.map(event => showEventCard(event))}*/}
                {/*</div>*/}
            </>
        );
    }

    const showSpinner = () => {
        return <button className="btn loading">loading</button>
    }

    const showOrganizerEditor = () => {
        return <>
            <div>
                <h3 className="font-bold text-lg">{editorOrganizer ? 'Edit' : 'Create'} Organizer Data</h3>
                <div className="py-4">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">The name of your organization</span>
                        </label>
                        <input type="text" name="title" onChange={handleOrganizerChange}
                               value={editorOrganizer.title} placeholder="The Tea Party Organizer"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Link to your website</span>
                        </label>
                        <input type="text" name="website" onChange={handleOrganizerChange}
                               value={editorOrganizer.website} placeholder="https://www.theteapartyorganizer.xyz"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                </div>
                <div className="modal-action">
                    <button className="btn btn-md btn-primary" onClick={btnSaveOrganizer}>Save</button>
                    <button className="btn btn-md btn-warning"
                            onClick={() => {
                                setEditorOrganizer(undefined);
                                setView("events")
                            }}>Close
                    </button>
                </div>
            </div>
        </>
    }
    const handleOrganizerChange = (e) => {
        let tmp = editorOrganizer;
        tmp[e.target.name] = e.target.value;
        setEditorOrganizer(tmp);
    };

    const showEventEditor = () => {
        return <>
            <div>
                <h3 className="font-bold text-lg">Event data</h3>
                <div className="py-4">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">The name of your event</span>
                        </label>
                        <input type="text" name="title" onChange={handleEventChange} value={editorEvent.title}
                               placeholder="The Tea Party Meetup"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Link to event website</span>
                        </label>
                        <input type="text" name="website" onChange={handleEventChange} value={editorEvent.website}
                               placeholder="https://www.theteapartyorganizer.xyz"
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
                               value={editorEvent.location} placeholder="Earth, Milkyway, Universe"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Artwork</span>
                        </label>
                        <input type="text" name="artwork" onChange={handleEventChange} value={editorEvent.artwork}
                               placeholder="https://www.theteapartyorganizer.xyz/event.png"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Maximum number of tickets</span>
                        </label>
                        <input type="text" name="ticketsLimit" onChange={handleEventChange}
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
                {/* TODO: need a function to delete an individual ticket - requires seat_id - clarify this won't refund */}
                {/* TODO: need a function to delete all ticket accounts & the event itself - "Delete Event" DANGER ZONE */}
                <div className="modal-action">
                    <button className="btn btn-md btn-primary" onClick={btnSaveEvent}>Save</button>
                    <button className="btn btn-md btn-warning"
                            onClick={() => {
                                setEditorEvent(undefined)
                                setView("events")
                            }}>Close
                    </button>
                </div>
            </div>
        </>
    }
    const handleEventChange = (e) => {
        let tmp = editorEvent;
        if (e.target.name === 'timestamp') {
            const dateTime = new Date(e.target.value);
            const unixTime = (dateTime.getTime() / 1000) + (-60 * dateTime.getTimezoneOffset());
            tmp[e.target.name] = unixTime;
            console.log("unix time is: ", unixTime, " for: ", e.target.value);
        } else {
            tmp[e.target.name] = e.target.value;
        }
        setEditorEvent(tmp);
    };

    const showPassEditor = () => {
        return <>
            <div>
                TODO show event passes
            </div>
        </>
    }

    return <>
        {/*TODO: FIX INITIAL CREATION OF ORGANIZER*/}
        {isLoading ? showSpinner() : ''}
        {!isLoading && !organizer ? createOrganizerHero() : ''}
        {!isLoading && organizer ? showMainView() : ''}
    </>
};
