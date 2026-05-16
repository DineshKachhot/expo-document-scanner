# Quick Start

Welcome to the Expo Document Scanner guide.

## Installation

Install the package in your Expo project:

```bash
npx expo install expo-document-scanner
```

## Basic Usage

```tsx
import React from 'react';
import { View, Button } from 'react-native';
import { scanDocument } from 'expo-document-scanner';

export default function App() {
  const handleScan = async () => {
    try {
      const result = await scanDocument();
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Scan Document" onPress={handleScan} />
    </View>
  );
}
```
