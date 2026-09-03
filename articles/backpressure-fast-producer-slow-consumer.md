# Backpressure: What Happens When the Chef Outruns the Waiter

Imagine you're managing a big restaurant. You have an excellent chef in the kitchen who can prepare fifty meals a minute — but only one waiter serving the tables, who can carry ten meals a minute at most.

If the chef keeps working at full speed, the kitchen fills with plates. Soon there's nowhere to put new food, and everything falls apart completely.

In software, we call this the fast producer and slow consumer problem — and its solution is backpressure.

## Slow Down, I'm Drowning

Simply put, backpressure is a mechanism that lets the consumer — the system receiving data — send a message back to the producer — the system sending data — saying: slow down a little, I can't absorb all of this.

Without that mechanism, your system eats every byte of available memory until it hits out-of-memory and the whole server crashes. Because data keeps piling into the message queue faster than anything processes it.

When you build systems handling massive data flows — data streaming, real-time analytics — you must be sure the inflow matches the system's processing capacity. Backpressure steps in to balance that equation: by pausing the producer temporarily, by making it slow down, or even by dropping the least important requests to keep the core system stable and standing.

## Demand, Not Supply: Backpressure in Elixir

Project this onto the Elixir world and you'll find the language shines exactly here, thanks to the BEAM VM underneath it. The Elixir community produced brilliant answers for data flow — like GenStage, which bakes backpressure in elegantly: the consumer requests data from the producer in exactly the quantity it can handle.

And going further, Broadway takes the idea to a higher level, building powerful data-processing pipelines that chew through millions of requests smoothly — without the server even breaking a sweat.

Here is what that looks like as one complete, working pipeline. First, a producer that buffers whatever arrives and releases only what downstream demanded — overflow waits in an Erlang queue, never in an exploding mailbox:

```elixir
defmodule Shop.EventProducer do
  use GenStage

  def start_link(_), do: GenStage.start_link(__MODULE__, :ok, name: __MODULE__)
  def push(event), do: GenStage.cast(__MODULE__, {:push, event})

  def init(:ok), do: {:producer, {:queue.new(), 0}}

  # an event arrives: buffer it, then release only what was demanded
  def handle_cast({:push, event}, {queue, demand}) do
    dispatch(:queue.in(event, queue), demand, [])
  end

  # downstream asks for more: release up to the new demand
  def handle_demand(incoming, {queue, demand}) do
    dispatch(queue, incoming + demand, [])
  end

  defp dispatch(queue, demand, events) do
    with d when d > 0 <- demand,
         {{:value, event}, queue} <- :queue.out(queue) do
      dispatch(queue, d - 1, [event | events])
    else
      _ -> {:noreply, Enum.reverse(events), {queue, demand}}
    end
  end
end
```

Then the Broadway pipeline itself — ten processors pulling at most fifty events each, batched into hundreds for the database, with failures isolated per message instead of killing the stream:

```elixir
defmodule Shop.Pipeline do
  use Broadway

  def start_link(_opts) do
    Broadway.start_link(__MODULE__,
      name: __MODULE__,
      producer: [module: {Shop.EventProducer, []}, concurrency: 1],
      processors: [default: [concurrency: 10, max_demand: 50]],
      batchers: [db: [concurrency: 2, batch_size: 100, batch_timeout: 1_000]]
    )
  end

  def handle_message(_, %Broadway.Message{data: event} = message, _) do
    case Orders.charge(event) do
      {:ok, _} -> message
      {:error, _} -> Broadway.Message.failed(message, "charge-failed")
    end
  end

  def handle_batch(:db, messages, _, _) do
    Orders.mark_processed(Enum.map(messages, & &1.data))
    messages
  end
end
```

Every knob here is backpressure made concrete: `max_demand` caps how much each processor holds, `batch_size` shapes database writes, `concurrency` scales the kitchen staff — and the waiter never sees more plates than he can carry. Blast a burst at it and watch nothing explode:

```elixir
# 100_000 events at once — the mailbox never explodes:
for id <- 1..100_000, do: Shop.EventProducer.push(%{order_id: id})

# processors pull at most max_demand each; the rest waits
# upstream in the queue, never piled in RAM
```

## Resilience Beats Raw Speed

In the end, building strong systems doesn't just mean being fast. What matters more is being resilient — absorbing sudden pressure intelligently instead of collapsing under it.

Backpressure isn't just a technical term. It's a mindset for designing distributed systems — one that keeps your system standing no matter how heavy the traffic gets.
