const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    // Watch shared packages
    path.resolve(__dirname, '../packages/shared-types'),
    path.resolve(__dirname, '../packages/shared-lib'),
    path.resolve(__dirname, '../packages/shared-auth'),
    path.resolve(__dirname, '../packages/shared-messaging'),
    path.resolve(__dirname, '../packages/shared-dogs'),
    path.resolve(__dirname, '../packages/shared-photo-upload'),
    path.resolve(__dirname, '../packages/shared-api'),
  ],
  resolver: {
    alias: {
      '@homeforpup/shared-types': path.resolve(__dirname, '../packages/shared-types'),
      '@homeforpup/shared-lib': path.resolve(__dirname, '../packages/shared-lib'),
      '@homeforpup/shared-auth': path.resolve(__dirname, '../packages/shared-auth'),
      '@homeforpup/shared-messaging': path.resolve(__dirname, '../packages/shared-messaging'),
      '@homeforpup/shared-dogs': path.resolve(__dirname, '../packages/shared-dogs'),
      '@homeforpup/shared-photo-upload': path.resolve(__dirname, '../packages/shared-photo-upload'),
      '@homeforpup/shared-api': path.resolve(__dirname, '../packages/shared-api'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
