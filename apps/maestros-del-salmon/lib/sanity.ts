import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

if (!projectId) {
  console.warn("CMS_WARNING: SANITY_PROJECT_ID is not defined. Data fetching will fail.");
}
const apiVersion = "2024-04-05";
const serverReadToken =
  typeof window === "undefined"
    ? process.env.SANITY_API_READ_TOKEN ?? process.env.SANITY_API_WRITE_TOKEN
    : undefined;

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: serverReadToken,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
