import type { HybridObject } from 'react-native-nitro-modules';

export type ScanMode = 'auto' | 'manual';

export interface ScanOptions {
  mode: ScanMode;
  maxNumDocuments: number; // 1–100
}

export interface ScanResult {
  uris: string[]; // absolute file:// URIs, one per scanned page
}

export interface ExpoDocumentScanner extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  scanDocument(options: ScanOptions): Promise<ScanResult>;
}
