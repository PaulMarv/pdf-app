import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push(
      {
        test: /pdf\.worker\.js$/,
        loader: "file-loader",
        options: {
          name: "[name].[hash].[ext]",
          outputPath: "static/worker",
          publicPath: "/_next/static/worker",
        },
      },
      {
        test: /\.wasm$/, // Handle `.wasm` files properly
        type: "asset/resource",
      }
    );

    return config;
  },
  experimental: {
    esmExternals: false, // Ensures pdfjs-dist works properly
  },
};

export default nextConfig;
