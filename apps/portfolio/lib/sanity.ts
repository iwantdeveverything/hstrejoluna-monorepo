import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: "73v5iufs",
  dataset: "production",
  apiVersion: "2024-04-05", // Use today's date
  useCdn: false, // Set to true if you want to use edge CDN (cached, faster)
});

const builder = imageUrlBuilder(client);

import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
