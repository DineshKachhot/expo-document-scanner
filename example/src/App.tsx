import { useState } from 'react';
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
      setPdfUri(result.pdfUri ?? undefined);
      if (includeBase64 && result.pages[0]?.base64) {
        console.log('base64 length:', result.pages[0].base64.length);
      }
    } catch (err: unknown) {
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

        {/* Options */}
        <View style={styles.optionsCard}>
          <Text style={styles.optionsTitle}>Options</Text>

          <Row label="Include Base64">
            <Switch value={includeBase64} onValueChange={setIncludeBase64} />
          </Row>

          {Platform.OS === 'android' && (
            <>
              <Row label="Gallery Import (Android)">
                <Switch
                  value={galleryImportAllowed}
                  onValueChange={setGalleryImportAllowed}
                />
              </Row>

              <Row label="Include PDF (Android)">
                <Switch value={includePdf} onValueChange={setIncludePdf} />
              </Row>

              <Text style={styles.modeLabel}>Scanner Mode (Android)</Text>
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

        {/* Scan button */}
        <TouchableOpacity
          style={[styles.button, scanning && styles.buttonDisabled]}
          onPress={handleScan}
          disabled={scanning}
        >
          <Text style={styles.buttonText}>Scan Document</Text>
        </TouchableOpacity>

        {scanning && (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={styles.spinner}
          />
        )}

        {/* Results */}
        {pdfUri && <Text style={styles.pdfNote}>PDF saved: {pdfUri}</Text>}

        {pages.length > 0 && (
          <>
            <Text style={styles.subtitle}>{pages.length} page(s) scanned</Text>
            {pages.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={styles.page}
                resizeMode="contain"
              />
            ))}
          </>
        )}

        {pages.length === 0 && !scanning && (
          <Text style={styles.hint}>
            Tap the button above to scan a document.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#1C1C1E',
  },

  optionsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  optionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: { fontSize: 15, color: '#1C1C1E' },

  modeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 4,
  },
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

  pdfNote: {
    marginTop: 12,
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
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
  hint: { marginTop: 48, fontSize: 15, color: '#8E8E93', textAlign: 'center' },
});
