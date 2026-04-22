import React from "react";

export interface LegalPageShellProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
  proseClassName?: string;
  contactEmail?: string;
}

export function LegalPageShell({ 
  title, 
  lastUpdated, 
  children, 
  proseClassName = "prose-invert prose-emerald",
  contactEmail = "trejolunatutoriales@gmail.com"
}: LegalPageShellProps) {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl relative z-10">
      <div className={`prose max-w-none ${proseClassName}`}>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        <p className="text-gray-400">Last updated: {lastUpdated}</p>

        {children}

        <section className="mt-16 pt-8 border-t border-white/10">
          <h2 className="text-2xl font-semibold">Contact Information</h2>
          <p className="mt-4">
            If you have any questions or concerns about this policy or our practices, please contact us at:
          </p>
          <div className="mt-4 p-4 rounded-lg bg-surface_container_lowest border border-white/5 font-mono text-emerald-400">
            {contactEmail}
          </div>
        </section>
      </div>
    </div>
  );
}
