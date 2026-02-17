import { headers } from "next/headers";
import type { MetadataRoute } from "next";

const FALLBACK_HOST = "moneytor.madadev.click";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const headersList = await headers();
  const host = headersList.get("host") ?? FALLBACK_HOST;
  const origin =
    host.includes("localhost") || host.startsWith("127.0.0.1")
      ? `http://${host}`
      : `https://${host}`;

  return {
    id: `${origin}/`,
    name: "MoneyTor",
    short_name: "MoneyTor",
    description: "Finance tracker",
    start_url: `${origin}/`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: `${origin}/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${origin}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${origin}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
