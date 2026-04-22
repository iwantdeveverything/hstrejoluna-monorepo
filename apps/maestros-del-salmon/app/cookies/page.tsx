import type { Metadata } from "next";
import { LegalPageShell } from "@hstrejoluna/ui";

export const metadata: Metadata = {
  title: "Cookie Policy | Maestros del Salmon",
  description: "Cookie policy for the Maestros del Salmon project.",
};

export default function CookiePolicy() {
  return (
    <LegalPageShell title="Cookie Policy" lastUpdated="April 2026" proseClassName="prose-slate">
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-slate-900">1. Tracking</h2>
        <p className="mt-4 text-slate-600">
          We use anonymous tracking (if consented) to improve the experience of this educational project.
        </p>
      </section>
    </LegalPageShell>
  );
}
