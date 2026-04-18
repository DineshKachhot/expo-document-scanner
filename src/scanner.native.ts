import { NitroModules } from 'react-native-nitro-modules';
import type {
  ExpoDocumentScanner,
  ScanOptions,
  ScanResult,
  ScannedPage,
  ScannerMode,
} from './ExpoDocumentScanner.nitro';

export type { ScanOptions, ScanResult, ScannedPage, ScannerMode };

const Scanner = NitroModules.createHybridObject<ExpoDocumentScanner>(
  'ExpoDocumentScanner'
);

export function scanDocument(options: ScanOptions): Promise<ScanResult> {
  return Scanner.scanDocument(options);
}
