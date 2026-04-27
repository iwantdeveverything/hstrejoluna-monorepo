import React from "react";

export interface CertificatesPanelItem {
  _id: string;
  name: string;
  issuer?: string;
  issueDate?: string;
  credentialUrl?: string;
  source: string;
}

export interface CertificatesPanelProps {
  certificates: CertificatesPanelItem[];
  labels?: Partial<CertificatesPanelLabels>;
}

export interface CertificatesPanelLabels {
  dateUnavailable: string;
  streamEmpty: string;
  noCertificates: string;
  issuerUnavailable: string;
  issued: string;
  viewCredential: string;
}

const defaultLabels: CertificatesPanelLabels = {
  dateUnavailable: "DATE_UNAVAILABLE",
  streamEmpty: "CERTIFICATE_STREAM: EMPTY",
  noCertificates:
    "No synced certificates yet. Trigger sync and the latest LinkedIn credentials will appear here.",
  issuerUnavailable: "Issuer unavailable",
  issued: "ISSUED",
  viewCredential: "View Credential",
};

const formatIssueDate = (value: string | undefined, dateUnavailable: string): string => {
  if (!value) return dateUnavailable;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return dateUnavailable;
  return date.toISOString().slice(0, 10);
};

export const CertificatesPanel = ({
  certificates,
  labels,
}: CertificatesPanelProps) => {
  const resolvedLabels = { ...defaultLabels, ...labels };

  if (!certificates.length) {
    return (
      <div className="border border-surface_container_highest bg-background p-8 md:p-12">
        <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">
          {resolvedLabels.streamEmpty}
        </p>
        <p className="text-on_surface_variant">
          {resolvedLabels.noCertificates}
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
            {certificate.issuer || resolvedLabels.issuerUnavailable}
          </p>
          <p className="font-mono text-xs text-on_surface_variant mb-4">
            {resolvedLabels.issued}:{" "}
            {formatIssueDate(certificate.issueDate, resolvedLabels.dateUnavailable)}
          </p>
          {certificate.credentialUrl ? (
            <a
              href={certificate.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-widest text-primary hover:text-on_surface transition-colors"
            >
              {resolvedLabels.viewCredential}
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
};
