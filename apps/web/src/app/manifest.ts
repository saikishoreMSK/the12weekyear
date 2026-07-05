import type { MetadataRoute } from "next";

/** Web app manifest — makes the app installable ("Add to Home Screen") on mobile. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The 12 Week Year",
    short_name: "12WY",
    description:
      "Execute your long-term goals in focused 12-week cycles — habits, weekly reviews, and analytics.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
