# The BEAM Memory Model: Isolation Instead of Sharing

One of the things that keeps making me see the BEAM runtime differently from any other runtime is how it handles memory.

When you hear the word "concurrency," you probably think of threads, coroutines, or goroutines. But on the BEAM, you get a different concept: process isolation.

Every BEAM process has what is effectively its own isolated memory space. Processes do not share the same mutable memory. So if process A holds:

```elixir
data = %{name: "Hasan"}
```

and sends it to process B:

```elixir
send(pid, data)
```

then process B does not receive a reference it can use to mutate data inside process A. Communication happens through message passing — and that changes how you think, completely.

## There Is No Reference Back

This is worth seeing once, because it feels wrong until it clicks. The child can "edit" what it received all day — the parent's data never moves:

```elixir
parent = self()

child = spawn(fn ->
  receive do
    %{name: name} = user ->
      send(parent, {:seen, %{user | name: name <> " (edited by child)"}})
  end
end)

user = %{name: "Hasan"}
send(child, user)

receive do
  {:seen, edited} -> IO.inspect(edited)
  # => %{name: "Hasan (edited by child)"}
end

IO.inspect(user)
# => %{name: "Hasan"} — untouched, always
```

Mutation at a distance isn't something you defend against here. It simply doesn't exist.

## Shared Memory Makes You Think About Locks

In Kotlin coroutines or Go goroutines, you're usually working with shared memory — so you start thinking about mutexes, locks, atomics, race conditions, and thread safety.

On the BEAM, the picture is:

```text
Process A ───── Message ─────► Process B
```

Each process isolated from the next. And that isolation pays off twice: if one process crashes, the application doesn't have to go down with it — and garbage collection happens per process instead of stopping the entire system to clean one global heap.

The determinism is something you can verify, not just believe. Ten thousand concurrent increments, and the answer is exact every single run:

```elixir
defmodule SafeCounter do
  def start, do: spawn(fn -> loop(0) end)

  defp loop(n) do
    receive do
      {:inc, from} -> send(from, :ok); loop(n + 1)
      {:get, from} -> send(from, {:n, n}); loop(n)
    end
  end
end

counter = SafeCounter.start()
for _ <- 1..10_000, do: send(counter, {:inc, self()})
for _ <- 1..10_000, do: (receive do: (:ok -> :ok))

send(counter, {:get, self()})
receive do: ({:n, n} -> IO.puts("final: #{n}"))
# => final: 10000 — every time, no mutex in sight
```

Because each sender's messages arrive in order and only one process ever touches the count, the race condition has nowhere to live.

Isolation is also observable. Every process carries its own measurable heap, mailbox, and GC stats:

```elixir
pid = spawn(fn -> receive do: (:stop -> :ok) end)

{:memory, bytes} = Process.info(pid, :memory)
IO.puts("one process costs ~#{bytes} bytes")

Process.info(pid, [:heap_size, :message_queue_len, :garbage_collection])
# => [heap_size: 233, message_queue_len: 0, garbage_collection: [...]]
```

## But Is Everything Copied?

Here an important question appears: does everything get copied?

The answer: not necessarily. The BEAM treats large binaries specially — anything over 64 bytes becomes a reference-counted binary shared between processes instead of copied. So moving megabytes through messages stays cheap:

```elixir
big = :crypto.strong_rand_bytes(10_000_000) # 10 MB ref-counted binary

child = spawn(fn -> receive do: (:go -> :ok) end)
send(child, big)
# no 10 MB copy — both processes point at the same refc binary
```

Small terms copy (which is exactly what keeps heaps independent and cheap to collect); large binaries share safely because binaries are immutable.

## Beyond Processes: ETS

But the memory model doesn't stop at processes. There's also ETS — in-memory storage living outside any process heap, letting huge numbers of processes hit shared data in memory with high-performance concurrent access.

That makes it a natural fit for caching, counters, rate limiting, routing tables, and in-memory indexes:

```elixir
:ets.new(:cache, [:named_table, :public, read_concurrency: true])

:ets.insert(:cache, {"session:abc", %{user_id: 42}})
:ets.lookup(:cache, "session:abc")
# => [{"session:abc", %{user_id: 42}}]

# an atomic counter shared by thousands of processes —
# no GenServer bottleneck, no serialization point
:ets.new(:hits, [:named_table, :public, write_concurrency: true])
:ets.update_counter(:hits, :homepage, {2, 1}, {:homepage, 0})
```

And a complete sliding-window rate limiter is barely longer — one atomic operation per request, safe under any concurrency:

```elixir
defmodule RateLimit do
  @table :rate_limit
  @limit 100     # requests
  @window 60_000 # per minute

  def init do
    :ets.new(@table, [:named_table, :public, :set, write_concurrency: true])
  end

  def allow?(key) do
    now = System.system_time(:millisecond)
    window = div(now, @window)

    # atomic create-or-increment of this window's counter
    count = :ets.update_counter(@table, {key, window}, {2, 1}, {{key, window}, 0})
    count <= @limit
  end
end
```

(Old windows simply stop matching; sweep them with a periodic cleanup pass and the table stays flat.)

## One Process per Entity

And here is exactly where you start to see why the BEAM suits systems with enormous numbers of independent entities. Each process can be a connection, a user session, a device, an order, a worker, or a network peer — each with its own state, memory, mailbox, and lifecycle. Named and findable, too:

```elixir
{:ok, _} = Registry.start_link(keys: :unique, name: DeviceRegistry)

{:ok, pid} = GenServer.start_link(Device, nil,
  name: {:via, Registry, {DeviceRegistry, "device-7"}})

# anywhere in the system:
[{device, _}] = Registry.lookup(DeviceRegistry, "device-7")
```

So when comparing a Kotlin coroutine, a Go goroutine, and a BEAM process, the comparison isn't "which is lighter?" The real comparison is: do you want mere concurrent execution — or thousands or millions of independent entities, each with its own state, lifecycle, and failure isolation?

In the second case, the BEAM isn't just concurrency. It gives you a complete memory model built on isolation, messages, and fault isolation.

And that is one of the reasons understanding the BEAM memory model matters so much for anyone who wants to genuinely understand Elixir and Erlang.
