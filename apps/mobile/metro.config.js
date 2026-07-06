// Metro configuration for the monorepo + NativeWind.
// - watchFolders / nodeModulesPaths let Metro bundle @twy/core and resolve the hoisted root deps.
// - withNativeWind wires Tailwind (input CSS) into the transformer.
// See https://docs.expo.dev/guides/monorepos/ and https://www.nativewind.dev/
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Monorepo: watch the workspace root and resolve from app + root node_modules.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = withNativeWind(config, { input: "./src/global.css" });
