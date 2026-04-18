package com.margelo.nitro.expodocumentscanner

import android.app.Activity
import android.content.Intent
import android.content.IntentSender
import android.util.Base64
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.ActivityEventListener
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions
import com.google.mlkit.vision.documentscanner.GmsDocumentScanning
import com.google.mlkit.vision.documentscanner.GmsDocumentScanningResult

@DoNotStrip
class ExpoDocumentScanner : HybridExpoDocumentScannerSpec(), ActivityEventListener {

  companion object {
    private const val SCAN_REQUEST_CODE = 0x5CA8
  }

  @Volatile private var pendingPromise: Promise<ScanResult>? = null
  @Volatile private var pendingOptions: ScanOptions? = null

  init {
    NitroModules.applicationContext?.addActivityEventListener(this)
  }

  override fun scanDocument(options: ScanOptions): Promise<ScanResult> {
    check(pendingPromise == null) { "A scan is already in progress." }

    val promise = Promise<ScanResult>()
    pendingPromise = promise
    pendingOptions = options

    val reactContext = NitroModules.applicationContext
      ?: run {
        promise.reject(Exception("ReactApplicationContext is not available."))
        return promise
      }

    val activity = reactContext.currentActivity
      ?: run {
        promise.reject(Exception("No Activity is currently active."))
        return promise
      }

    val scannerMode = when (options.scannerMode) {
      ScannerMode.BASE             -> GmsDocumentScannerOptions.SCANNER_MODE_BASE
      ScannerMode.BASE_WITH_FILTER -> GmsDocumentScannerOptions.SCANNER_MODE_BASE_WITH_FILTER
      else                         -> GmsDocumentScannerOptions.SCANNER_MODE_FULL
    }

    val formats = mutableListOf(GmsDocumentScannerOptions.RESULT_FORMAT_JPEG)
    if (options.includePdf == true) formats.add(GmsDocumentScannerOptions.RESULT_FORMAT_PDF)

    val gmsOptions = GmsDocumentScannerOptions.Builder()
      .setScannerMode(scannerMode)
      .setGalleryImportAllowed(options.galleryImportAllowed == true)
      .setPageLimit(options.maxNumDocuments?.toInt() ?: 100)
      .setResultFormats(*formats.toIntArray())
      .build()

    GmsDocumentScanning.getClient(gmsOptions)
      .getStartScanIntent(activity)
      .addOnSuccessListener { intentSender: IntentSender ->
        try {
          activity.startIntentSenderForResult(
            intentSender, SCAN_REQUEST_CODE, null, 0, 0, 0
          )
        } catch (e: IntentSender.SendIntentException) {
          pendingPromise?.reject(e)
          pendingPromise = null
          pendingOptions = null
        }
      }
      .addOnFailureListener { e ->
        pendingPromise?.reject(e)
        pendingPromise = null
        pendingOptions = null
      }

    return promise
  }

  override fun onActivityResult(
    activity: Activity,
    requestCode: Int,
    resultCode: Int,
    data: Intent?
  ) {
    if (requestCode != SCAN_REQUEST_CODE) return
    val promise = pendingPromise ?: return
    val options = pendingOptions
    pendingPromise = null
    pendingOptions = null

    if (resultCode != Activity.RESULT_OK) {
      promise.reject(Exception("User cancelled the scan (resultCode=$resultCode)."))
      return
    }

    val result = GmsDocumentScanningResult.fromActivityResultIntent(data)
    if (result == null) {
      promise.reject(Exception("GmsDocumentScanningResult is null."))
      return
    }

    val contentResolver = NitroModules.applicationContext?.contentResolver
    val pages = result.pages?.map { page ->
      val uri = page.imageUri.toString()
      val base64Str: String? = if (options?.includeBase64 == true && contentResolver != null) {
        try {
          val bytes = contentResolver.openInputStream(page.imageUri)?.use { it.readBytes() }
          bytes?.let { Base64.encodeToString(it, Base64.NO_WRAP) }
        } catch (_: Exception) { null }
      } else null
      ScannedPage(uri = uri, base64 = base64Str)
    }?.toTypedArray() ?: emptyArray()

    val pdfUri = if (options?.includePdf == true) result.pdf?.uri?.toString() else null

    promise.resolve(ScanResult(pages = pages, pdfUri = pdfUri))
  }

  override fun onNewIntent(intent: Intent) {}
}
