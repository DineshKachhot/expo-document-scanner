# Introduction

Welcome to the **Expo Document Scanner** documentation!

`expo-document-scanner` is a high-performance native document scanner for React Native and Expo applications. It leverages native scanning capabilities provided by the OS:
- **iOS**: Uses `VisionKit` for native UI and fast edge detection.
- **Android**: Uses `ML Kit` Document Scanner API for robust, reliable scanning on Android devices.

## Why Expo Document Scanner?

Many document scanning libraries rely on older bridge-based architectures or require ejecting from Expo. This library is built differently:

- **Built with Nitro Modules**: Uses `react-native-nitro-modules` for lightning-fast, zero-overhead JSI communication between JavaScript and native code.
- **Expo Compatible**: Works seamlessly with the Expo managed workflow.
- **Native UIs**: Provides a premium scanning experience by using the official native document scanning components provided by Apple and Google.
- **High Quality**: Automatically handles perspective correction, cropping, and color enhancement.

## Benefits of Nitro Modules

By utilizing **React Native Nitro Modules**, this library achieves performance that traditional React Native bridges cannot match:
- **Zero Bridge Overhead**: Calls between JS and native code happen synchronously, avoiding the asynchronous bridge queue.
- **Direct Memory Access**: Native objects and arrays are shared directly with JavaScript without expensive serialization/deserialization.
- **Type Safety**: Strongly typed interfaces via Swift and Kotlin provide robust guarantees and a smooth developer experience.
- **C++ Core**: Under the hood, the module uses C++ to ensure maximum speed and minimal latency when passing large image paths or base64 strings back to JS.

Explore the [Installation](/guide/installation) guide to get started!
