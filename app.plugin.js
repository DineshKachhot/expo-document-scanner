const { createRunOncePlugin } = require('@expo/config-plugins');

const pkg = require('./package.json');

/**
 * Main plugin entry point.
 * @type {import('@expo/config-plugins').ConfigPlugin}
 */
const withDocumentScanner = (config) => {
  return config;
};

module.exports = createRunOncePlugin(
  withDocumentScanner,
  pkg.name,
  pkg.version
);
