# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Refreshed `baseline-browser-mapping` and `caniuse-lite` dependencies.

## [1.0.0] - 2026-10-27

### Breaking
- `react-native-nitro-modules` peer dependency raised from `^0.35.4` to `^0.37.0`. Apps must upgrade Nitro to 0.37.x together with this release.

### Changed
- Build and example toolchain upgraded to Expo SDK 57, React Native 0.86.3 and React 19.2.3.
- `react-native-nitro-modules` and `nitrogen` bumped to 0.37.1.
- Android: ML Kit document scanner upgraded to 16.0.0 (stable).
- Example app adopts the iOS UIScene life cycle for the iOS 27 SDK.

## [0.2.8] - 2026-07-01

### Added
- Demo video in the README.
- npm keywords added to `package.json`.

### Changed
- Splash screen configuration moved to the `expo-splash-screen` plugin; `appleTeamId` added for iOS.
- README tagline updated to describe the platform-specific native scanning technologies.
- Documentation site removed from yarn workspaces.

## [0.2.7] - 2026-05-16

### Added
- Documentation site built with Rspress, including guides and setup instructions.
- Documentation badge in the README; homepage URL updated.

### Changed
- `.npmrc` added with `legacy-peer-deps=true`.
- `@eslint/js` downgraded to 9.0.0.

## [0.2.6] - 2026-05-08

### Changed
- Example app UI revamped: `FlatList` results, modal image preview, refined styling.

## [0.2.5] - 2026-04-21

### Removed
- Expo config plugin and its dependencies. Apps that relied on the plugin must set the camera usage description themselves (see 0.2.4).

## [0.2.4] - 2026-04-21

### Changed
- iOS camera permission uses the standard `NSCameraUsageDescription` configuration.

## [0.2.3] - 2026-04-21

### Added
- Config plugin entry in `package.json` for Expo integration.

## [0.2.2] - 2026-04-21

### Added
- Expo config plugin for automated camera permission configuration, with documentation.

> Note: 0.2.2 is on npm but has no version-bump commit in the git history. The contents above are inferred from commit order.

## [0.2.1] - 2026-04-21

### Changed
- iOS: `VNDocumentCameraViewControllerDelegate` moved into a dedicated `ScannerDelegate` class.

## [0.2.0] - 2026-04-20

First release published to npm.

### Added
- iOS document scanning with VisionKit.
- Android document scanning with ML Kit.
- Async `scanDocument` API.
- Base64 output, PDF generation (Android) and quality settings.
- Project documentation and package configuration.

## [0.1.0] - 2026-04-20

Not published to npm. The version went from `0.1.0` straight to `0.2.0` in the release commit.

### Added
- Initial release of `expo-document-scanner`.
- Native document scanning for iOS using VisionKit.
- Native document scanning for Android using ML Kit.
- Supporting async `scanDocument` API.
- Support for base64 output, PDF generation (Android), and quality settings.
