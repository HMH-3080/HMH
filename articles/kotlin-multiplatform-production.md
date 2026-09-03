# Kotlin Multiplatform in Production

Lessons learned from shipping KMP across Android, iOS, and backend.

## Why KMP?

The promise is simple: write once, run everywhere. The reality is more nuanced — but still powerful.

### Shared Business Logic

The biggest win is not UI code sharing. It's **business logic** sharing — written once, with production error handling, running identically on Android, iOS, and JVM:

```kotlin
class OrderProcessor(
    private val repository: OrderRepository,
    private val notifier: NotificationService
) {
    suspend fun process(draft: DraftOrder): Result<OrderConfirmation> =
        runCatching { require(draft.lines.isNotEmpty()) { "empty order" } }
            .mapCatching { repository.save(draft) }
            .onSuccess { saved ->
                // notifying must never fail the order itself
                runCatching { notifier.notify(saved) }
                    .onFailure { Logger.e(it) { "notify failed for ${saved.id}" } }
            }
            .map { saved -> OrderConfirmation(saved.id, saved.total) }
}
```

Validation, persistence, and notification in one shared chain — the Android app, the iOS app, and the backend all execute exactly this path, so a bug fixed here is fixed everywhere.

The repository behind it is shared too. One Ktor implementation maps HTTP reality into domain errors on every platform:

```kotlin
class RemoteOrderRepository(private val client: HttpClient) : OrderRepository {
    override suspend fun save(draft: DraftOrder): SavedOrder =
        try {
            client.post("https://api.shop.com/orders") {
                contentType(ContentType.Application.Json)
                setBody(draft)
            }.body()
        } catch (e: ClientRequestException) {
            throw OrderRejected(e.response.status.value)
        } catch (e: IOException) {
            throw NetworkDown(e)
        }
}
```

A 422 becomes a domain rejection the UI can explain; a dead network becomes a retryable state — decided once, in `commonMain`, instead of three times per platform.

## Platform-Specific Code

Not everything can be shared — but `expect`/`actual` should be your last resort, not your first. Prefer a multiplatform library (`kotlinx-datetime` over hand-rolled clocks, Ktor over per-platform HTTP). When the platform genuinely differs, isolate the seam to something tiny and stable, like dispatchers:

```kotlin
// commonMain — the only platform seam in the whole module
expect val AppDispatchers: DispatcherSet

data class DispatcherSet(
    val main: CoroutineDispatcher,
    val io: CoroutineDispatcher
)

// androidMain
actual val AppDispatchers =
    DispatcherSet(main = Dispatchers.Main, io = Dispatchers.IO)

// iosMain
actual val AppDispatchers =
    DispatcherSet(main = Dispatchers.Main, io = Dispatchers.Default)
```

Two lines per platform, reviewed once, never touched again — while hundreds of lines of logic above them stay shared. That ratio is the whole game: shrink the `actual` surface until sharing is the default and platform code is the exception.

## Production Challenges

### Dependency Management

KMP dependencies are tricky. Not all libraries support multiplatform. Choose carefully:

- **Ktor**: Full KMP support
- **SQLDelight**: Full KMP support
- **Koin**: Full KMP support
- **Coil**: Compose Multiplatform support

Rule of thumb: if a library has no `commonMain` artifact, assume you'll write (and maintain) the `expect`/`actual` bridge yourself — and budget for it.

### Testing

Write tests once, run on all platforms. `kotlin.test` gives you the assertions everywhere, and `runTest` gives you deterministic coroutines — including the failure paths, which is where shared logic earns its keep:

```kotlin
class OrderProcessorTest {
    @Test
    fun emptyOrderIsRejected() = runTest {
        val processor = OrderProcessor(FakeRepository(), FakeNotifier())

        val result = processor.process(DraftOrder(lines = emptyList()))

        assertTrue(result.isFailure)
    }

    @Test
    fun notificationFailureDoesNotFailTheOrder() = runTest {
        val processor = OrderProcessor(FakeRepository(), FailingNotifier())

        val result = processor.process(DraftOrder(lines = listOf(line())))

        assertTrue(result.isSuccess)
    }
}
```

The second test is the one that matters: it locks in the "notify must never fail the order" decision on Android, iOS, and JVM simultaneously.

### Build Times

KMP builds are slower than single-platform. Mitigate with:

- Gradle configuration caching (`org.gradle.configuration-cache=true`)
- Parallel compilation
- Incremental compilation

Measure before optimizing — in practice, the shared module compiles once while the per-platform cost stays close to a native build.

## Results

After 6 months in production:

- **40% less duplicated code**
- **Faster feature parity** between platforms
- **Consistent behavior** across all clients

## The Trade-off

KMP is not free. It requires discipline, careful architecture, and team buy-in. But for the right project, it's transformative.
