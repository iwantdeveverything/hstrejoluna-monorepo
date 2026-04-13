export interface RawApifyProfile {
  certifications?: unknown[];
}

export interface CertificateInput {
  identityKey: string;
  name: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  source: "linkedin";
}

const asString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const formatDate = (value: unknown): string | undefined => {
  const str = asString(value);
  if (!str) return undefined;
  // Keep year-month/day input but store a stable YYYY-MM-DD when parsable.
  const date = new Date(str);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getIssuer = (entry: Record<string, unknown>): string | undefined =>
  asString(entry.issuer) ??
  asString(entry.authority) ??
  asString(entry.organizationName) ??
  asString(entry.organization) ??
  asString(entry.companyName);

const getName = (entry: Record<string, unknown>): string | undefined =>
  asString(entry.name) ?? asString(entry.title);

const getIssueDate = (entry: Record<string, unknown>): string | undefined =>
  formatDate(entry.issueDate) ??
  formatDate(entry.issuedDate) ??
  formatDate(entry.issuedOn) ??
  formatDate(entry.startDate);

const getExpiryDate = (entry: Record<string, unknown>): string | undefined =>
  formatDate(entry.expiryDate) ??
  formatDate(entry.expirationDate) ??
  formatDate(entry.expiresOn) ??
  formatDate(entry.endDate);

const getCredentialId = (entry: Record<string, unknown>): string | undefined =>
  asString(entry.credentialId) ??
  asString(entry.licenseNumber) ??
  asString(entry.id);

const getCredentialUrl = (entry: Record<string, unknown>): string | undefined =>
  asString(entry.url) ?? asString(entry.credentialUrl) ?? asString(entry.link);

export function normalizeCertificates(
  profile: RawApifyProfile
): { certificates: CertificateInput[]; warnings: string[] } {
  const warnings: string[] = [];
  const source = Array.isArray(profile.certifications)
    ? profile.certifications
    : [];
  const certificates: CertificateInput[] = [];

  for (const [index, item] of source.entries()) {
    if (!item || typeof item !== "object") {
      warnings.push(`Skipping certification at index ${index}: invalid object`);
      continue;
    }

    const entry = item as Record<string, unknown>;
    const name = getName(entry);
    const issuer = getIssuer(entry);

    if (!name) {
      warnings.push(`Skipping certification at index ${index}: missing name`);
      continue;
    }

    const credentialId = getCredentialId(entry);
    const fallbackKey = slugify(`${name}-${issuer ?? "unknown-issuer"}`);
    const identityKey = slugify(credentialId ?? fallbackKey);

    certificates.push({
      identityKey,
      name,
      issuer,
      issueDate: getIssueDate(entry),
      expiryDate: getExpiryDate(entry),
      credentialId,
      credentialUrl: getCredentialUrl(entry),
      source: "linkedin",
    });
  }

  return { certificates, warnings };
}
