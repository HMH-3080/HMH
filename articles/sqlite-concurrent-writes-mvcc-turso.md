# SQLite Concurrent Writes and MVCC: How Turso Is Changing the Game

What makes SQLite genuinely impressive is that it's a small, simple database that can power massive, real-world products.

But anyone who has worked with SQLite under real pressure — workloads with concurrent writes — has almost certainly encountered this familiar error:

```text
SQLITE_BUSY
database is locked
```

The truth is, this isn't a bug in SQLite. It's a direct consequence of the design philosophy it was built on over 20 years ago.

## SQLite's Core Philosophy

SQLite operates on a simple principle:

> Many readers? No problem.
>
> But only one writer at a time.

Even with **WAL Mode** enabled — one of the most significant improvements SQLite has seen — the model remains:

```text
Multiple Readers
        +
Single Writer
```

WAL solves the problem of readers blocking the writer and vice versa. But it **does not solve the problem of having more than one writer at the same time**. If a write transaction is in progress, any other write transaction must wait — or it may end up returning `SQLITE_BUSY` under heavy load.

And that's entirely logical when you think about it.

SQLite is built on the principle that the data itself is the single source of truth. Before anyone can write, they must acquire a lock that guarantees no one else is modifying the data at the same time.

But with modern applications, multi-core CPUs, and complex business logic executing inside transactions, this model has started showing its limits clearly.

## Enter Turso: Concurrent Writes with MVCC

This is where one of the most fascinating developments I've seen recently in the database world comes in:

**Turso achieving concurrent writes in SQLite using MVCC.**

## How MVCC Works

The core idea behind **MVCC (Multi-Version Concurrency Control)** is fundamentally different from traditional locking.

Instead of a transaction acquiring a lock and declaring:

> "No one touches this data until I'm done."

MVCC says:

> "Work freely. I'll figure out at the end if there was a real conflict."

Consider a simple table:

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    quantity INTEGER
);
```

If Transaction 1 starts modifying Product 1:

- **Traditional SQLite**: Any other writer must wait.
- **With MVCC**: The system creates a **new version of the row**, while the old version remains visible to other transactions. Multiple transactions can proceed simultaneously without blocking each other.

## Turso vs. SQLite's BEGIN CONCURRENT

The clever part is that Turso doesn't implement MVCC the same way PostgreSQL does.

Turso has essentially added an MVCC layer on top of SQLite's own B-Tree and WAL, while preserving the familiar SQLite experience. Row versions are tracked through an in-memory index, and real conflicts are detected at the **row level** at commit time.

This is a critical distinction.

SQLite itself has an experimental feature called:

```sql
BEGIN CONCURRENT
```

But it detects conflicts at the **page level**, not the row level. This means two transactions modifying different rows on the same page are considered conflicting — even though they're logically independent.

With Turso's MVCC implementation, true conflicts are detected at the actual **row level**.

## Results

The early results are compelling.

In benchmarks involving business logic inside transactions, Turso achieved **improvements up to 4x over traditional SQLite**, because CPU cores can finally operate in parallel instead of waiting for a single writer to release a lock.

## What Makes This Special

But the numbers aren't what impressed me most.

What's genuinely beautiful here is that we're seeing the first serious attempt to answer a very old question:

> Can we preserve SQLite's simplicity while eliminating the single-writer curse?

The feature is still in preview, and there are real challenges ahead — managing row versions, memory consumption, and some scalability concerns.

But if Turso delivers a stable, production-ready implementation, we may be witnessing the biggest shift in SQLite's operational model since WAL was introduced.

That's worth paying attention to.

---

*#SQLite #MVCC #Turso #Databases #Backend #SoftwareEngineering #DistributedSystems*
