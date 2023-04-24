import { pick } from "lodash-es";

import { execute } from "./execute.js";
import type { PackageManager } from "./types.js";

export const getReleaseTime = async (
  packageManager: PackageManager,
  packageName: string,
): Promise<Record<string, string>> => {
  const cmd = {
    berry: `yarn npm info ${packageName} --fields time,versions --json`,
    npm: `npm view ${packageName} time versions --json`,
    pnpm: `npm view ${packageName} time versions --json`,
    yarn: `yarn info ${packageName} --json`,
  }[packageManager];

  return execute(cmd).then((stdout) => {
    if (!stdout) {
      return {};
    }

    const json = JSON.parse(stdout) as unknown;
    switch (packageManager) {
      case "yarn": {
        const { time, versions } = (
          json as {
            data: { time: Record<string, string>; versions: string[] };
          }
        ).data;
        return pick(time, versions);
      }
      default: {
        const { time, versions } = json as {
          time: Record<string, string>;
          versions: string[];
        };
        return pick(time, versions);
      }
    }
  });
};

export async function getLtsVersion(packageName: string): Promise<null | string> {
  const stdout = await execute(`npm show ${packageName} dist-tags --json`);
  if (!stdout) return null;

  const distTags = JSON.parse(stdout) as Record<string, string>;
  if (!distTags) return null;

  return distTags.lts ?? null;
}
