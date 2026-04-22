import type { Metadata } from "next";
import { LegalPageShell } from "@hstrejoluna/ui";

export const metadata: Metadata = {
  title: "Privacy Policy | Maestros del Salmon",
  description: "Privacy policy for the Maestros del Salmon project.",
};

export default function PrivacyPolicy() {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated="April 2026" proseClassName="prose-slate">
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-slate-900">1. Data Collection</h2>
        <p className="mt-4 text-slate-600">
          Maestros del Salmon is a project-focused microsite. We do not collect personal data from visitors unless explicitly provided via external links.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-slate-900">2. Cookies</h2>
        <p className="mt-4 text-slate-600">
          This site uses basic cookies to remember your preferences. Please refer to our <a href="/cookies" className="text-salmon-600 underline">Cookie Policy</a> for more details.
        </p>
      </section>
    </LegalPageShell>
  );
}
