import type { Certificate } from "@/types/sanity";

interface CertificatesOverviewProps {
  certificates: Certificate[];
}

const formatIssueDate = (value?: string): string => {
  if (!value) return "DATE_UNAVAILABLE";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "DATE_UNAVAILABLE";
  return date.toISOString().slice(0, 10);
};

export const CertificatesOverview = ({
  certificates,
}: CertificatesOverviewProps) => {
  if (!certificates.length) {
    return (
      <div className="border border-surface_container_highest bg-background p-8 md:p-12">
        <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">
          CERTIFICATE_STREAM: EMPTY
        </p>
        <p className="text-on_surface_variant">
          No synced certificates yet. Trigger sync and the latest LinkedIn
          credentials will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-surface_container_highest">
      {certificates.map((certificate) => (
        <article
          key={certificate._id}
          className="border-b md:border-b-0 md:border-r border-surface_container_highest bg-background p-6"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-primary mb-2">
            {certificate.source}
          </p>
          <h3 className="text-xl font-bold text-on_surface uppercase tracking-tight mb-2">
            {certificate.name}
          </h3>
          <p className="text-on_surface_variant text-sm mb-4">
            {certificate.issuer || "Issuer unavailable"}
          </p>
          <p className="font-mono text-xs text-on_surface_variant mb-4">
            ISSUED: {formatIssueDate(certificate.issueDate)}
          </p>
          {certificate.credentialUrl ? (
            <a
              href={certificate.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-widest text-primary hover:text-on_surface transition-colors"
            >
              View Credential
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
};
