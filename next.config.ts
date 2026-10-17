import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Posters and covers of the watchlist catalogs. The posters skip the
    // optimizer (`unoptimized`), but these hosts are the only ones allowed if
    // it's ever turned on. Same hosts the poster_url check of the migration accepts.
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" },
      { protocol: "https", hostname: "books.google.com", pathname: "/books/**" },
      { protocol: "https", hostname: "covers.openlibrary.org", pathname: "/b/**" },
    ],
  },
};

export default nextConfig;
