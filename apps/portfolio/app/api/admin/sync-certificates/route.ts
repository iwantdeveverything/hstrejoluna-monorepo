import { NextResponse } from "next/server";
import {
  buildDefaultSyncDeps,
  syncLinkedinCertificates,
} from "@/lib/certificates/sync";

const requiredEnv = [
  "APIFY_TOKEN",
  "LINKEDIN_PROFILE_URL",
  "SYNC_CERTIFICATES_SECRET",
  "SANITY_API_WRITE_TOKEN",
] as const;

export async function POST(request: Request) {
  const apifyToken = process.env.APIFY_TOKEN;
  const linkedinProfileUrl = process.env.LINKEDIN_PROFILE_URL;
  const syncSecret = process.env.SYNC_CERTIFICATES_SECRET;
  const sanityWriteToken = process.env.SANITY_API_WRITE_TOKEN;

  if (!apifyToken || !linkedinProfileUrl || !syncSecret || !sanityWriteToken) {
    const missing = requiredEnv.filter((key) => !process.env[key]);
    return NextResponse.json(
      {
        error: `Missing required environment variable: ${missing.join(", ")}`,
      },
      { status: 500 }
    );
  }

  const requestSecret = request.headers.get("x-sync-secret");
  if (!requestSecret || requestSecret !== syncSecret) {
    return NextResponse.json(
      { error: "Unauthorized sync request." },
      { status: 401 }
    );
  }

  try {
    const result = await syncLinkedinCertificates(
      linkedinProfileUrl,
      buildDefaultSyncDeps(apifyToken)
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown sync error.";
    return NextResponse.json(
      { error: "Certificate sync failed.", details: message },
      { status: 500 }
    );
  }
}
