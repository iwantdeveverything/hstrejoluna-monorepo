import type { Metadata } from "next";
import { LegalPageShell } from "@hstrejoluna/ui";

export const metadata: Metadata = {
  title: "Legal Notice | Maestros del Salmon",
  description: "Legal notice for the Maestros del Salmon project.",
};

export default function LegalNotice() {
  return (
    <LegalPageShell title="Legal Notice" lastUpdated="April 2026" proseClassName="prose-slate">
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-slate-900">1. Project Disclaimer</h2>
        <p className="mt-4 text-slate-600">
          Maestros del Salmon is an independent microsite part of the Trejo Luna portfolio hub.
        </p>
      </section>
    </LegalPageShell>
  );
}
