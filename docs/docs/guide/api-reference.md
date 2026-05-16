# API Reference

This page details the API exposed by `expo-document-scanner`.

## `scanDocument(options?)`

The primary function to trigger the native document scanner.

### Parameters

- `options` (optional): An object to configure the scanning session.

#### `ScanOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxPages` | `number` | `0` (unlimited) | The maximum number of pages a user can scan in one session. |
| `responseType` | `'uri' \| 'base64' \| 'both'` | `'uri'` | The format of the returned images. `'uri'` is recommended for performance. |
| `quality` | `number` | `1.0` | The JPEG compression quality. Ranges from `0.0` (lowest) to `1.0` (highest). |
| `letUserAdjustCrop` | `boolean` | `true` | (Android only) Whether to allow the user to manually adjust the crop corners after scanning. |

### Returns

Returns a `Promise` that resolves to a `ScanResult` object.

#### `ScanResult`

A discriminated union based on the `status` property.

**Success Result**
```typescript
{
  status: 'success';
  scannedImages: string[]; // Array of file URIs or base64 strings depending on responseType
}
```

**Cancel Result**
```typescript
{
  status: 'cancel';
}
```

**Error Result**
```typescript
{
  status: 'error';
  message: string;
}
```

## Types

You can import these types directly from the package if you are using TypeScript:

```typescript
import type { ScanOptions, ScanResult } from 'expo-document-scanner';
```
