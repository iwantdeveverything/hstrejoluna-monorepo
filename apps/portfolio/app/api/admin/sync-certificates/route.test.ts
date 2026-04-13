// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/certificates/sync", () => ({
  buildDefaultSyncDeps: vi.fn(() => ({ mocked: true })),
  syncLinkedinCertificates: vi.fn(async () => ({
    fetched: 1,
    upserted: 1,
    skipped: 0,
    warnings: [],
  })),
}));

const ORIGINAL_ENV = process.env;

describe("POST /api/admin/sync-certificates", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("rejects unauthorized requests", async () => {
    process.env.SYNC_CERTIFICATES_SECRET = "secret";
    process.env.APIFY_TOKEN = "apify-token";
    process.env.LINKEDIN_PROFILE_URL = "https://linkedin.com/in/user";
    process.env.SANITY_API_WRITE_TOKEN = "sanity-token";
    const request = new Request("http://localhost", { method: "POST" });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns structured error when required env is missing", async () => {
    process.env.SYNC_CERTIFICATES_SECRET = "secret";
    delete process.env.APIFY_TOKEN;
    process.env.LINKEDIN_PROFILE_URL = "https://linkedin.com/in/user";

    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "x-sync-secret": "secret" },
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toContain("Missing required environment variable");
  });
});
