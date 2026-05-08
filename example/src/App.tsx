import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  FlatList,
  Modal,
} from 'react-native';
import { scanDocument } from 'expo-document-scanner';
import type { ScannerMode } from 'expo-document-scanner';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCANNER_MODES: { label: string; value: ScannerMode }[] = [
  { label: 'Full', value: 'full' },
  { label: 'Base + Filters', value: 'base_with_filter' },
  { label: 'Base', value: 'base' },
];

export default function App() {
  const [pages, setPages] = useState<string[]>([]);
  const [pdfUri, setPdfUri] = useState<string | undefined>();
  const [scanning, setScanning] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Options
  const [galleryImportAllowed, setGalleryImportAllowed] = useState(false);
  const [includePdf, setIncludePdf] = useState(false);
  const [includeBase64, setIncludeBase64] = useState(false);
  const [scannerMode, setScannerMode] = useState<ScannerMode>('full');

  async function handleScan() {
    setScanning(true);
    try {
      const result = await scanDocument({
        quality: 1,
        maxNumDocuments: 10,
        includeBase64,
        galleryImportAllowed,
        includePdf,
        scannerMode,
      });
      setPages(result.pages.map((p) => p.uri));
      setPdfUri(result.pdfUri ?? undefined);
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
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F9" />
      <FlatList
        data={pages}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.container}
        columnWrapperStyle={pages.length > 0 ? styles.grid : undefined}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Document Scanner</Text>
              <Text style={styles.subtitle}>
                Digitize your documents in seconds
              </Text>
            </View>

            {/* Scan button */}
            <TouchableOpacity
              style={[styles.primaryButton, scanning && styles.buttonDisabled]}
              onPress={handleScan}
              disabled={scanning}
              activeOpacity={0.8}
            >
              {scanning ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Scan Document</Text>
              )}
            </TouchableOpacity>

            {/* Options Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Preferences</Text>

              <Row label="Include Base64">
                <Switch
                  value={includeBase64}
                  onValueChange={setIncludeBase64}
                  trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                  thumbColor="#FFFFFF"
                />
              </Row>

              {Platform.OS === 'android' && (
                <>
                  <View style={styles.divider} />
                  <Row label="Gallery Import">
                    <Switch
                      value={galleryImportAllowed}
                      onValueChange={setGalleryImportAllowed}
                      trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                      thumbColor="#FFFFFF"
                    />
                  </Row>
                  <View style={styles.divider} />
                  <Row label="Include PDF">
                    <Switch
                      value={includePdf}
                      onValueChange={setIncludePdf}
                      trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                      thumbColor="#FFFFFF"
                    />
                  </Row>
                  <View style={styles.divider} />
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
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.modeChipText,
                            scannerMode === m.value &&
                              styles.modeChipTextActive,
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

            {/* Results */}
            {pdfUri && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>📄 PDF Saved: {pdfUri}</Text>
              </View>
            )}

            {pages.length > 0 && (
              <Text style={styles.resultsTitle}>
                Scanned Pages ({pages.length})
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !scanning ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>📸</Text>
              <Text style={styles.emptyStateTitle}>No Documents Yet</Text>
              <Text style={styles.emptyStateDesc}>
                Tap the scan button above to digitize your first document.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedImage(item)}
            style={styles.pageImageWrapper}
          >
            <Image
              source={{ uri: item }}
              style={styles.pageImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />

      {/* Fullscreen Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
  root: { flex: 1, backgroundColor: '#F4F6F9' },
  container: { padding: 20, paddingBottom: 40 },

  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1A1A1C',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 6,
    fontWeight: '500',
  },

  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    height: 56,
  },
  buttonDisabled: { opacity: 0.7, shadowOpacity: 0.1 },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1C',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F2',
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 16,
    color: '#3C3C43',
    fontWeight: '500',
  },

  modeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 12,
  },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  modeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F4F6F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modeChipActive: {
    backgroundColor: '#E5F0FF',
    borderColor: '#007AFF',
  },
  modeChipText: {
    fontSize: 14,
    color: '#6E6E73',
    fontWeight: '600',
  },
  modeChipTextActive: {
    color: '#007AFF',
  },

  infoBox: {
    backgroundColor: '#E5F0FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    color: '#005BB5',
    fontSize: 14,
    fontWeight: '500',
  },

  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1C',
    marginBottom: 16,
  },
  grid: {
    justifyContent: 'space-between',
  },
  pageImageWrapper: {
    width: '47%',
    marginBottom: 16,
  },
  pageImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1C',
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
});
