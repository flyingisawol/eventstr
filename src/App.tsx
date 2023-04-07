import { useState, useEffect } from "react";
import { SimplePool, Event, Filter } from "nostr-tools";


export const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.snort.social",
  "wss://nostr.walletofsatoshi.com",
  "wss://purplepag.es",
  "wss://relay.utxo.one",
  "wss://nostr-pub.wellorder.net"
];

type x = Filter

function App() {

  // setup a relays pool
  const [pool, setPool] = useState<SimplePool | null>(null)

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
      kinds: [1, 30023],
      limit: 100,
    }])

    sub.on('event', (event:Event) => {
      console.log(event);
    })

    return () => {};
  }, [pool]);

  // render the events

  return (
    <div className="app">
      <h1>evenstr in react with typescript and nostr tools</h1>
    </div>
  );
}

export default App;