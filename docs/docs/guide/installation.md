# Installation

Setting up `expo-document-scanner` in your project is straightforward. Because it relies on native modules, there are a few platform-specific steps handled automatically by Expo.

## Prerequisites

- React Native 0.73 or higher
- Expo SDK 50 or higher (if using Expo)
- `react-native-nitro-modules`

## Installing the Package

Using npm:
```bash
npm install expo-document-scanner react-native-nitro-modules
```

Using Yarn:
```bash
yarn add expo-document-scanner react-native-nitro-modules
```

Using Expo CLI:
```bash
npx expo install expo-document-scanner react-native-nitro-modules
```

## Setup for Expo Managed Workflow

Since this library uses native code (VisionKit on iOS and ML Kit on Android), you cannot use it with Expo Go. You must create a development build.

### 1. Add Plugins (If necessary)
In your `app.json` or `app.config.js`, ensure you have the required permissions. The plugin usually handles this automatically, but if you need to specify camera permissions manually:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-document-scanner",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera to scan documents."
        }
      ]
    ]
  }
}
```

### 2. Create a Development Build

Run the following command to create your development build:
```bash
npx expo run:ios
# or
npx expo run:android
```

## Setup for Bare React Native

If you are not using Expo, you need to install the CocoaPods dependencies for iOS:

```bash
cd ios
pod install
cd ..
```

For Android, auto-linking will handle the native dependencies. Just ensure your `minSdkVersion` is at least 24 in `android/build.gradle`.

Now you're ready to move on to the [Quick Start](/guide/quick-start) guide!
