import { describe, expect, it, vi } from "vitest";
import type { ApifyAdapter } from "./apify";
import type { CertificateRepository } from "./sanity-upsert";
import { syncLinkedinCertificates } from "./sync";

describe("syncLinkedinCertificates", () => {
  it("returns counts and warnings for mixed valid/invalid entries", async () => {
    const apify: ApifyAdapter = {
      fetchProfileCertificates: vi.fn().mockResolvedValue({
        certifications: [
          { name: "Cert A", authority: "Issuer A", credentialId: "A-1" },
          { issuer: "Missing name" },
        ],
      }),
    };

    const repository: CertificateRepository = {
      upsertMany: vi.fn().mockResolvedValue(1),
    };

    const result = await syncLinkedinCertificates("https://linkedin.com/in/x", {
      apify,
      repository,
    });

    expect(result.fetched).toBe(1);
    expect(result.upserted).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.warnings[0]).toContain("missing name");
    expect(repository.upsertMany).toHaveBeenCalledTimes(1);
  });

  it("propagates actor failures", async () => {
    const apify: ApifyAdapter = {
      fetchProfileCertificates: vi
        .fn()
        .mockRejectedValue(new Error("Apify timeout")),
    };

    const repository: CertificateRepository = {
      upsertMany: vi.fn(),
    };

    await expect(
      syncLinkedinCertificates("https://linkedin.com/in/x", {
        apify,
        repository,
      })
    ).rejects.toThrow("Apify timeout");
  });
});
