import { Event, SimplePool, nip19 } from "nostr-tools";
import { Metadata } from "../App";
import EventCard from "./EventCard";

interface Props {
    notes: Event[];
    metadata: Record<string, Metadata>;
    yourPubKey: string
    pool: SimplePool
}

const EventsList = ({ yourPubKey,notes, metadata, pool }: Props) => {
    console.log(notes)
    return (
        <div className="flex flex-col gap-16 justify-center feed">
            {notes.map((note) => (
                <EventCard
                    pubkey = {yourPubKey}
                    created_at={note.created_at}
                    user={{
                        name:
                            metadata[note.pubkey]?.name ??
                            `${nip19.npubEncode(note.pubkey).slice(0, 12)}...`,
                        image:
                            metadata[note.pubkey]?.picture ??
                            `https://api.dicebear.com/5.x/identicon/svg?seed=${note.pubkey}`,
                        pubkey: note.pubkey,
                    }}
                    key={note.id}
                    content={note.content}
                    hashtags={note.tags
                        .filter((t) => t[0] === 't')
                        .map((t) => t[1])
                    }
                    eventId = {note.id}
                    notes = {notes}
                    pool = {pool}

                />
            ))}
        </div>
    );
}

export default EventsList