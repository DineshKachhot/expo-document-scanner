# Troubleshooting & FAQ

Here are some common issues you might encounter and how to resolve them.

## Common Issues

### 1. The scanner doesn't open on Expo Go

**Symptom:** You call `scanDocument()` but nothing happens, or you get an error about a missing native module.

**Solution:** `expo-document-scanner` contains custom native iOS and Android code. It **cannot** be used inside the standard Expo Go app. You must create a development build using `npx expo run:ios` or `npx expo run:android`, or by using EAS Build.

### 2. Permissions Error on iOS

**Symptom:** App crashes when opening the scanner on iOS.

**Solution:** Ensure you have added the `NSCameraUsageDescription` to your `Info.plist`. If you are using Expo, this is usually handled by the plugin, but verify your `app.json` has the correct config:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "This app needs access to your camera to scan documents."
      }
    }
  }
}
```

### 3. Build Fails with Nitro Modules Error

**Symptom:** Compilation errors related to `nitrogen` or C++ headers.

**Solution:** Nitro Modules auto-generates C++ bindings. Sometimes, these bindings need to be regenerated.
1. Run `yarn nitrogen` or `npm run nitrogen` in your project root.
2. Clean your build folders (`android/app/build` or `ios/build`).
3. Rebuild the app.

## Frequently Asked Questions

**Q: Can I customize the UI of the scanner?**
A: No. `expo-document-scanner` intentionally uses the native UI provided by Apple (VisionKit) and Google (ML Kit) to provide the highest quality and most familiar experience to users. Customizing the UI would require building a custom camera pipeline, which is outside the scope of this library.

**Q: Does this work offline?**
A: Yes! Both iOS VisionKit and Android ML Kit process images entirely on-device. No internet connection is required to scan documents.
