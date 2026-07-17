const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Polyfill Node.js core modules used by starknet.js
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  buffer: path.resolve(__dirname, 'node_modules/buffer'),
  stream: require.resolve('stream-browserify'),
};

module.exports = config;
