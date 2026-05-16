# Advanced Usage

This section covers advanced configurations and best practices for using `expo-document-scanner` in production applications.

## Handling Base64 Responses

While returning file URIs is the most efficient way to handle large images, sometimes you need the raw `base64` data to send directly to an API.

```tsx
const scanAndUpload = async () => {
  const result = await scanDocument({
    responseType: 'base64',
    quality: 0.7 // Compress slightly to reduce payload size
  });

  if (result.status === 'success') {
    const base64Images = result.scannedImages;
    
    // Example: send to API
    await fetch('https://api.yourdomain.com/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: base64Images })
    });
  }
};
```

> **Warning:** Returning base64 strings for high-resolution images can consume significant memory. Always use a lower `quality` setting if you must use base64, or prefer uploading files directly via their `uri` using `FormData`.

## Uploading Images via URI (Recommended)

The most memory-efficient way to handle scanned documents is to leave them on the disk and upload them using `FormData`.

```tsx
const result = await scanDocument({ responseType: 'uri' });

if (result.status === 'success') {
  const formData = new FormData();
  
  result.scannedImages.forEach((uri, index) => {
    formData.append(`document_${index}`, {
      uri: uri,
      name: `scanned_${index}.jpg`,
      type: 'image/jpeg',
    } as any); // React Native FormData type workaround
  });

  await fetch('https://api.yourdomain.com/upload', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
```

## Error Handling

Always wrap your scanning logic in a `try/catch` block, and verify the `status` of the result. Note that user cancellations are returned as a `status: 'cancel'` result, rather than throwing an exception.

Exceptions are only thrown for critical failures, such as missing permissions or underlying native crashes.
