# WebSockets Are Not Just Faster HTTP

One of the things I kept noticing while working on systems with real-time features is that many people treat WebSockets as if they were just "a faster HTTP."

But the truth is that a WebSocket is not an improvement on HTTP so much as a complete change in the communication model itself.

HTTP is built on the request/response model. The client sends a request, the server processes it and replies, and then the connection is over. And even with HTTP/2 and HTTP/3, the core idea remains exactly the same.

But the moment you start building systems that need live chat, presence systems, notifications, collaborative editing, dashboards, market feeds, or multiplayer games — you discover that the request/response model itself has become the bottleneck.

This is where WebSockets come in.

Instead of opening a new TCP connection for every request, the client and server perform one single HTTP upgrade — and from then on, the connection becomes a persistent, full-duplex channel.

Which means the client can send at any time. The server can send at any time. No polling. No long polling. And no cost of a brand-new connection over and over again.

## A Channel in Practice: Phoenix Channels

In Elixir, this model maps beautifully onto Phoenix channels. A client joins a topic once, and from then on messages flow in both directions:

```elixir
defmodule MyAppWeb.RoomChannel do
  use MyAppWeb, :channel

  # one join replaces endless polling
  def join("room:" <> _room_id, _params, socket) do
    {:ok, socket}
  end

  # a message from one client reaches everyone subscribed
  def handle_in("new_message", %{"body" => body}, socket) do
    broadcast!(socket, "new_message", %{body: body})
    {:noreply, socket}
  end
end
```

And the client side stays just as small:

```javascript
import { Socket } from "phoenix";

const socket = new Socket("/socket", {});
socket.connect();

const channel = socket.channel("room:lobby", { user: "hassan" });
channel.on("new_message", (msg) => renderMessage(msg));
channel.join();
```

No refresh button. No `setInterval` hammering an endpoint. The channel stays open, and events arrive the moment they happen.

## The Architecture Itself Changes

But the truly important part isn't that WebSockets are faster.

The important part is that the architecture itself changes. Instead of building the system on the premise that "the client asks and the server answers," you start building it on a different premise: "events happen, and the interested parties get notified."

Which is why most modern real-time systems lean heavily on event-driven architecture side by side with WebSockets. Any part of your application — a controller, a background job, an external webhook — can push an event into the system without ever holding a socket:

```elixir
# from anywhere in your app: a controller, a job, a webhook handler
Phoenix.PubSub.broadcast(MyApp.PubSub, "room:lobby", {:order_shipped, order.id})

# ...and the channel delivers it to every connected client
def handle_info({:order_shipped, id}, socket) do
  push(socket, "order_shipped", %{id: id})
  {:noreply, socket}
end
```

The HTTP request that shipped the order never knew about the connected browsers — and it didn't need to. Events decouple the two sides completely.

Presence — knowing who is online right now — falls out of the same model instead of requiring its own polling infrastructure:

```elixir
defmodule MyAppWeb.Presence do
  use Phoenix.Presence,
    otp_app: :my_app,
    pubsub_server: MyApp.PubSub
end

def join("room:lobby", %{"user" => user}, socket) do
  send(self(), :after_join)
  {:ok, assign(socket, :user, user)}
end

def handle_info(:after_join, socket) do
  {:ok, _} = Presence.track(socket, socket.assigns.user, %{
    online_at: System.system_time(:second)
  })
  push(socket, "presence_state", Presence.list(socket))
  {:noreply, socket}
end
```

Join, track, and every subscriber sees the roster update in real time — joins, leaves, and all.

## Not the Answer to Everything

Of course, WebSockets are not the answer to everything. If you have a plain CRUD API, or short, non-interactive operations, HTTP is still better and simpler.

But once you hold thousands or millions of open connections at the same time, the real challenges begin: connection lifecycle management, heartbeats and keep-alives, backpressure handling, horizontal scaling, pub/sub systems, session affinity, and fault tolerance.

Which is why building a successful real-time system doesn't mean you figured out how to call `socket.send()`. The real challenge starts after the first WebSocket connection succeeds.

And maybe that's why I see the WebSocket not merely as a protocol, but as a different way of thinking about building systems.
