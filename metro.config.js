const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Polyfill Node.js core modules used by starknet.js in React Native.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  buffer: path.resolve(__dirname, "node_modules/buffer"),
  stream: require.resolve("stream-browserify"),
};

module.exports = withRorkMetro(config);
