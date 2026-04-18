import type { HybridObject } from 'react-native-nitro-modules';

/**
 * Controls the ML Kit scanner UI feature set (Android only).
 * iOS: ignored — VisionKit always shows the full scanning UI.
 *
 * - 'full'             → SCANNER_MODE_FULL: auto edge-detect + auto-capture + manual shutter + image filters
 * - 'base'             → SCANNER_MODE_BASE: manual shutter only, no image filters
 * - 'base_with_filter' → SCANNER_MODE_BASE_WITH_FILTER: manual shutter + image filters
 */
export type ScannerMode = 'full' | 'base' | 'base_with_filter';

export interface ScanOptions {
  /**
   * Image quality, 0.0–1.0. Default: 1.0.
   * iOS: < 1.0 → JPEG at that compression level; 1.0 → PNG.
   * Android: no-op (ML Kit always returns JPEG).
   */
  quality?: number;

  /**
   * Include base64-encoded image data in each page result. Default: false.
   * Both platforms: file is read and encoded natively after capture.
   */
  includeBase64?: boolean;

  /**
   * Maximum number of pages to scan, 1–100.
   * Android: maps to setPageLimit().
   * iOS: no-op — VisionKit does not enforce a page limit.
   */
  maxNumDocuments?: number;

  /**
   * Allow the user to import a document from the photo library. Default: false.
   * Android: maps to setGalleryImportAllowed(true).
   * iOS: no-op.
   */
  galleryImportAllowed?: boolean;

  /**
   * Also produce a PDF output in addition to per-page JPEG images. Default: false.
   * Android: adds RESULT_FORMAT_PDF to setResultFormats().
   * iOS: no-op.
   */
  includePdf?: boolean;

  /**
   * Scanner UI feature set. Default: 'full'.
   * Android: maps to setScannerMode().
   * iOS: no-op — VisionKit always uses its full scanning UI.
   */
  scannerMode?: ScannerMode;
}

export interface ScannedPage {
  /** Absolute file:// URI to the scanned image (JPEG or PNG). */
  uri: string;
  /** Base64-encoded image data. Present only when includeBase64: true. */
  base64?: string;
}

export interface ScanResult {
  /** One entry per scanned page. */
  pages: ScannedPage[];
  /**
   * Absolute file:// URI to the generated PDF.
   * Present on Android only when includePdf: true.
   */
  pdfUri?: string;
}

export interface ExpoDocumentScanner extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  scanDocument(options: ScanOptions): Promise<ScanResult>;
}
