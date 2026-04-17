import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { scanDocument } from 'expo-document-scanner';
import type { ScanMode } from 'expo-document-scanner';

export default function App() {
  const [uris, setUris] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);

  async function handleScan(mode: ScanMode) {
    setScanning(true);
    try {
      const result = await scanDocument({ mode, maxNumDocuments: 10 });
      setUris(result.uris);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes('cancelled')) {
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

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, scanning && styles.buttonDisabled]}
            onPress={() => handleScan('auto')}
            disabled={scanning}
          >
            <Text style={styles.buttonText}>Auto Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonSecondary,
              scanning && styles.buttonDisabled,
            ]}
            onPress={() => handleScan('manual')}
            disabled={scanning}
          >
            <Text style={styles.buttonText}>Manual Scan</Text>
          </TouchableOpacity>
        </View>

        {scanning && (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={styles.spinner}
          />
        )}

        {uris.length > 0 && (
          <>
            <Text style={styles.subtitle}>{uris.length} page(s) scanned</Text>
            {uris.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={styles.page}
                resizeMode="contain"
              />
            ))}
          </>
        )}

        {uris.length === 0 && !scanning && (
          <Text style={styles.hint}>
            Tap a button above to scan a document.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  container: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 32,
    color: '#1C1C1E',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#34C759',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  spinner: {
    marginVertical: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#3C3C43',
    marginBottom: 16,
  },
  page: {
    width: 320,
    height: 420,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C6C6C8',
    backgroundColor: '#FFFFFF',
  },
  hint: {
    marginTop: 48,
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
