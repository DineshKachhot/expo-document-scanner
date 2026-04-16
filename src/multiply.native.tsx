import { NitroModules } from 'react-native-nitro-modules';
import type { ExpoDocumentScanner } from './ExpoDocumentScanner.nitro';

const ExpoDocumentScannerHybridObject =
  NitroModules.createHybridObject<ExpoDocumentScanner>('ExpoDocumentScanner');

export function multiply(a: number, b: number): number {
  return ExpoDocumentScannerHybridObject.multiply(a, b);
}
