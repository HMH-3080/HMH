# Building Reliable Backend Systems

A deep dive into designing fault-tolerant microservices that actually work in production.

## The Problem

Most backend systems fail not because of bad code, but because of bad assumptions. We assume the network is reliable. We assume databases are always up. We assume disk space is infinite.

## Core Principles

### 1. Embrace Failure

Every component will fail. The question is not *if*, but *when*. Design for failure from day one — starting with the humble retry, done right: bounded attempts, exponential backoff, and jitter so a recovering dependency isn't hit by a synchronized stampede:

```elixir
defmodule Shop.Retry do
  def call(fun, attempts \\ 3, delay_ms \\ 100)
  def call(_fun, 0, _delay), do: {:error, :exhausted}

  def call(fun, attempts, delay_ms) do
    case fun.() do
      {:ok, _} = ok ->
        ok

      {:error, _} ->
        # exponential backoff + jitter: 100ms, ~200ms, ~400ms...
        Process.sleep(delay_ms + :rand.uniform(delay_ms))
        call(fun, attempts - 1, delay_ms * 2)
    end
  end
end
```

Three attempts, then a verdict — never an infinite loop, never a thundering herd.

### 2. Observability First

You cannot fix what you cannot see. Instrument everything:

- **Metrics**: Latency, throughput, error rates
- **Logs**: Structured, contextual, searchable
- **Traces**: End-to-end request flow

In Elixir, that means emitting telemetry around the operations that matter, so dashboards and alerts read reality instead of guessing it:

```elixir
start = System.monotonic_time(:millisecond)
result = Payments.charge(order)

:telemetry.execute(
  [:shop, :payment, :stop],
  %{duration: System.monotonic_time(:millisecond) - start},
  %{result: elem(result, 0)}
)
```

One event per charge, carrying its duration and outcome — enough to graph latency percentiles, error budgets, and per-processor health.

### 3. Graceful Degradation

When a non-critical service fails, the system should continue working with reduced functionality rather than crashing entirely:

```elixir
def recommendations(user) do
  case Breaker.call(:recommender, fn -> Recommender.for_user(user) end) do
    {:ok, items} -> items
    {:error, _} -> Catalog.popular(10) # degraded, not dead
  end
end
```

Personalized when possible, popular items when not. The page always renders.

## Real-World Example: Payments That Survive

Consider a payment processing system with two processors and a retry queue. The rules: trip the breaker after 5 failures, fail over to the secondary, queue for retry if both are down, and never crash the request:

```elixir
defmodule Shop.Breaker do
  use GenServer

  defstruct [:threshold, :reset_ms, failures: 0, state: :closed, opened_at: nil]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: Keyword.fetch!(opts, :name))
  end

  def call(name, fun) do
    case GenServer.call(name, :allow?) do
      :ok ->
        case fun.() do
          {:ok, _} = ok -> GenServer.cast(name, :success); ok
          {:error, _} = err -> GenServer.cast(name, :failure); err
        end

      # open breaker: fail fast in microseconds, don't touch the dead service
      {:error, :open} = err ->
        err
    end
  end

  def init(opts) do
    {:ok, %__MODULE__{
      threshold: Keyword.get(opts, :threshold, 5),
      reset_ms: Keyword.get(opts, :reset_ms, 30_000)
    }}
  end

  # closed: traffic flows, failures counted
  def handle_call(:allow?, _, %{state: :closed} = s), do: {:reply, :ok, s}

  # open: reject instantly — unless the reset window passed, then allow one trial
  def handle_call(:allow?, _, %{state: :open, opened_at: t, reset_ms: ms} = s) do
    if System.monotonic_time(:millisecond) - t > ms do
      {:reply, :ok, %{s | state: :half_open}}
    else
      {:reply, {:error, :open}, s}
    end
  end

  def handle_call(:allow?, _, %{state: :half_open} = s), do: {:reply, :ok, s}

  def handle_cast(:success, s), do: {:noreply, %{s | failures: 0, state: :closed}}

  def handle_cast(:failure, %{state: :half_open} = s),
    do: {:noreply, %{s | state: :open, opened_at: now()}}

  def handle_cast(:failure, %{failures: n, threshold: t} = s) when n + 1 >= t,
    do: {:noreply, %{s | failures: n + 1, state: :open, opened_at: now()}}

  def handle_cast(:failure, %{failures: n} = s),
    do: {:noreply, %{s | failures: n + 1}}

  defp now, do: System.monotonic_time(:millisecond)
end
```

Three states, each doing exactly one job: `:closed` passes traffic while counting, `:open` fails fast without touching the dead dependency, `:half_open` lets a single trial request through after the reset window.

Wired to the payment flow, the five survival steps from the whiteboard become executable code:

```elixir
def charge(order) do
  with {:error, _} <- Breaker.call(:primary, fn -> PrimaryProcessor.charge(order) end),
       {:error, _} <- Breaker.call(:secondary, fn -> SecondaryProcessor.charge(order) end) do
    # both down: persist for retry, alert, and answer the client now
    Oban.insert(PaymentRetryJob.new(%{order_id: order.id}))
    Ops.notify(:payments_degraded)
    {:queued, order.id}
  end
end
```

Primary fails, the breaker trips after 5 failures, traffic fails over to the secondary, both failing means the order is queued and operations is notified — and the customer gets an answer instead of a timeout.

This is not complexity — this is survival.

## Conclusion

Reliable systems are not built by accident. They are designed, tested, and operated with discipline. Start with failure in mind, and you'll build something that lasts.
