package com.margelo.nitro.expodocumentscanner

import android.app.Activity
import android.content.Intent
import android.content.IntentSender
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

  init {
    NitroModules.applicationContext?.addActivityEventListener(this)
  }

  override fun scanDocument(options: ScanOptions): Promise<ScanResult> {
    check(pendingPromise == null) { "A scan is already in progress." }

    val promise = Promise<ScanResult>()
    pendingPromise = promise

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

    val scannerMode = when (options.mode) {
      ScanMode.AUTO   -> GmsDocumentScannerOptions.SCANNER_MODE_FULL
      ScanMode.MANUAL -> GmsDocumentScannerOptions.SCANNER_MODE_BASE_WITH_FILTER
    }

    val gmsOptions = GmsDocumentScannerOptions.Builder()
      .setScannerMode(scannerMode)
      .setGalleryImportAllowed(false)
      .setPageLimit(options.maxNumDocuments.toInt())
      .setResultFormats(GmsDocumentScannerOptions.RESULT_FORMAT_JPEG)
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
        }
      }
      .addOnFailureListener { e ->
        pendingPromise?.reject(e)
        pendingPromise = null
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
    pendingPromise = null

    if (resultCode != Activity.RESULT_OK) {
      promise.reject(Exception("User cancelled the scan (resultCode=$resultCode)."))
      return
    }

    val result = GmsDocumentScanningResult.fromActivityResultIntent(data)
    if (result == null) {
      promise.reject(Exception("GmsDocumentScanningResult is null."))
      return
    }

    val uris = result.pages?.map { it.imageUri.toString() }?.toTypedArray() ?: emptyArray()
    promise.resolve(ScanResult(uris = uris))
  }

  override fun onNewIntent(intent: Intent) {}
}
