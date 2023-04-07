interface Props {
    content: string;
}

const EventCard = ({ content }: Props) => {
    return (
        <>
        <div className="rounded p-16 border border-gray-600 bg-gray-700 flex flex-col gap-16 break-words">
            <p>{content}</p>
        </div>
        </>
    );
}

export default EventCard