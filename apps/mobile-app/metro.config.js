const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');

/**
 * Metro configuration - standalone iOS app with isolated dependencies
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const projectRoot = __dirname;

const config = {
  projectRoot: projectRoot,
  
  // ONLY watch this app directory - don't traverse up to monorepo root
  watchFolders: [projectRoot],
  
  resolver: {
    // Block everything outside this app to prevent watching too many files
    blockList: exclusionList([
      // Block parent directories
      /.*\/apps\/(?!mobile-app).*/,
      /.*\/packages\/.*/,
      // Block nested node_modules
      /.*\/node_modules\/.*\/node_modules\/.*/,
    ]),
  },
  
  // Limit the max workers to reduce resource usage
  maxWorkers: 2,
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
