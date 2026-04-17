import NitroModules
import VisionKit

class ExpoDocumentScanner: HybridExpoDocumentScannerSpec {

  private var pendingPromise: Promise<ScanResult>?

  public func scanDocument(options: ScanOptions) throws -> Promise<ScanResult> {
    guard pendingPromise == nil else {
      throw RuntimeError.error(withMessage: "A scan is already in progress.")
    }

    let promise = Promise<ScanResult>()
    pendingPromise = promise

    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }

      guard VNDocumentCameraViewController.isSupported else {
        promise.reject(withError: RuntimeError.error(
          withMessage: "Document scanning is not supported on this device."))
        self.pendingPromise = nil
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
    guard let promise = pendingPromise else { return }
    pendingPromise = nil

    var uris: [String] = []
    let tempDir = FileManager.default.temporaryDirectory

    for i in 0..<scan.pageCount {
      let image = scan.imageOfPage(at: i)
      let url = tempDir.appendingPathComponent("scan_\(UUID().uuidString)_p\(i).jpg")
      if let data = image.jpegData(compressionQuality: 0.92) {
        do {
          try data.write(to: url)
          uris.append(url.absoluteString)
        } catch {
          promise.reject(withError: error)
          return
        }
      }
    }

    promise.resolve(withResult: ScanResult(uris: uris))
  }

  public func documentCameraViewControllerDidCancel(
    _ controller: VNDocumentCameraViewController
  ) {
    controller.dismiss(animated: true)
    pendingPromise?.reject(withError: RuntimeError.error(withMessage: "User cancelled the scan."))
    pendingPromise = nil
  }

  public func documentCameraViewController(
    _ controller: VNDocumentCameraViewController,
    didFailWithError error: Error
  ) {
    controller.dismiss(animated: true)
    pendingPromise?.reject(withError: error)
    pendingPromise = nil
  }
}
