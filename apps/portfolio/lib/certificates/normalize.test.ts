import { describe, expect, it } from "vitest";
import { normalizeCertificates } from "./normalize";

describe("normalizeCertificates", () => {
  it("maps full payload and preserves stable identity key", () => {
    const result = normalizeCertificates({
      certifications: [
        {
          name: "AWS Certified Developer",
          authority: "Amazon Web Services",
          issueDate: "2024-03-01",
          credentialId: "ABC-123",
          credentialUrl: "https://example.com/cert",
        },
      ],
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.certificates).toHaveLength(1);
    expect(result.certificates[0]).toMatchObject({
      identityKey: "abc-123",
      name: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      source: "linkedin",
      credentialId: "ABC-123",
      credentialUrl: "https://example.com/cert",
    });
  });

  it("uses fallback identity when credential id is missing", () => {
    const result = normalizeCertificates({
      certifications: [
        {
          title: "Google Cloud Associate",
          issuer: "Google Cloud",
          issueDate: "2024-05-09",
        },
      ],
    });

    expect(result.certificates[0]?.identityKey).toBe(
      "google-cloud-associate-google-cloud"
    );
  });

  it("skips malformed and nameless entries with warnings", () => {
    const result = normalizeCertificates({
      certifications: [null, { issuer: "No Name Corp" }],
    });

    expect(result.certificates).toHaveLength(0);
    expect(result.warnings).toHaveLength(2);
  });
});
