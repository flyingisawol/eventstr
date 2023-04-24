import { useState } from 'react';
import { EventTemplate, Event, getEventHash, SimplePool } from "nostr-tools";
import { RELAYS } from "../App";

interface Props {
    pool: SimplePool;
    hashtags: string[];
}

const CreateEvent = ({ pool, hashtags }: Props) => {

    
    
    const initInput = {title: '', location: '', date: '', time: '', description: ''}

    const [input, setInput] = useState(initInput);



    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!window.nostr) {
            alert("nostr extension not found")
            return;
        }

        // construct the event object
        const _baseEvent = {
            content: JSON.stringify(input),
            created_at: Math.round(Date.now() / 1000),
            kind: 1,
            tags: [...hashtags.map((hashtag) => ["t", hashtag])],
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
                setInput(initInput);
            });
        } catch (error) {
            alert("User rejected operation");
        }

        // publish event to relays
    };

    const handleChange = (e: React.SyntheticEvent) => {
        let target = e.target as HTMLInputElement;
        if(target.name === "location"){
            setInput({...input, [target.name]:target.value.replaceAll(" ","+")})
        }else{
            setInput({...input, [target.name]:target.value})
        }
        

        console.log(target.value)
    }
    // #TODO: Validation for Date + Time
    return (
        <div className='feed'>
            <h2 className='text-h3 text-white mb-12'>Share your event!!</h2>
            <form onSubmit={onSubmit}>
                <textarea
                    name='title'
                    placeholder='event name'
                    className='w-full p-12 rounded'
                    value={input.title}
                    onChange={handleChange}
                    rows={1}
                    required
                />
                <textarea
                    name='location'
                    placeholder='location'
                    className='w-full p-12 rounded'
                    value={input.location}
                    onChange={handleChange}
                    rows={1}
                    required
                />
                <input
                    type="date"
                    name='date'
                    placeholder='date'
                    className='w-full p-12 rounded'
                    value={input.date}
                    onChange={handleChange}
                    required
                    
                />
                <input
                    type="time"
                    name='time'
                    placeholder='time'
                    className='w-full p-12 rounded'
                    value={input.time}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name='description'
                    placeholder='description'
                    className='w-full p-12 rounded'
                    value={input.description}
                    onChange={handleChange}
                    rows={1}
                    required
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