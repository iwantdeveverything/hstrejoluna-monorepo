import type { SyncCertificatesResult } from "@/types/sanity";
import {
  ApifyCertificatesClient,
  type ApifyAdapter,
} from "./apify";
import { normalizeCertificates } from "./normalize";
import {
  SanityCertificateRepository,
  type CertificateRepository,
} from "./sanity-upsert";

interface SyncCertificatesDeps {
  apify: ApifyAdapter;
  repository: CertificateRepository;
}

export async function syncLinkedinCertificates(
  profileUrl: string,
  deps: SyncCertificatesDeps
): Promise<SyncCertificatesResult> {
  const profile = await deps.apify.fetchProfileCertificates(profileUrl);
  const { certificates, warnings } = normalizeCertificates(profile);
  const upserted = await deps.repository.upsertMany(certificates);

  return {
    fetched: certificates.length,
    upserted,
    skipped: warnings.length,
    warnings,
  };
}

export function buildDefaultSyncDeps(apifyToken: string): SyncCertificatesDeps {
  return {
    apify: new ApifyCertificatesClient(apifyToken),
    repository: new SanityCertificateRepository(),
  };
}
