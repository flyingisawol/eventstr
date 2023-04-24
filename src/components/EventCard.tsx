import ApiEmbed from "./ApiEmbed"

interface Props {
  pubkey: string
  content: string
  user: {
    name?: string
    image?: string
    pubkey?: string
  }
  created_at: number;
  hashtags: string[];
}

// interface Event {
//   title?: string
//   date?: string
//   location?: string
//   time?: string
//   description?: string
// }

const  EventCard = ({  pubkey,content, user, created_at, hashtags }: Props) => {

  let parsedContent : any = {title: "", date: "", location: "", time: "", description: ""}
  if(content){
    try {
      parsedContent = JSON.parse(content)
    } catch (e){
      console.log("failed to parse")
      return null
    }
  }
  const [year,month,day] = parsedContent.date.split("-")
  const dateObj = new Date(year,month-1,day)
  const options = { weekday: 'short', day: 'numeric', month: 'long' } as const
  const dateTimeFormat1 = new Intl.DateTimeFormat('en-AU',options )
  let dateString = "failed"
  try {
    dateString = dateTimeFormat1.format(dateObj)
  }
  catch(e){
    
    dateString = "failed"
  }

  // #TODO: adjust the "Hosted by" so that the height doesn't go above the image, would be nicer. 
  return (
    <>
      <div className="rounded p-16 border border-gray-600 bg-gray-700 flex flex-col gap-16 break-words feed">
      <div className = "text-h2">{parsedContent.title}</div>
      <div className="flex gap-12 items-center overflow-hidden">
        <img
          src={user.image}
          alt="note"
          className="rounded-full w-40 aspect-square bg-gray-100"
        />
        <div>
          <a
            href={`https://nostr.guru/p/${user.pubkey}`}
            className="text-body3 text-white overflow-hidden text-ellipsis"
            target="_blank"
            rel="noreferrer"
          >
            
            Hosted By
            <br></br>
             <p className = "font-bold text-black">{user.name}</p>
          </a> 
          {/* <p className="text-body5 text-gray-400">
            {new Date(created_at * 1000).toISOString().split("T")[0]}
          </p> */}
        </div>
      </div>
      
      <div className="flex">
        <div className = "flex-none">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

        </div>
        <div className = "flex-auto">
          <div>{dateString}</div>
        </div>
        <div className = "flex-auto">
          <div>{parsedContent.time}</div>
        </div>
      </div>
      
      <div className="flex">
        <div className="flex-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  
          </svg>
          
        </div>
        <div className="flex-1">{parsedContent.location.replaceAll("+"," ")}</div>

      </div>
      {parsedContent.location ? <ApiEmbed location = {parsedContent.location}/> : null}
    
      <div className = 'bg-gray-400'>
        <p>{parsedContent.description}</p>
      </div>
      {pubkey === user.pubkey ? <div className="bg-gray-300 text-body5 text-gray-900 font-medium rounded-24 px-12 py-4">Admin</div>: <div className="bg-gray-300 text-body5 text-gray-900 font-medium rounded-24 px-12 py-4">Attend</div>}

      
      
      <ul className="flex flex-wrap gap-12">
      {hashtags
      .filter((t) => hashtags.indexOf(t) === hashtags.lastIndexOf(t))
      .map((hashtag) => (
        <li
        key={hashtag}
        className="bg-gray-300 text-body5 text-gray-900 font-medium rounded-24 px-12 py-4"
        >
          #{hashtag}
        </li>
      ))}
      </ul>
      </div>
    </>
  )
}

export default EventCard


