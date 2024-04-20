// const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Read version from version.txt file
    const versionFilePath = path.resolve(__dirname, "version");
    const version = fs.readFileSync(versionFilePath, "utf-8").trim();

    // Define a global variable for the version
    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.APP_VERSION": JSON.stringify(version),
      })
    );

    return config;
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
