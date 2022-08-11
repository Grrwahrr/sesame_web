import {FC, useCallback, useEffect, useState} from 'react';
import {useAnchorWallet, useConnection, useWallet} from '@solana/wallet-adapter-react';
import {TransactionSignature} from "@solana/web3.js";
import {deriveOrganizer, notifyTxError, notifyTxSuccess, ticketProgram} from "../utils/dapp_lib";
import Link from "next/link";


export const EventView: FC = () => {
    const {connection} = useConnection();
    const {publicKey} = useWallet();
    const anchorWallet = useAnchorWallet();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [organizer, setOrganizer] = useState<any>(undefined);
    const [events, setEvents] = useState<Array<any>>([]);

    const [showOrganizerModal, setShowOrganizerModal] = useState<[boolean, any]>([false, undefined]);
    const [showEventModal, setShowEventModal] = useState<[boolean, any]>([false, undefined]);

    const emptyOrganizer = {title: "", website: ""};
    const emptyEvent = {
        offset: -1,
        ticketsLimit: "",
        ticketsIssued: "",
        timestamp: Math.floor(Date.now() / 1000),
        locationType: "",
        location: "",
        title: "",
        website: "",
        artwork: ""
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!publicKey) return;
            const program = ticketProgram(connection, anchorWallet);
            const [accDataOrganizer, bumpOrganizer] = await deriveOrganizer(program, publicKey);
            const organizer = await program.account.organizer.fetch(accDataOrganizer);
            setOrganizer(organizer);
            setEvents([
                //TODO store these from real data, ADD THE OFFSET!
                {
                    offset: 0,
                    ticketsLimit: 500,
                    ticketsIssued: 12,
                    timestamp: 1661256000,
                    locationType: "URL",
                    location: "https://www.google.com",
                    title: "Awesome Film Festival",
                    website: "https://www.google.com",
                    artwork: "https://blog.walls.io/wp-content/uploads/2017/02/ideas-for-making-event-more-social.jpg"
                },
                {
                    offset: 1,
                    ticketsLimit: 200,
                    ticketsIssued: 180,
                    timestamp: 1663689600,
                    locationType: "GPS",
                    location: "52.542417,13.429639",
                    title: "Crazy Horse Show",
                    website: "https://www.google.com",
                    artwork: "https://intheory.events/wp-content/uploads/2020/11/op_livestreaming_event_stage-1-1536x864.jpg"
                },
                {
                    offset: 2,
                    ticketsLimit: 600,
                    ticketsIssued: 432,
                    timestamp: 1661011200,
                    locationType: "TXT",
                    location: "Brotfabrik Berlin",
                    title: "Tea Drinking Meetup",
                    website: "https://www.google.com",
                    artwork: "https://myhaneerbil.com/wp-content/uploads/960x0.jpg"
                },
            ]);
            setIsLoading(false);
        }
        fetchData().catch(console.error);
    }, [connection, publicKey, anchorWallet]);

    const btnSaveOrganizer = useCallback(async () => {
        const program = ticketProgram(connection, anchorWallet);
        const [accDataOrganizer, bumpOrganizer] = await deriveOrganizer(program, publicKey);
        const organizer = await program.account.organizer.fetch(accDataOrganizer);

        if (!showOrganizerModal[0]) {
            console.log("only save with modal open", showOrganizerModal[0]);
            return;
        }

        if (organizer) {
            if (organizer.title == showOrganizerModal[1].title && organizer.website == showOrganizerModal[1].website) {
                notifyTxError("No changes were made", "", "");
                return;
            }

            let tx: TransactionSignature = '';
            try {
                tx = await program.methods
                    .updateOrganizer(showOrganizerModal[1].title, showOrganizerModal[1].website)
                    .accounts({
                        authority: publicKey,
                        organizer: accDataOrganizer,
                    }).rpc();
                notifyTxSuccess("Organizer was updated", tx);
                setOrganizer(showOrganizerModal[1]);
            } catch (error: any) {
                notifyTxError("Could not update organizer", error, tx);
            }
        } else {
            let tx: TransactionSignature = '';
            try {
                tx = await program.methods
                    .createOrganizer(showOrganizerModal[1].title, showOrganizerModal[1].website)
                    .accounts({
                        payer: publicKey,
                        organizer: accDataOrganizer,
                    }).rpc();
                notifyTxSuccess("Organizer was created", tx);
                setOrganizer(showOrganizerModal[1]);
            } catch (error: any) {
                notifyTxError("Could not create organizer", error, tx);
            }
        }
    }, [publicKey, connection, showOrganizerModal]);

    const btnSaveEvent = useCallback(async () => {
        alert("TODO edit & create event");
    }, [publicKey, connection]);


    const createOrganizerHero = () => {
        return (
            <div className="w-full items-center">
                <div className="hero h-50 bg-base-300 w-full md:w-4/5 m-auto">
                    <div className="hero-content text-center">
                        <div className="max-w-md">
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#CC6677] to-[#00AADD]">Create
                                an Organization</h1>
                            <p className="py-6">First of, you will want to setup and organization that will be the host
                                of your events.</p>
                            <button className="btn btn-primary"
                                    onClick={() => setShowOrganizerModal([true, emptyOrganizer])}>Create Organizer
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
                <div className="hero h-50 bg-base-300 w-full md:w-4/5 m-auto">
                    <div className="hero-content text-center">
                        <div className="max-w-md">
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#CC6677] to-[#00AADD]">Create
                                an Event</h1>
                            <p className="py-6">Now that you have an organization, you can set up your first event.</p>
                            <button className="btn btn-primary"
                                    onClick={() => setShowEventModal([true, emptyEvent])}>Create Your Event
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
                            onClick={() => setShowOrganizerModal([true, organizer])}>Edit
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
                                                onClick={() => setShowEventModal([true, event])}>Edit
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
                                            onClick={() => setShowEventModal([true, emptyEvent])}>Create new event
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
                <h3 className="font-bold text-lg">{showOrganizerModal[1] ? 'Edit' : 'Create'} Organizer Data</h3>
                <div className="py-4">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">The name of your organization</span>
                        </label>
                        <input type="text" name="title" onChange={handleOrganizerChange}
                               value={showOrganizerModal[1].title} placeholder="The Tea Party Organizer"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Link to your website</span>
                        </label>
                        <input type="text" name="website" onChange={handleOrganizerChange}
                               value={showOrganizerModal[1].website} placeholder="https://www.theteapartyorganizer.xyz"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                </div>
                <div className="modal-action">
                    <button className="btn btn-md btn-primary" onClick={btnSaveOrganizer}>Save</button>
                    <button className="btn btn-md btn-warning"
                            onClick={() => setShowOrganizerModal([false, emptyOrganizer])}>Close
                    </button>
                </div>
            </div>
        </div>
    }
    const handleOrganizerChange = (e) => {
        let tmp = showOrganizerModal[1];
        tmp[e.target.name] = e.target.value;
        setShowOrganizerModal([true, tmp]);
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
                        <input type="text" name="title" onChange={handleEventChange} value={showEventModal[1].title}
                               placeholder="The Tea Party Meetup"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Link to event website</span>
                        </label>
                        <input type="text" name="website" onChange={handleEventChange} value={showEventModal[1].website}
                               placeholder="https://www.theteapartyorganizer.xyz"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Date & Time</span>
                        </label>
                        <input type="datetime-local" name="timestamp" onChange={handleEventChange}
                               value={new Date(showEventModal[1].timestamp * 1000).toISOString().substring(0, 16)}
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Location</span>
                        </label>
                        <input type="text" name="location" onChange={handleEventChange}
                               value={showEventModal[1].location} placeholder="Earth, Milkyway, Universe"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Artwork</span>
                        </label>
                        <input type="text" name="artwork" onChange={handleEventChange} value={showEventModal[1].artwork}
                               placeholder="https://www.theteapartyorganizer.xyz/event.png"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Maximum number of tickets</span>
                        </label>
                        <input type="text" name="ticketsLimit" onChange={handleEventChange}
                               value={showEventModal[1].ticketsLimit} placeholder="100"
                               className="input input-bordered input-primary w-full"/>
                    </div>
                </div>
                {/* TODO: need a function to delete an individual ticket - requires seat_id - clarify this won't refund */}
                {/* TODO: need a function to delete all ticket accounts & the event itself - "Delete Event" DANGER ZONE */}
                <div className="modal-action">
                    <button className="btn btn-md btn-primary" onClick={btnSaveEvent}>Save</button>
                    <button className="btn btn-md btn-warning"
                            onClick={() => setShowEventModal([false, emptyEvent])}>Close
                    </button>
                </div>
            </div>
        </div>
    }
    const handleEventChange = (e) => {
        let tmp = showEventModal[1];
        if (e.target.name === 'timestamp') {
            const unixtime = new Date(e.target.value).getTime() / 1000
            tmp[e.target.name] = unixtime;
            console.log("unixtime: ", unixtime, " for: ", e.target.value);
        } else {
            tmp[e.target.name] = e.target.value;
        }
        setShowEventModal([true, tmp]);
    };

    return <>
        {isLoading ? showSpinner() : (organizer ? showOrganizer() : createOrganizerHero())}
        {showOrganizerModal[0] ? renderOrganizerModal() : ''}
        {showEventModal[0] ? renderEventModal() : ''}
    </>
};
