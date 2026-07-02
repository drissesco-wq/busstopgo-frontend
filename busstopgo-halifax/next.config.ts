import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/halifax/departures",
        destination: "/departures",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
