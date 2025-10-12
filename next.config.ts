import "./src/env.ts";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
        protocol: "https",
      },
      {
        hostname: "i.pravatar.cc",
        protocol: "https",
      },
    ],
  },
};

export default config;
