import { NitroModules } from 'react-native-nitro-modules';
import type {
  ExpoDocumentScanner,
  ScanOptions,
  ScanResult,
} from './ExpoDocumentScanner.nitro';

export type { ScanOptions, ScanResult };

const Scanner = NitroModules.createHybridObject<ExpoDocumentScanner>(
  'ExpoDocumentScanner'
);

export function scanDocument(options: ScanOptions): Promise<ScanResult> {
  return Scanner.scanDocument(options);
}
