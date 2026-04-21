const { withInfoPlist, createRunOncePlugin } = require('@expo/config-plugins');

const pkg = require('./package.json');

/**
 * @typedef {Object} DocumentScannerPluginProps
 * @property {string} [cameraPermission] - Description for NSCameraUsageDescription on iOS.
 */

/**
 * Configures the iOS NSCameraUsageDescription.
 * @type {import('@expo/config-plugins').ConfigPlugin<DocumentScannerPluginProps>}
 */
const withCameraPermission = (config, { cameraPermission } = {}) => {
  return withInfoPlist(config, (config) => {
    config.modResults.NSCameraUsageDescription =
      cameraPermission ||
      config.modResults.NSCameraUsageDescription ||
      'This app uses the camera to scan documents.';
    return config;
  });
};

/**
 * Main plugin entry point.
 * @type {import('@expo/config-plugins').ConfigPlugin<DocumentScannerPluginProps>}
 */
const withDocumentScanner = (config, props) => {
  return withCameraPermission(config, props);
};

module.exports = createRunOncePlugin(
  withDocumentScanner,
  pkg.name,
  pkg.version
);
