import type { MetadataRoute } from "next";

// TODO(launch): remove Disallow: / and allow indexing when going public.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
