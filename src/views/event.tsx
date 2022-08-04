import {FC} from "react";
import {Organization} from "../components/Organization";

export const EventView: FC = ({}) => {

    // IDEAS
    /*
     * No organization -> HERO ELEMENT create orga
     * ELSE -> show details and edit button
     *
     * NO EVENT -> HERO ELEMENT create youur first event
     * ELSE -> list all Events + a button to create a new one
     *
     */
    return (
        <>
            <Organization/>
        </>
    );
};
