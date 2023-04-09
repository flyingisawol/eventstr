import { useState } from 'react';
import { EventTemplate, Event, getEventHash, SimplePool } from "nostr-tools";
import { RELAYS } from "../App";
import { clear } from 'console';

interface Props {
    pool: SimplePool;
}

const CreateEvent = ({ pool }: Props) => {
    const [input, setInput] = useState("");

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!window.nostr) {
            alert("nostr extension not found")
            return;
        }

        // construct the event object
        const _baseEvent = {
            content: input,
            created_at: Math.round(Date.now() / 1000),
            kind: 30023,
            tags: [['evenstr', 'attending']],
        } as EventTemplate;

        // allow user to sign event with nsec
        // check if user has key management extension
        // get users pubkey
        // prompt user to sign event
        try {
            const pubkey = await window.nostr.getPublicKey();

            const sig = await (await window.nostr.signEvent(_baseEvent)).sig;

            const event: Event = {
                ..._baseEvent,
                sig,
                pubkey,
                id: getEventHash({ ..._baseEvent, pubkey }),
            };

            const pubs = pool.publish(RELAYS, event);

            let clearedInput = false;

            pubs.on("ok", () => {
                if (clearedInput) return;

                clearedInput = true;
                setInput("");
            });
        }   catch (error) {
            alert("User rejected operation");
        }

        // publish event to relays
    };

return (
    <div className="w-1/2">

        <h2 className='text-h3 text-white mb-12'>Share your event!!</h2>
        <form onSubmit={onSubmit}>
            <textarea
                placeholder='Add your event details here...'
                className='w-full p-12 rounded'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={6}
            />
            <div className='flex justify-end'>
                <button className='bg-violet-500 px-16 py-4 rounded font-bold hover:bg-violet-600 active:scale-90'>
                    Create
                </button>
            </div>
        </form>
    </div>
    );
}

export default CreateEvent