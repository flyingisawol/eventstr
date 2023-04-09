import { useState } from 'react';

interface Props { }

const CreateEvent = () => {
    const [input, setInput] = useState("");

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(input);
    }

    return (
        <div className="w-1/5">

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
    )
}

export default CreateEvent