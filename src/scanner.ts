import type { ScanOptions, ScanResult } from './ExpoDocumentScanner.nitro';

export type { ScanOptions, ScanResult };

export async function scanDocument(_options: ScanOptions): Promise<ScanResult> {
  throw new Error('expo-document-scanner is not supported on this platform.');
}
