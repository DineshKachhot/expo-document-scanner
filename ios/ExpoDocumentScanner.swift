import NitroModules
import VisionKit

class ExpoDocumentScanner: HybridExpoDocumentScannerSpec {

  private var pendingPromise: Promise<ScanResult>?
  private var pendingOptions: ScanOptions?

  public func scanDocument(options: ScanOptions) throws -> Promise<ScanResult> {
    guard pendingPromise == nil else {
      throw RuntimeError.error(withMessage: "A scan is already in progress.")
    }

    let promise = Promise<ScanResult>()
    pendingPromise = promise
    pendingOptions = options

    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }

      guard VNDocumentCameraViewController.isSupported else {
        promise.reject(withError: RuntimeError.error(
          withMessage: "Document scanning is not supported on this device."))
        self.pendingPromise = nil
        self.pendingOptions = nil
        return
      }

      let scanner = VNDocumentCameraViewController()
      scanner.delegate = self

      // Find the topmost presented view controller
      guard let windowScene = UIApplication.shared.connectedScenes
        .compactMap({ $0 as? UIWindowScene })
        .first(where: { $0.activationState == .foregroundActive }),
        let root = windowScene.windows.first(where: { $0.isKeyWindow })?.rootViewController
      else {
        promise.reject(withError: RuntimeError.error(withMessage: "No root view controller found."))
        self.pendingPromise = nil
        self.pendingOptions = nil
        return
      }

      var top = root
      while let presented = top.presentedViewController { top = presented }
      top.present(scanner, animated: true)
    }

    return promise
  }
}

// MARK: - VNDocumentCameraViewControllerDelegate

extension ExpoDocumentScanner: VNDocumentCameraViewControllerDelegate {

  public func documentCameraViewController(
    _ controller: VNDocumentCameraViewController,
    didFinishWith scan: VNDocumentCameraScan
  ) {
    controller.dismiss(animated: true)
    guard let promise = pendingPromise, let options = pendingOptions else { return }
    pendingPromise = nil
    pendingOptions = nil

    var pages: [ScannedPage] = []
    let tempDir = FileManager.default.temporaryDirectory
    let quality = options.quality ?? 1.0

    for i in 0..<scan.pageCount {
      let image = scan.imageOfPage(at: i)

      let imageData: Data?
      let ext: String
      if quality < 1.0 {
        imageData = image.jpegData(compressionQuality: quality)
        ext = "jpg"
      } else {
        imageData = image.pngData()
        ext = "png"
      }

      guard let data = imageData else {
        promise.reject(withError: RuntimeError.error(
          withMessage: "Failed to encode image at page \(i)."))
        return
      }

      let url = tempDir.appendingPathComponent("scan_\(UUID().uuidString)_p\(i).\(ext)")
      do {
        try data.write(to: url)
      } catch {
        promise.reject(withError: error)
        return
      }

      let base64: String? = (options.includeBase64 == true)
        ? data.base64EncodedString()
        : nil

      pages.append(ScannedPage(uri: url.absoluteString, base64: base64))
    }

    promise.resolve(withResult: ScanResult(pages: pages, pdfUri: nil))
  }

  public func documentCameraViewControllerDidCancel(
    _ controller: VNDocumentCameraViewController
  ) {
    controller.dismiss(animated: true)
    pendingPromise?.reject(withError: RuntimeError.error(withMessage: "User cancelled the scan."))
    pendingPromise = nil
    pendingOptions = nil
  }

  public func documentCameraViewController(
    _ controller: VNDocumentCameraViewController,
    didFailWithError error: Error
  ) {
    controller.dismiss(animated: true)
    pendingPromise?.reject(withError: error)
    pendingPromise = nil
    pendingOptions = nil
  }
}
