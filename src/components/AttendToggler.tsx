
import { EventTemplate, Event, getEventHash, SimplePool} from "nostr-tools";
import { RELAYS } from "../App";


/* 

    check if it your event, durr you are attending your own event -> chcekc user.pubkey with pubkey
    check if you are in the attending list if you are you are going -> check p tags of the latest reply to the root of the event 

    EVENT
    REPLY 1 ( BOB IS ATTENDING)
    [EVENT HOST, BOB]
    REPLY 1.1 ( DYLAN IS ATTENDING, THIS IS A REPLY TO BOB)
    [EVENT HOST, BOB, DYLAN]
    ie just push yourself

    ie behaves kind of like a linked list 
    
    the e tag should be according to nip10 : 
    if its the first then it is : 
    ["e", 'eventstr event ID', '', 'root']
    if not : 
    ["e", 'Previous Attendee event ID', '', 'reply']


    take our event id, go to the relay it was on, find the Event that has the evenstr event and a 'root' then requery the relay to find the latest reply (ie traverse linked list)

*/
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
    console.log(currentId)
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

    let status: boolean = false

    if(pubkey === user.pubkey){
        status = true
    }

    




    const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const replyId = findReplyId(eventId,notes)
        const ptags = notes.filter((event)=> event.id === replyId)[0].tags.filter((tag)=>tag[0] === "p")[0] 
        const replyAuthor = notes.filter((event)=> event.id === replyId)[0].pubkey
        let newPTags: string[] = []
        if(!ptags || ptags.length === 0){
            if(user.pubkey){
                newPTags = ["p",user.pubkey] // author pubkey
            }
        }else if (ptags){

            newPTags = [...ptags,replyAuthor]
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

        // publish event to relays
    };


    // #TODO: Validation for Date + Time
    return (
        <div className='feed'>
            {status ? <button onClick = {onClick}> I am attending</button> : <button onClick = {onClick}> I havent clicked attending</button>}

        </div>
    );
}

export default AttendToggler