package com.margelo.nitro.expodocumentscanner
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class ExpoDocumentScanner : HybridExpoDocumentScannerSpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
