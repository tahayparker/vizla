import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/tt",
        destination: "/create",
        permanent: true,
      },
      {
        source: "/timetable",
        destination: "/create",
        permanent: true,
      },
      {
        source: "/cr8",
        destination: "/create",
        permanent: true,
      },
      {
        source: "/planner",
        destination: "/create",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
