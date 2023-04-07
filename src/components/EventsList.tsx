import EventCard from "./EventCard";
import { Event } from "nostr-tools"

interface Props {
    notes: Event[];
}

const EventsList = ({ notes }: Props) => {
    return (
        <>
        <div className="flex flex-col gap-16">
            {notes.map((note) => (
                <EventCard key={note.id} content={note.content} />
            ))}
        </div>
        </>
    );
}

export default EventsList