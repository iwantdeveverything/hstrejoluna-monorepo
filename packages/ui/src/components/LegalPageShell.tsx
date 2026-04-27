import React from "react";

export interface LegalPageShellProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
  proseClassName?: string;
  contactEmail?: string;
  labels?: Partial<LegalPageShellLabels>;
}

export interface LegalPageShellLabels {
  lastUpdatedPrefix: string;
  contactHeading: string;
  contactDescription: string;
}

const defaultLabels: LegalPageShellLabels = {
  lastUpdatedPrefix: "Last updated:",
  contactHeading: "Contact Information",
  contactDescription:
    "If you have any questions or concerns about this policy or our practices, please contact us at:",
};

export function LegalPageShell({
  title,
  lastUpdated,
  children,
  proseClassName = "prose-invert prose-emerald",
  contactEmail = "trejolunatutoriales@gmail.com",
  labels,
}: LegalPageShellProps) {
  const resolvedLabels = { ...defaultLabels, ...labels };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl relative z-10">
      <div className={`prose max-w-none ${proseClassName}`}>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="text-gray-400">
          {resolvedLabels.lastUpdatedPrefix} {lastUpdated}
        </p>

        {children}

        <section className="mt-16 pt-8 border-t border-white/10">
          <h2 className="text-2xl font-semibold">
            {resolvedLabels.contactHeading}
          </h2>
          <p className="mt-4">{resolvedLabels.contactDescription}</p>
          <div className="mt-4 p-4 rounded-lg bg-surface_container_lowest border border-white/5 font-mono text-emerald-400">
            {contactEmail}
          </div>
        </section>
      </div>
    </div>
  );
}
