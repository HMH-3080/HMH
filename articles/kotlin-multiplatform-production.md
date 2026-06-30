# Kotlin Multiplatform in Production

Lessons learned from shipping KMP across Android, iOS, and backend.

## Why KMP?

The promise is simple: write once, run everywhere. The reality is more nuanced — but still powerful.

### Shared Business Logic

The biggest win is not UI code sharing. It's **business logic** sharing:

```kotlin
class OrderProcessor(
    private val repository: OrderRepository,
    private val notifier: NotificationService
) {
    suspend fun process(order: Order): Result<OrderConfirmation> {
        val validated = validator.validate(order)
        val saved = repository.save(validated)
        notifier.notify(saved.customerId, "Order confirmed")
        return Result.success(saved)
    }
}
```

This code runs identically on Android, iOS, and JVM.

## Platform-Specific Code

Not everything can be shared. Use `expect`/`actual` declarations:

```kotlin
// Shared
expect fun platformName(): String

// Android
actual fun platformName(): String = "Android ${Build.VERSION.SDK_INT}"

// iOS
actual fun platformName(): String = UIDevice.currentDevice.systemName()
```

## Production Challenges

### Dependency Management

KMP dependencies are tricky. Not all libraries support multiplatform. Choose carefully:

- **Ktor**: Full KMP support
- **SQLDelight**: Full KMP support
- **Koin**: Full KMP support
- **Coil**: Compose Multiplatform support

### Testing

Write tests once, run on all platforms. Use `@Test` annotations from `kotlin.test`.

### Build Times

KMP builds are slower than single-platform. Mitigate with:
- Gradle configuration caching
- Parallel compilation
- Incremental compilation

## Results

After 6 months in production:
- **40% less duplicated code**
- **Faster feature parity** between platforms
- **Consistent behavior** across all clients

## The Trade-off

KMP is not free. It requires discipline, careful architecture, and team buy-in. But for the right project, it's transformative.