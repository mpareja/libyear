import * as path from "node:path";

import { default as semver } from "semver";

import { execute } from "./execute.js";
import type { PackageManager } from "./types.js";

const { satisfies } = semver;

export const getParsedPackageManager = (
  packageManager?: string,
): PackageManager => {
  switch (packageManager) {
    case "berry":
    case "npm":
    case "pnpm":
    case "yarn":
      return packageManager;
    default:
      return "npm";
  }
};

export const getInferredPackageManager = async (): Promise<PackageManager> => {
  const packageManager = path.basename(process.env.npm_execpath || "npm");
  if (packageManager.startsWith("yarn")) {
    return satisfies(await execute("yarn --version"), "^0 || ^1")
      ? "yarn"
      : "berry";
  } else if (packageManager.startsWith("pnpm")) {
    return Promise.resolve("pnpm");
  } else {
    return Promise.resolve(getParsedPackageManager(packageManager));
  }
};
