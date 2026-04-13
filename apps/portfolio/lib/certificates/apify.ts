import type { RawApifyProfile } from "./normalize";

const ACTOR_ENDPOINT =
  "https://api.apify.com/v2/acts/dev_fusion~linkedin-profile-scraper/run-sync-get-dataset-items";

export interface ApifyAdapter {
  fetchProfileCertificates(profileUrl: string): Promise<RawApifyProfile>;
}

export class ApifyCertificatesClient implements ApifyAdapter {
  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  async fetchProfileCertificates(profileUrl: string): Promise<RawApifyProfile> {
    const url = `${ACTOR_ENDPOINT}?token=${encodeURIComponent(this.token)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileUrls: [profileUrl] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Apify request failed (${response.status}): ${errorText || "unknown error"}`
      );
    }

    const items = (await response.json()) as unknown;
    if (!Array.isArray(items) || !items.length || typeof items[0] !== "object") {
      return { certifications: [] };
    }

    const first = items[0] as Record<string, unknown>;
    const actorError =
      typeof first.error === "string" && first.error.trim().length > 0
        ? first.error
        : undefined;

    if (actorError) {
      throw new Error(`Apify actor error: ${actorError}`);
    }

    return first as RawApifyProfile;
  }
}
