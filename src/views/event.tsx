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
    const [organizer, setOrganizer] = useState<any>(undefined);
    const [events, setEvents] = useState<Array<any>>([]);

    const [editorOrganizer, setEditorOrganizer] = useState<[boolean, any]>([false, undefined]);
    const [editorEvent, setEditorEvent] = useState<[boolean, any]>([false, undefined]);

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


        if (!editorOrganizer[0]) {
            console.log("only save with modal open");
            return;
        }

        if (organizer) {
            if (organizer.title == editorOrganizer[1].title && organizer.website == editorOrganizer[1].website) {
                notifyTxError("No changes were made", "", "");
                return;
            }

            let tx: TransactionSignature = '';
            try {
                tx = await program.methods
                    .updateOrganizer(editorOrganizer[1].title, editorOrganizer[1].website)
                    .accounts({
                        authority: publicKey,
                        organizer: accDataOrganizer,
                    }).rpc();
                notifyTxSuccess("Organizer was updated", tx);
                setOrganizer(editorOrganizer[1]);
            } catch (error: any) {
                notifyTxError("Could not update organizer", error, tx);
            }
        } else {
            let tx: TransactionSignature = '';
            try {
                tx = await program.methods
                    .createOrganizer(editorOrganizer[1].title, editorOrganizer[1].website)
                    .accounts({
                        payer: publicKey,
                        organizer: accDataOrganizer,
                    }).rpc();
                notifyTxSuccess("Organizer was created", tx);
                setOrganizer(editorOrganizer[1]);
            } catch (error: any) {
                notifyTxError("Could not create organizer", error, tx);
            }
        }
    }, [publicKey, connection, editorOrganizer]);

    const btnSaveEvent = useCallback(async () => {
        console.log("Running Save Event");
        if (!editorEvent[0]) {
            console.log("only save with modal open");
            return;
        }

        const program = ticketProgram(connection, anchorWallet);
        const [accDataOrganizer, bumpOrganizer] = await deriveOrganizer(program, publicKey);
        let accountOffset = 0;

        // If the offset is not negative, we are editing some event
        if (editorEvent[1].offset >= 0) {
            accountOffset = editorEvent[1].offset;
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
        const unixTimeBN = new BN(editorEvent[1].timestamp)

        // Editing an existing event
        if (event) {
            // Make sure the data was changed
            if (event.title == editorEvent[1].title &&
                event.website == editorEvent[1].website &&
                event.artwork == editorEvent[1].artwork &&
                event.ticketsLimit == editorEvent[1].ticketsLimit &&
                event.timestamp == editorEvent[1].timestamp &&
                event.location == editorEvent[1].location) {

                notifyTxError("No changes were made", "", "");
                return;
            }

            let tx: TransactionSignature = '';
            try {
                tx = await program.methods
                    .updateEvent(editorEvent[1].offset, editorEvent[1].title, editorEvent[1].website, editorEvent[1].ticketsLimit, unixTimeBN, editorEvent[1].locationType, editorEvent[1].location, editorEvent[1].artwork)
                    .accounts({
                        authority: publicKey,
                        event: accDataEvent,
                        ticketAuthorityIssuer: editorEvent[1].ticketAuthorityIssuer,
                        ticketAuthorityDelete: editorEvent[1].ticketAuthorityDelete,
                        ticketAuthorityCheckIn: editorEvent[1].ticketAuthorityCheckIn,
                    }).rpc();
                notifyTxSuccess("Event was updated", tx);
                await upsertEvent({offset: accountOffset, ...editorEvent[1]}, false);
            } catch (error: any) {
                notifyTxError("Could not update event", error, tx);
            }
        } else { // Creating a new event
            let tx: TransactionSignature = '';
            try {
                tx = await program.methods
                    .createEvent(editorEvent[1].title, editorEvent[1].website, editorEvent[1].ticketsLimit, unixTimeBN, editorEvent[1].locationType, editorEvent[1].location, editorEvent[1].artwork)
                    .accounts({
                        payer: publicKey,
                        donateTo: publicKey,//TODO: donate to me
                        organizer: accDataOrganizer,
                        ticketAuthorityIssuer: editorEvent[1].ticketAuthorityIssuer,
                        ticketAuthorityDelete: editorEvent[1].ticketAuthorityDelete,
                        ticketAuthorityCheckIn: editorEvent[1].ticketAuthorityCheckIn,
                        event: accDataEvent,
                    }).rpc();
                notifyTxSuccess("Event was created", tx);
                editorEvent[1].offset = accountOffset;
                await upsertEvent(editorEvent[1], false);
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
                                    onClick={() => setEditorOrganizer([true, emptyOrganizer])}>Create Organizer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const createEventHero = () => {
        return (
            <div className="w-full items-center">
                <div className="hero h-50 bg-base-300 w-full md:w-4/5 m-auto rounded-xl">
                    <div className="hero-content text-center">
                        <div className="max-w-md">
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#CC6677] to-[#00AADD]">Create
                                your first Event</h1>
                            <p className="py-6">Great! Now that that&apos;s out of the way, you can create your first
                                event.</p>
                            <button className="btn btn-primary"
                                    onClick={() => setEditorEvent([true, emptyEvent])}>Create an Event
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const showOrganizer = () => {
        return (
            <>
                <div className="py-4">
                    Hello, {organizer.title}
                    <button className="mx-2 btn btn-xs btn-outline"
                            onClick={() => setEditorOrganizer([true, organizer])}>Edit
                    </button>
                </div>
                {events.length > 0 ? showEventList() : createEventHero()}
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
                                                onClick={() => setEditorEvent([true, event])}>Edit
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
                                            onClick={() => setEditorEvent([true, emptyEvent])}>Create new event
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

    const showSpinner = () => {
        return <button className="btn loading">loading</button>
    }

    const renderOrganizerModal = () => {
        return <div className="modal modal-open" id="modOrganizer">
            <div className="modal-box">
                <h3 className="font-bold text-lg">{editorOrganizer[1] ? 'Edit' : 'Create'} Organizer Data</h3>
                <div className="py-4">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">The name of your organization</span>
                        </label>
                        <input type="text" name="title" onChange={handleOrganizerChange}
                               value={editorOrganizer[1].title} placeholder="The Tea Party Organizer"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Link to your website</span>
                        </label>
                        <input type="text" name="website" onChange={handleOrganizerChange}
                               value={editorOrganizer[1].website} placeholder="https://www.theteapartyorganizer.xyz"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                </div>
                <div className="modal-action">
                    <button className="btn btn-md btn-primary" onClick={btnSaveOrganizer}>Save</button>
                    <button className="btn btn-md btn-warning"
                            onClick={() => setEditorOrganizer([false, emptyOrganizer])}>Close
                    </button>
                </div>
            </div>
        </div>
    }
    const handleOrganizerChange = (e) => {
        let tmp = editorOrganizer[1];
        tmp[e.target.name] = e.target.value;
        setEditorOrganizer([true, tmp]);
    };

    const renderEventModal = () => {
        return <div className="modal modal-open" id="modEvent">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Event data</h3>
                <div className="py-4">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">The name of your event</span>
                        </label>
                        <input type="text" name="title" onChange={handleEventChange} value={editorEvent[1].title}
                               placeholder="The Tea Party Meetup"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Link to event website</span>
                        </label>
                        <input type="text" name="website" onChange={handleEventChange} value={editorEvent[1].website}
                               placeholder="https://www.theteapartyorganizer.xyz"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Date & Time</span>
                        </label>
                        <input type="datetime-local" name="timestamp" onChange={handleEventChange}
                               value={new Date(editorEvent[1].timestamp * 1000).toISOString().substring(0, 16)}
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Location</span>
                        </label>
                        <input type="text" name="location" onChange={handleEventChange}
                               value={editorEvent[1].location} placeholder="Earth, Milkyway, Universe"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Artwork</span>
                        </label>
                        <input type="text" name="artwork" onChange={handleEventChange} value={editorEvent[1].artwork}
                               placeholder="https://www.theteapartyorganizer.xyz/event.png"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Maximum number of tickets</span>
                        </label>
                        <input type="text" name="ticketsLimit" onChange={handleEventChange}
                               value={editorEvent[1].ticketsLimit} placeholder="100"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Ticket issuance authority</span>
                        </label>
                        <input type="text" name="ticketAuthorityIssuer" onChange={handleEventChange}
                               value={editorEvent[1].ticketAuthorityIssuer} placeholder="Account Address"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Ticket delete authority</span>
                        </label>
                        <input type="text" name="ticketAuthorityDelete" onChange={handleEventChange}
                               value={editorEvent[1].ticketAuthorityDelete} placeholder="Account Address"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Ticket check in authority</span>
                        </label>
                        <input type="text" name="ticketAuthorityCheckIn" onChange={handleEventChange}
                               value={editorEvent[1].ticketAuthorityCheckIn} placeholder="Account Address"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                </div>
                {/* TODO: need a function to delete an individual ticket - requires seat_id - clarify this won't refund */}
                {/* TODO: need a function to delete all ticket accounts & the event itself - "Delete Event" DANGER ZONE */}
                <div className="modal-action">
                    <button className="btn btn-md btn-primary" onClick={btnSaveEvent}>Save</button>
                    <button className="btn btn-md btn-warning"
                            onClick={() => setEditorEvent([false, emptyEvent])}>Close
                    </button>
                </div>
            </div>
        </div>
    }
    const handleEventChange = (e) => {
        let tmp = editorEvent[1];
        if (e.target.name === 'timestamp') {
            const dateTime = new Date(e.target.value);
            const unixTime = (dateTime.getTime() / 1000) + (-60 * dateTime.getTimezoneOffset());
            tmp[e.target.name] = unixTime;
            console.log("unix time is: ", unixTime, " for: ", e.target.value);
        } else {
            tmp[e.target.name] = e.target.value;
        }
        setEditorEvent([true, tmp]);
    };

    return <>
        {isLoading ? showSpinner() : (organizer ? showOrganizer() : createOrganizerHero())}
        {editorOrganizer[0] ? renderOrganizerModal() : ''}
        {editorEvent[0] ? renderEventModal() : ''}
    </>
};
