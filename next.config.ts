import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Pin the Turbopack root to this project to avoid the multiple-lockfile
  // workspace-root inference warning (a stray lockfile lives in the home dir).
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
