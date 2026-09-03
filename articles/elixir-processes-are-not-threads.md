# Elixir Can Run Millions of Processes at Once — And No, They Are Not Threads

When you hear that Elixir can run millions of processes at the same time, the first and most natural reaction is: "Those must just be threads under a different name."

But the truth is that concurrency in Elixir is completely different from most of the languages we're used to.

In traditional languages, when you need to do things in parallel, you usually deal with OS threads. And those threads are relatively expensive resources — they share the same memory, which means you quickly enter the world of locks, mutexes, race conditions, and all the familiar problems.

In Elixir, on the other hand, you never deal with OS threads directly. At all.

The BEAM VM has its own concept called processes — extremely lightweight processes, each with its own private memory, and no shared memory between them whatsoever.

So when you write:

```elixir
spawn(fn ->
  do_something()
end)
```

You're not asking the operating system to create a new thread. You're asking the BEAM to create a new process that weighs just a few kilobytes — something so cheap that running thousands or even millions of processes becomes completely normal.

So who runs all of these processes?

This is where one of the smartest parts of the BEAM comes in: the scheduler.

The scheduler is a small group of OS threads — usually matching the number of CPU cores on your machine — and each scheduler is responsible for managing and running thousands or millions of processes with remarkable intelligence.

The BEAM gives each process a tiny slice of time, then moves execution to the next one at staggering speed — so fast that everything looks like it's running at the exact same moment.

And more important than all of that: processes are completely isolated from one another.

No shared memory. No locks. No deadlocks. And no process can ever corrupt another process.

And if one of them crashes?

Simply put — its supervisor brings it back to life.

And that is the real secret behind systems built on Elixir and Erlang staying up for years with almost no downtime.

The beauty of it all is that you, as a developer, are not expected to spend your life fighting concurrency bugs. You just write small, independent processes — and the BEAM VM fights the entire war in the background.

Which is probably the real reason so many people say that once you start to understand concurrency in Elixir, you begin to look at every other runtime in a completely different way.
