const fs = require('fs');
const path = require('path');
const {
  withDangerousMod,
  withInfoPlist,
  createRunOncePlugin,
} = require('expo/config-plugins');

/**
 * Adopts the UIScene life cycle, which the iOS 27 SDK asserts on at launch.
 *
 * Expo SDK 57's prebuild template still uses the window-based AppDelegate, but the
 * `expo` package already ships `ExpoAppSceneDelegate`. This mirrors what Expo SDK 58's
 * template does, minus its `SceneDelegate` subclass (not needed for the example).
 *
 * Remove once the project is on an Expo SDK whose template adopts scenes by default.
 */
const SCENE_DELEGATE_CLASS = 'EXExpoAppSceneDelegate';

function patchAppDelegate(contents) {
  if (contents.includes('ExpoReactNativeFactoryProvider')) {
    return contents; // template already adopts scenes
  }

  const classDecl = 'class AppDelegate: ExpoAppDelegate {';
  if (!contents.includes(classDecl)) {
    throw new Error(
      '[withSceneLifecycle] Could not find `' +
        classDecl +
        '` in AppDelegate.swift. The Expo template changed; update this plugin.'
    );
  }
  let next = contents.replace(
    classDecl,
    'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {'
  );

  // The scene delegate creates the window and starts React Native instead.
  const windowBlock =
    /#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n\s*factory\.startReactNative\([\s\S]*?\)\n#endif\n\n?/;
  if (!windowBlock.test(next)) {
    throw new Error(
      '[withSceneLifecycle] Could not find the window creation block in AppDelegate.swift. ' +
        'The Expo template changed; update this plugin.'
    );
  }
  next = next.replace(windowBlock, '');
  return next;
}

const withSceneLifecycle = (config) => {
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: SCENE_DELEGATE_CLASS,
          },
        ],
      },
    };
    return cfg;
  });

  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const file = path.join(
        cfg.modRequest.platformProjectRoot,
        cfg.modRequest.projectName,
        'AppDelegate.swift'
      );
      const original = fs.readFileSync(file, 'utf8');
      fs.writeFileSync(file, patchAppDelegate(original));
      return cfg;
    },
  ]);
};

module.exports = createRunOncePlugin(
  withSceneLifecycle,
  'with-scene-lifecycle',
  '1.0.0'
);
