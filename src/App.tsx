import { useState, useEffect } from "react";
import { SimplePool, Event, Filter } from "nostr-tools";
import EventsList from "./components/EventsList";
import CreateEvent from "./components/CreateEvent";
import EventCard from "./components/EventCard";
import HashtagFilter from "./components/HashtagFilter";

export const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.snort.social",
  "wss://purplepag.es",
  "wss://relay.utxo.one",
  "wss://nostr-pub.wellorder.net",
  "wss://nostress.herokuapp.com"
];

type x = Filter

function App() {

  // setup a relays pool
  const [pool, setPool] = useState<SimplePool | null>(null)
  const [events, setEvents] = useState<Event[]>([])

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
      "#t":["nostr"],
    }])

    sub.on('event', (event: Event) => {
    setEvents((events) => [...events, event]);
    });

    return () => {
      sub.unsub();
    };
  }, [pool]);

  // render the events

  return (
    <div className="app">
      <div className="flex flex-col gap-16">
        <h1>evenstr in react with typescript and nostr tools</h1>
        <EventsList notes={events} />
      </div>
    </div>
  );
}

export default App;