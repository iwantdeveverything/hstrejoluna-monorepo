import { writeClient } from "@/lib/sanity";
import type { CertificateInput } from "./normalize";

export interface CertificateRepository {
  upsertMany(certificates: CertificateInput[]): Promise<number>;
}

export class SanityCertificateRepository implements CertificateRepository {
  async upsertMany(certificates: CertificateInput[]): Promise<number> {
    if (!writeClient.config().token) {
      throw new Error(
        "Missing SANITY_API_WRITE_TOKEN for certificate upsert operations"
      );
    }

    const transaction = certificates.reduce((tx, certificate) => {
      return tx.createOrReplace({
        _id: `certificate.linkedin.${certificate.identityKey}`,
        _type: "certificate",
        name: certificate.name,
        issuer: certificate.issuer,
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        credentialId: certificate.credentialId,
        credentialUrl: certificate.credentialUrl,
        source: certificate.source,
      });
    }, writeClient.transaction());

    await transaction.commit();

    return certificates.length;
  }
}
