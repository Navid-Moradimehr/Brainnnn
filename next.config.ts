import type { NextConfig } from "next";

/**
 * Static export for GitHub Pages (project site: /Brainnnn).
 * All data is mock/client-side, so every route prerenders — including the
 * case workflow pages via generateStaticParams over the mock case list.
 */
const isPages = process.env.DEPLOY_TARGET === "gh-pages";

const nextConfig: NextConfig = {
  ...(isPages
    ? {
        output: "export" as const,
        basePath: "/Brainnnn",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
