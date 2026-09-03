# Why the BEAM VM Is Special: The Actor Model Is Only the Beginning

Why is the BEAM VM actually special?

The first time I heard about the Actor Model, I thought it was just a different way of writing concurrency — that instead of threads, locks, and mutexes, we'd simply use actors and move on.

But the deeper I went, the more I realized the Actor Model is only the beginning of the story. The real hero is the BEAM VM.

In most runtimes, threads share the same memory — which forces the developer to deal with race conditions, deadlocks, and lock contention. Meaning a large part of your time goes into managing concurrency instead of focusing on your system's actual logic.

Then came the Actor Model with a beautifully simple idea:

> Don't share memory. Share messages.

Each actor owns its private state, and when it needs to talk to another actor, it sends it a message instead of reading or writing its memory.

## State Without Sharing: A Counter in Elixir

That private state isn't a convention — it's enforced. Nothing outside can touch it; the only way in is the mailbox:

```elixir
defmodule Counter do
  def start, do: spawn(fn -> loop(0) end)

  defp loop(count) do
    receive do
      {:get, from} ->
        send(from, {:count, count})
        loop(count)

      :increment ->
        loop(count + 1)
    end
  end
end

counter = Counter.start()
send(counter, :increment)
send(counter, {:get, self()})

receive do
  {:count, n} -> IO.puts("count: #{n}")
end
```

No locks. No atomics. The count can only change through messages, so a race condition is structurally impossible — not carefully avoided, impossible.

## A Million Actors, Not a Million Threads

But here comes the real question: if I have a million actors, do I need a million threads?

The answer is no — and that's the first thing that makes the BEAM different.

When you call `spawn` in Elixir or Erlang, you're not creating a thread. You're creating a BEAM process: an extremely lightweight thing with its own private heap, its own mailbox, and its own independent garbage collector.

Which means you can run hundreds of thousands — sometimes millions — of processes on a single machine, depending on available memory and the nature of the load. This isn't a thought experiment; you can try it in `iex`:

```elixir
1..1_000_000
|> Enum.map(fn _ -> spawn(fn -> receive do: (:stop -> :ok) end) end)
|> Enum.each(&send(&1, :stop))

# one million processes spawned, then stopped — on one machine
```

So who runs all of these processes?

The BEAM spins up a small number of scheduler threads — usually matching the CPU core count — and distributes every process across them. Which means you never need one thread per actor.

## Preemptive Scheduling: No Hogging the CPU

The part I liked most is how scheduling works. Every process gets a fixed budget of reductions — roughly, function calls. The moment it spends them, the scheduler pauses it and runs another process. Even if the developer never wrote a single yield.

That means no process can ever hog the CPU. A tight infinite loop in one process slows nothing else down; the rest of the system keeps breathing.

And since every process has its own garbage collector, when one process needs to collect, the rest of the system carries on normally — which reduces GC impact dramatically compared to many traditional runtimes, where one global collection pauses the whole world.

## The Philosophy Is Not to Prevent the Crash

And finally — the BEAM's philosophy is not to prevent crashes. Quite the opposite. It's built on one idea:

> Let it crash.

If a process dies, its supervisor decides how to restart it — or restart part of the system — without bringing the whole application down. And this isn't theory; it's three lines of real structure:

```elixir
children = [
  {MyApp.Worker, []}
]

opts = [strategy: :one_for_one, name: MyApp.Supervisor]
Supervisor.start_link(children, opts)
```

With `:one_for_one`, a crashing worker is restarted alone while its siblings keep serving. Send it a poison message and watch it come back:

```elixir
defmodule MyApp.Worker do
  use GenServer

  def start_link(_), do: GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  def init(state), do: {:ok, state}

  # this crash takes down one process — and only one process
  def handle_cast(:boom, _state), do: raise("kaboom")
  def handle_cast({:work, job}, state), do: {:noreply, Map.put(state, :last, job)}
end

GenServer.cast(MyApp.Worker, {:work, "job-1"})
GenServer.cast(MyApp.Worker, :boom)
# => the worker restarts fresh; the application never blinked
```

In my opinion, the real power of Elixir isn't that it uses the Actor Model. It's that the runtime itself was built from scratch for the Actor Model.

And that is why, to this day, the BEAM remains one of the best virtual machines for building systems that need concurrency and fault tolerance at large scale.

It's also what struck me most while reading about its design.
