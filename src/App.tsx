import { useState, useEffect, useRef } from "react";
import { SimplePool, Event, Filter } from "nostr-tools";
import { useDebounce } from "use-debounce"
import EventsList from "./components/EventsList";
import CreateEvent from "./components/CreateEvent";
import HashtagFilter from "./components/HashtagFilter";
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
  const [pool, setPool] = useState<SimplePool | null>(null);
  const [eventsImmediate, setEvents] = useState<Event[]>([]);
  const [events] = useDebounce(eventsImmediate, 100)
  const [metadata, setMetadata] = useState<Record<string,Metadata>>({});
  const metadataFetched = useRef<Record<string, boolean>>({});

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
    
    setEvents([]);
    const sub = pool.sub(RELAYS, [
      {
      kinds: [1],
      limit: 100,
    },
  ]);

    sub.on('event', (event: Event) => {
    setEvents((events) => insertEventIntoDescendingList(events, event));
    });

    return () => {
      sub.unsub();
    };
  }, [pool]);

  useEffect(() => {
    if (!pool) return;

    const pubkeysToFetch = events
    .filter(event => metadataFetched.current[event.pubkey] !== true)
    .map((event) => event.pubkey);

    pubkeysToFetch.forEach(pubkey => metadataFetched.current[pubkey] = true)
    
    const sub = pool.sub(RELAYS, [{
      kinds: [0],
      authors: pubkeysToFetch
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

  if (!pool) return null;

  return (
    <div className="app">
      <div className="flex flex-col gap-16">
        <h1 className="text-h1">eventstr</h1>
        <CreateEvent pool={pool} />
        <EventsList metadata={metadata} notes={events} />
      </div>
    </div>
  );
}

export default App;