// Metro configuration for the monorepo.
// Lets Metro watch the workspace root (so it can bundle @twy/core's raw TypeScript) and resolve
// dependencies from both the app's node_modules and the hoisted root node_modules.
// See https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo (needed to bundle packages/core).
config.watchFolders = [workspaceRoot];

// 2. Resolve modules from the app first, then the hoisted root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
