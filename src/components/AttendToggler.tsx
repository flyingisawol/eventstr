
import { EventTemplate, Event, getEventHash, SimplePool} from "nostr-tools";
import { RELAYS } from "../App";
import { useState , useEffect} from "react";


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
    notes: Event[];
    pool: SimplePool;
    eventId: string;
  }


const findReplyId = (id: string,eventsList: Event[]): string => {
    let currentId = id
    let repliedEvent = eventsList.filter((event)=> 
        {
            
            let eventETags = event.tags.filter((tag)=> tag[0] === "e")[0]
           
            if(!eventETags){
                return false
            }
            return eventETags.includes(currentId) ? true : false
        })

    if(!repliedEvent  || repliedEvent.length === 0){
        return currentId // terminal case 
    }else{
        return findReplyId(repliedEvent[0].id,eventsList)
    }

 

    
}



const AttendToggler = ({ pubkey,content,user,created_at,hashtags, notes, pool , eventId}: Props) => {

    const [status, setStatus] = useState(false)
    useEffect(()=>{
        const eventToCheckCount = findReplyId(eventId,notes)
        if(notes){
            const replyEvent = notes.filter((event)=> event.id === eventToCheckCount)[0]
            
            if(replyEvent.tags){
                console.log("here")
                const attendeesArray = replyEvent.tags.filter((tag)=>tag[0] === "p")
                if(attendeesArray.length > 0){
                    console.log("here2")
                    const attendees = attendeesArray[0].filter((item)=> item !== "p")
                    console.log(attendees)
                    const amAttending = attendees.includes(pubkey)
                    console.log(amAttending)
                    if(amAttending){
                        console.log("set to true")
                        setStatus(true)
        
                    }else if(attendees.length === 0 && pubkey === user.pubkey) {
                        console.log("set to true")
                        setStatus(true)
                    }
                    else{
                        setStatus(false)
                    }
                }
                
            }
        }else{
            setStatus(false)
        }
       
        // const isUnattending = replyEvent.content.split(" ").includes("no")


        
        
        
       
        
    },[])
   
   


    




    const onClickAttend = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const replyId = findReplyId(eventId,notes)
        const ptags = notes.filter((event)=> event.id === replyId)[0].tags.filter((tag)=>tag[0] === "p")[0] 
        const replyAuthor = notes.filter((event)=> event.id === replyId)[0].pubkey
        const replyContent = notes.filter((event)=> event.id === replyId)[0].content.split(" ")
        let newPTags: string[] = []
        if(!ptags || ptags.length === 0){
            if(user.pubkey){
                newPTags = ["p",user.pubkey] // author pubkey
            }
        }else if (ptags){
            if(!replyContent.includes("no")){
                newPTags = [...ptags,replyAuthor]
            }
        }
        
        const updatedTags = [...hashtags.map((hashtag) => ["t", hashtag]),["e",replyId,"","reply"],newPTags]
        
        if (!window.nostr) {
            alert("nostr extension not found")
            return;
        }
        const contentToadd = `${pubkey} Attending ${eventId}`
        
        // construct the event object
        const _baseEvent = {
            content: contentToadd,
            created_at: Math.round(Date.now() / 1000),
            kind: 1,
            tags: updatedTags,
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
                
               console.log("publish successful")
            });
        } catch (error) {
            console.log(error)
            alert("User rejected operation");
        }

        setStatus(true)
        // publish event to relays
    };

    const onClickUnAttend = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const replyId = findReplyId(eventId,notes)
        const ptags = notes.filter((event)=> event.id === replyId)[0].tags.filter((tag)=>tag[0] === "p")[0] 
        const replyAuthor = notes.filter((event)=> event.id === replyId)[0].pubkey
        const replyContent = notes.filter((event)=> event.id === replyId)[0].content.split(" ")

        let newPTags: string[] = []
        if(!ptags || ptags.length === 0){
            if(user.pubkey){
                newPTags = ["p",user.pubkey] // author pubkey
            }
        }else if (ptags){
            if(!replyContent.includes("no")){
                newPTags = [...ptags,replyAuthor]
            }
            
        }
        if(ptags.includes(pubkey)){
            newPTags = newPTags.filter((key)=> key!== pubkey)
        }
      
        const updatedTags = [...hashtags.map((hashtag) => ["t", hashtag]),["e",replyId,"","reply"],newPTags]
        
        if (!window.nostr) {
            alert("nostr extension not found")
            return;
        }
        const contentToadd = `${pubkey} is no longer Attending ${eventId}`
        
        // construct the event object
        const _baseEvent = {
            content: contentToadd,
            created_at: Math.round(Date.now() / 1000),
            kind: 1,
            tags: updatedTags,
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
                
               console.log("publish successful")
            });
        } catch (error) {
            console.log(error)
            alert("User rejected operation");
        }

        setStatus(false)
        // publish event to relays
    };
    // #TODO: Validation for Date + Time
    return (
        <div className='feed'>
            {status ? <button onClick = {onClickUnAttend}> Unattend </button> : <button onClick = {onClickAttend}> Attend</button>}

        </div>
    );
}

export default AttendToggler