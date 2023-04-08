import { useState, useEffect } from "react";
import { SimplePool, Event, Filter } from "nostr-tools";
import EventsList from "./components/EventsList";
import CreateEvent from "./components/CreateEvent";
import EventCard from "./components/EventCard";
import HashtagFilter from "./components/HashtagFilter";
import { StringLiteral } from "typescript";
import { insertEventIntoDescendingList } from "./utils/helperFunction";

export const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.snort.social",
  "wss://purplepag.es",
  "wss://relay.utxo.one",
  "wss://nostr-pub.wellorder.net",
  "wss://nostress.herokuapp.com"
];

type x = Filter

export interface Metadata {
  name?: string;
  about?: string;
  picture?: string;
  nip05?: string;
}

function App() {

  // setup a relays pool
  const [pool, setPool] = useState<SimplePool | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [metadata, setMetadata] = useState<Record<string,Metadata>>({})

  //setup a relays pool
  useEffect(() => {
    const _pool = new SimplePool();
    setPool(_pool);

    return () => {
      _pool.close(RELAYS)
    }
  }, [])

  // subscribe to some events
  useEffect(() => {
    if (!pool) return;
    
    const sub = pool.sub(RELAYS, [{
      kinds: [1],
      limit: 100,
    }])

    sub.on('event', (event: Event) => {
    setEvents((events) => insertEventIntoDescendingList(events, event));
    });

    return () => {
      sub.unsub();
    };
  }, [pool]);

  useEffect(() => {
    if (!pool) return;

    const pubkeystofetch = events.map((event) => event.pubkey);
    
    const sub = pool.sub(RELAYS, [{
      kinds: [0],
      authors: pubkeystofetch
    }])

    sub.on('event', (event: Event) => {

      const metadata = JSON.parse(event.content) as Metadata;

      setMetadata((cur) => ({
        ...cur,
        [event.pubkey]: metadata, 
      }));
    });

    sub.on("eose", () => {
      sub.unsub();
    })

    return () => {
    };
  }, [events, pool]);

  return (
    <div className="app">
      <div className="flex flex-col gap-16">
        <h1>evenstr</h1>
        <EventsList metadata={metadata} notes={events} />
      </div>
    </div>
  );
}

export default App;