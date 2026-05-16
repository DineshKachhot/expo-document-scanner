# Architecture & Performance

`expo-document-scanner` is designed for maximum performance and minimal latency.

## The Nitro Modules Advantage

Traditional React Native modules use the "Bridge" to communicate between JavaScript and native code. The bridge serializes data into JSON, sends it asynchronously across a message queue, and deserializes it on the other side. This process is slow, especially when dealing with large arrays or image data.

**Nitro Modules** revolutionizes this by using JSI (JavaScript Interface):

1. **Direct Invocation**: JavaScript calls C++ functions directly, which in turn call Swift/Kotlin methods synchronously. There is no message queue.
2. **Zero Serialization**: Complex objects, arrays, and strings are shared directly between environments.
3. **Type Safety**: The API surface is generated from TypeScript definitions, creating highly optimized C++ bindings that ensure types are respected natively.

## Why it Matters for Scanning

Document scanning generates large amounts of data (high-resolution images). In older libraries, returning a base64 string or an array of image paths across the React Native bridge would cause UI stuttering and high CPU usage.

With Nitro Modules in `expo-document-scanner`:
- The UI thread remains completely unblocked while processing images.
- Passing file URIs back to JS happens instantly.
- Memory consumption is strictly controlled on the native side.

## Native APIs Used

We don't build custom camera views. We use the best tools provided by the OS platforms:

- **iOS: VisionKit (`VNDocumentCameraViewController`)**
  The same technology that powers the Notes app on iOS. It provides unparalleled edge detection, automatic capture, and perspective correction.
- **Android: ML Kit Document Scanner**
  Google's state-of-the-art document scanning API. It includes a beautiful Material UI, automatic cropping, and shadow removal.
