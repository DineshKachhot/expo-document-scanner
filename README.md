# expo-document-scanner

A fast, high-quality document scanner for React Native, built as a [Nitro Module](https://nitro.margelo.com). Uses Apple **VisionKit** on iOS and Google **ML Kit** on Android — both fully native, zero JavaScript image processing.

- **iOS** — `VNDocumentCameraViewController` (iOS 13+). Built into the OS, no extra SDK required.
- **Android** — `GmsDocumentScannerOptions` from ML Kit (requires Google Play Services).

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
  - [Expo](#expo-installation)
  - [Bare React Native](#bare-react-native-installation)
- [Setup](#setup)
  - [Expo Setup](#expo-setup)
  - [Bare React Native Setup](#bare-react-native-setup)
    - [iOS Setup](#ios-setup)
    - [Android Setup](#android-setup)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [scanDocument(options)](#scandocumentoptions)
  - [ScanOptions](#scanoptions)
  - [ScanResult](#scanresult)
  - [ScannedPage](#scannedpage)
  - [ScannerMode](#scannermode)
- [Platform Behavior Matrix](#platform-behavior-matrix)
- [Examples](#examples)
  - [Basic scan](#basic-scan)
  - [Scan with quality and base64](#scan-with-quality-and-base64)
  - [Android-specific options](#android-specific-options)
  - [Full example app](#full-example-app)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Requirements

| Platform | Minimum Version | Notes |
|----------|----------------|-------|
| iOS | 13.0 | VisionKit ships with iOS 13+ |
| Android | API 24 (Android 7.0) | Requires Google Play Services |
| React Native | 0.76+ | New Architecture required |
| react-native-nitro-modules | ^0.35.4 | Peer dependency |

> **New Architecture only.** This library is built with Nitro Modules, which requires the React Native New Architecture (Fabric + TurboModules). It will not work with the old bridge.

---

## Installation

### Expo Installation

```sh
npx expo install expo-document-scanner react-native-nitro-modules
```

### Bare React Native Installation

```sh
# npm
npm install expo-document-scanner react-native-nitro-modules

# yarn
yarn add expo-document-scanner react-native-nitro-modules
```

---

## Setup

### Expo Setup

Add the library to your `plugins` in `app.json` (or `app.config.js`) to configure the camera usage description:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-document-scanner",
        {
          "cameraPermission": "This app uses the camera to scan documents."
        }
      ]
    ]
  }
}
```

Since this library uses native code via Nitro Modules, it requires the [New Architecture](https://docs.expo.dev/guides/new-architecture/) and must be used with [Development Builds](https://docs.expo.dev/develop/development-builds/introduction/). It will not work in Expo Go.

To build your development build:

```sh
npx expo run:ios
# or
npx expo run:android
```

### Bare React Native Setup

#### iOS Setup

Run pod install after installing the package:

```sh
cd ios && pod install
```

VisionKit is a system framework — no additional dependencies, entitlements, or privacy manifest entries are required beyond the standard camera permission.

**Add camera usage description to `Info.plist`:**

```xml
<key>NSCameraUsageDescription</key>
<string>This app uses the camera to scan documents.</string>
```

> The library presents `VNDocumentCameraViewController` which automatically requests camera access the first time it is shown. The privacy description above is required by Apple; your app will be rejected from the App Store without it.

---

#### Android Setup

**Ensure Google Play Services is available.**

ML Kit Document Scanner is distributed via Google Play Services (`play-services-mlkit-document-scanner`). The library adds this dependency automatically via its `build.gradle`. No manual Gradle changes are needed.

**Camera permission** is declared in the library's `AndroidManifest.xml` and merged automatically:

```xml
<uses-permission android:name="android.permission.CAMERA" />
```

You do **not** need to add this permission yourself or request it at runtime — the ML Kit scanner UI handles permission prompting internally.

**Minimum requirements:**

- `minSdkVersion` 24 or higher
- Device RAM ≥ 1.7 GB (ML Kit requirement)
- Google Play Services installed and up to date

> ML Kit downloads the scanner model on first use. On first launch the scanner may show a brief loading indicator while the model is fetched. Subsequent launches are instant.

---

## Usage

```typescript
import { scanDocument } from 'expo-document-scanner';

const result = await scanDocument({
  quality: 0.92,
  maxNumDocuments: 5,
});

for (const page of result.pages) {
  console.log(page.uri); // file:// URI to the scanned image
}
```

The function is `async` and resolves when the user finishes scanning and dismisses the scanner UI. It rejects if the user cancels or if an error occurs.

---

## API Reference

### `scanDocument(options)`

```typescript
function scanDocument(options: ScanOptions): Promise<ScanResult>
```

Launches the native document scanner UI. Resolves with a `ScanResult` when the user confirms the scan, or rejects with an `Error` if:

- The user cancels (error message contains `"cancel"`)
- The device does not support scanning (iOS: VisionKit not available; Android: Play Services unavailable)
- A scan is already in progress

Only one scan can be active at a time. Calling `scanDocument` while another scan is pending throws immediately.

---

### `ScanOptions`

All fields are optional. Pass only what you need — sensible defaults are applied per platform.

```typescript
interface ScanOptions {
  quality?: number;
  includeBase64?: boolean;
  maxNumDocuments?: number;
  galleryImportAllowed?: boolean;
  includePdf?: boolean;
  scannerMode?: ScannerMode;
}
```

#### `quality`

| Type | Default | Platform |
|------|---------|----------|
| `number` (0.0 – 1.0) | `1.0` | iOS only |

Controls the output image encoding on iOS:

- `1.0` → PNG (lossless, larger file size)
- `< 1.0` → JPEG at that compression level (`0.92` = 92% quality, etc.)

On Android, ML Kit always outputs JPEG regardless of this value.

```typescript
quality: 1.0   // PNG — lossless, no compression artefacts
quality: 0.92  // JPEG at 92% — good balance of quality and file size
quality: 0.6   // JPEG at 60% — smaller files, visible compression
```

---

#### `includeBase64`

| Type | Default | Platform |
|------|---------|----------|
| `boolean` | `false` | iOS + Android |

When `true`, each `ScannedPage` in the result will include a `base64` field containing the full base64-encoded image string (no `data:` URI prefix).

Use this when you need to embed or upload the image data without a separate file read:

```typescript
const result = await scanDocument({ includeBase64: true });
const base64Image = result.pages[0].base64;

await fetch('https://api.example.com/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image: base64Image }),
});
```

> Enabling base64 on large multi-page scans can consume significant memory. Prefer using `uri` and reading the file lazily when possible.

---

#### `maxNumDocuments`

| Type | Default | Platform |
|------|---------|----------|
| `number` (1 – 100) | `100` | Android only |

The maximum number of pages the user can scan in a single session. On Android, maps to `setPageLimit()` in `GmsDocumentScannerOptions`.

On iOS, VisionKit does not enforce a page limit — the user can add as many pages as they wish.

```typescript
maxNumDocuments: 1   // single-page documents only
maxNumDocuments: 10  // up to 10 pages per session
```

---

#### `galleryImportAllowed`

| Type | Default | Platform |
|------|---------|----------|
| `boolean` | `false` | Android only |

When `true`, the ML Kit scanner UI shows a button to import a document photo from the device gallery, in addition to capturing with the camera.

On iOS, VisionKit's built-in UI does not expose a gallery import option.

```typescript
galleryImportAllowed: true  // shows "Choose from library" button in scanner UI
```

---

#### `includePdf`

| Type | Default | Platform |
|------|---------|----------|
| `boolean` | `false` | Android only |

When `true`, ML Kit generates a multi-page PDF in addition to the per-page JPEG images. The PDF file URI is returned in `ScanResult.pdfUri`.

On iOS, VisionKit does not produce PDF output. `result.pdfUri` will always be `undefined` on iOS.

```typescript
const result = await scanDocument({ includePdf: true });

if (result.pdfUri) {
  console.log('PDF document:', result.pdfUri); // file:// URI
}
```

---

#### `scannerMode`

| Type | Default | Platform |
|------|---------|----------|
| `ScannerMode` | `'full'` | Android only |

Controls the feature set of the ML Kit scanner UI on Android. See [`ScannerMode`](#scannermode) for all values.

On iOS, VisionKit always shows its full scanning UI — automatic edge detection, auto-capture, manual shutter, and image adjustments are always available regardless of this setting.

---

### `ScanResult`

```typescript
interface ScanResult {
  pages: ScannedPage[];
  pdfUri?: string;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `pages` | `ScannedPage[]` | One entry per scanned page, in capture order |
| `pdfUri` | `string \| undefined` | `file://` URI to the generated PDF. Android only, present when `includePdf: true` |

---

### `ScannedPage`

```typescript
interface ScannedPage {
  uri: string;
  base64?: string;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `uri` | `string` | Absolute `file://` URI to the scanned image on disk |
| `base64` | `string \| undefined` | Base64-encoded image data. Present only when `includeBase64: true` |

**File lifetime:** Images are written to the OS temporary directory (`NSTemporaryDirectory` on iOS, the app's cache on Android). They persist for the current app session but may be cleaned up by the OS between launches. Copy them to permanent storage (e.g. using `expo-file-system`) if you need to keep them.

---

### `ScannerMode`

```typescript
type ScannerMode = 'full' | 'base' | 'base_with_filter';
```

Controls the ML Kit scanner UI feature set on **Android only**. iOS always behaves as `'full'`.

| Value | Android Maps To | Behavior |
|-------|----------------|----------|
| `'full'` | `SCANNER_MODE_FULL` | **Default.** Automatic edge detection, auto-capture when document is held steady, manual shutter button, image filter options |
| `'base_with_filter'` | `SCANNER_MODE_BASE_WITH_FILTER` | Manual shutter only (no auto-capture), image filter options available |
| `'base'` | `SCANNER_MODE_BASE` | Manual shutter only, no image filters — fastest, most minimal UI |

Use `'full'` for the best user experience. Use `'base'` or `'base_with_filter'` when you want the user to manually control every capture.

---

## Platform Behavior Matrix

| Option | iOS (VisionKit) | Android (ML Kit) |
|--------|----------------|-----------------|
| `quality` | ✅ JPEG compression or PNG | — Always JPEG, value ignored |
| `includeBase64` | ✅ | ✅ |
| `maxNumDocuments` | — No limit enforced | ✅ `setPageLimit()` |
| `galleryImportAllowed` | — Not supported | ✅ `setGalleryImportAllowed()` |
| `includePdf` | — Not supported | ✅ Adds `RESULT_FORMAT_PDF` |
| `scannerMode` | — Always full UI | ✅ `setScannerMode()` |
| `result.pdfUri` | Always `undefined` | ✅ When `includePdf: true` |
| Page limit | Unlimited | Configurable via `maxNumDocuments` |
| Gallery import | Not available | Configurable via `galleryImportAllowed` |

> Android-only options (`galleryImportAllowed`, `includePdf`, `scannerMode`, `maxNumDocuments`) are silently ignored on iOS. It is safe to pass them unconditionally without `Platform.OS` checks.

---

## Examples

### Basic scan

```typescript
import { scanDocument } from 'expo-document-scanner';

async function scan() {
  try {
    const result = await scanDocument({});

    console.log(`Scanned ${result.pages.length} page(s)`);

    for (const page of result.pages) {
      console.log(page.uri); // file:///tmp/scan_abc123_p0.png
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.toLowerCase().includes('cancel')) {
      console.error('Scan failed:', message);
    }
  }
}
```

---

### Scan with quality and base64

```typescript
const result = await scanDocument({
  quality: 0.85,        // JPEG at 85% quality
  includeBase64: true,  // include base64 data in each page
});

const page = result.pages[0];

// Display the image using the file URI
<Image source={{ uri: page.uri }} style={{ width: 300, height: 400 }} />;

// Or upload directly using the base64 data
await fetch('https://api.example.com/documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pages: result.pages.map((p) => p.base64),
  }),
});
```

---

### Android-specific options

```typescript
import { Platform } from 'react-native';
import { scanDocument } from 'expo-document-scanner';

const result = await scanDocument({
  quality: 0.92,
  maxNumDocuments: 10,

  // These are Android-only but safe to pass on iOS — silently ignored
  galleryImportAllowed: true,  // show "Choose from library" button
  includePdf: true,            // generate a PDF alongside page images
  scannerMode: 'full',         // auto-detect + auto-capture
});

// Display scanned page images
for (const page of result.pages) {
  console.log('Page:', page.uri);
}

// Access the PDF (Android only)
if (Platform.OS === 'android' && result.pdfUri) {
  console.log('PDF:', result.pdfUri);
}
```

---

### Full example app

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { scanDocument } from 'expo-document-scanner';
import type { ScannerMode } from 'expo-document-scanner';

const SCANNER_MODES: { label: string; value: ScannerMode }[] = [
  { label: 'Full (auto-capture)', value: 'full' },
  { label: 'Base + Filters', value: 'base_with_filter' },
  { label: 'Base (manual only)', value: 'base' },
];

export default function App() {
  const [pages, setPages] = useState<string[]>([]);
  const [pdfUri, setPdfUri] = useState<string | undefined>();
  const [scanning, setScanning] = useState(false);

  // Options
  const [galleryImportAllowed, setGalleryImportAllowed] = useState(false);
  const [includePdf, setIncludePdf] = useState(false);
  const [includeBase64, setIncludeBase64] = useState(false);
  const [scannerMode, setScannerMode] = useState<ScannerMode>('full');

  async function handleScan() {
    setScanning(true);
    try {
      const result = await scanDocument({
        quality: 0.92,
        maxNumDocuments: 10,
        includeBase64,
        galleryImportAllowed,
        includePdf,
        scannerMode,
      });

      setPages(result.pages.map((p) => p.uri));
      setPdfUri(result.pdfUri);

      if (includeBase64 && result.pages[0]?.base64) {
        console.log('Base64 length:', result.pages[0].base64.length);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.toLowerCase().includes('cancel')) {
        Alert.alert('Scan failed', message);
      }
    } finally {
      setScanning(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Document Scanner</Text>

        <View style={styles.optionsCard}>
          <Text style={styles.sectionTitle}>Options</Text>

          <Row label="Include Base64">
            <Switch value={includeBase64} onValueChange={setIncludeBase64} />
          </Row>

          {Platform.OS === 'android' && (
            <>
              <Row label="Gallery Import">
                <Switch
                  value={galleryImportAllowed}
                  onValueChange={setGalleryImportAllowed}
                />
              </Row>

              <Row label="Include PDF">
                <Switch value={includePdf} onValueChange={setIncludePdf} />
              </Row>

              <Text style={styles.modeLabel}>Scanner Mode</Text>
              <View style={styles.modeRow}>
                {SCANNER_MODES.map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    style={[
                      styles.modeChip,
                      scannerMode === m.value && styles.modeChipActive,
                    ]}
                    onPress={() => setScannerMode(m.value)}
                  >
                    <Text
                      style={[
                        styles.modeChipText,
                        scannerMode === m.value && styles.modeChipTextActive,
                      ]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, scanning && styles.buttonDisabled]}
          onPress={handleScan}
          disabled={scanning}
        >
          <Text style={styles.buttonText}>Scan Document</Text>
        </TouchableOpacity>

        {scanning && (
          <ActivityIndicator size="large" color="#007AFF" style={styles.spinner} />
        )}

        {pdfUri && <Text style={styles.pdfNote}>PDF: {pdfUri}</Text>}

        {pages.length > 0 && (
          <>
            <Text style={styles.subtitle}>{pages.length} page(s) scanned</Text>
            {pages.map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={styles.page}
                resizeMode="contain"
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F2F7' },
  container: { padding: 24, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24, color: '#1C1C1E' },
  optionsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 15, color: '#1C1C1E' },
  modeLabel: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginTop: 4 },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C6C6C8',
    backgroundColor: '#F2F2F7',
  },
  modeChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  modeChipText: { fontSize: 13, color: '#3C3C43' },
  modeChipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  spinner: { marginVertical: 24 },
  pdfNote: { marginTop: 12, fontSize: 12, color: '#8E8E93', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#3C3C43', marginTop: 24, marginBottom: 16 },
  page: {
    width: 320,
    height: 420,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C6C6C8',
    backgroundColor: '#FFFFFF',
  },
});
```

---

## Troubleshooting

### iOS: "Document scanning is not supported on this device"

`VNDocumentCameraViewController.isSupported` returned `false`. This happens on:

- iOS Simulator (no camera hardware)
- Very old iPhone/iPad models

Run on a physical iOS 13+ device.

---

### iOS: Build error — missing `ScanMode.swift` or similar generated file

After upgrading the library, the Pods project may reference stale nitrogen-generated files that have been renamed or removed. Fix by running:

```sh
cd ios && pod install
```

---

### iOS: Blank/black scanner screen

Ensure `NSCameraUsageDescription` is present in your `Info.plist`. Without it the system silently denies camera access and shows a blank screen.

---

### Android: Scanner does not launch / "No Activity is currently active"

The ML Kit scanner uses `startIntentSenderForResult`, which requires a foreground Activity. Ensure you are calling `scanDocument` from an active, visible screen — not during app startup, in a background service, or inside a `useEffect` that fires before the component is mounted.

---

### Android: Scanner shows a loading spinner on first launch

ML Kit downloads the document scanner model on first use (~a few MB). This is expected. The model is cached on device and subsequent launches are instant.

---

### Android: "GmsDocumentScanningResult is null"

Check:

1. Google Play Services is installed and up to date.
2. The device has internet connectivity for the first-run model download.
3. The device has at least 1.7 GB RAM.

---

### Android: "A scan is already in progress"

`scanDocument` was called while a previous scan had not yet resolved or been cancelled. Ensure you await the result and disable your scan button while scanning is in progress.

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### Development setup

```sh
# Clone
git clone https://github.com/DineshKachhot/expo-document-scanner.git
cd expo-document-scanner

# Install root and example dependencies
yarn install

# Regenerate native bridges after editing the Nitro spec
yarn nitrogen

# iOS — sync pods after nitrogen
cd example/ios && pod install && cd ../..

# Run the example on a physical device
yarn example ios
yarn example android
```

### Project structure

```
expo-document-scanner/
├── src/
│   ├── ExpoDocumentScanner.nitro.ts   # TypeScript Nitro spec — source of truth for the API
│   ├── scanner.native.ts              # Native entry point (iOS + Android)
│   ├── scanner.ts                     # Web / non-native fallback
│   └── index.tsx                      # Public exports
├── ios/
│   └── ExpoDocumentScanner.swift      # iOS VisionKit implementation
├── android/src/main/java/
│   └── .../ExpoDocumentScanner.kt     # Android ML Kit implementation
├── nitrogen/generated/                # Auto-generated C++ / Swift / Kotlin bridges
│                                      # DO NOT edit — regenerated by `yarn nitrogen`
└── example/                           # Example application
```

**To add or change an API option:**

1. Edit `src/ExpoDocumentScanner.nitro.ts`
2. Run `yarn nitrogen` — regenerates C++ / Swift / Kotlin bridges in `nitrogen/generated/`
3. Update `ios/ExpoDocumentScanner.swift` to handle the new option
4. Update `android/.../ExpoDocumentScanner.kt` to handle the new option
5. Run `cd example/ios && pod install` to sync Xcode with the new generated files
6. Run `cd example/android && ./gradlew assembleDebug` to verify Android build

---

## License

MIT © [Dinesh Kachhot](https://github.com/DineshKachhot)

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob) and [Nitro Modules](https://nitro.margelo.com)
