import type { Metadata } from "next";
import { LegalPageShell } from "@hstrejoluna/ui";

export const metadata: Metadata = {
  title: "Legal Notice | Dark Kinetic",
  description: "Legal notice and ownership information for Dark Kinetic.",
};

export default function LegalNotice() {
  return (
    <LegalPageShell title="Legal Notice" lastUpdated="April 2026">
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">1. Ownership</h2>
        <p className="mt-4 text-gray-300">
          This portfolio and its microsites are owned and operated by Héctor Sebastián Trejo Luna. 
          The project is intended for professional showcasing and educational purposes.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">2. Intellectual Property</h2>
        <p className="mt-4 text-gray-300">
          The code for this project is open-source and available on GitHub. 
          However, the personal data, branding assets, and specific content within the "Dark Kinetic" identity 
          are reserved for professional representation.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">3. Disclaimers</h2>
        <p className="mt-4 text-gray-300">
          The information provided on this site is for general informational purposes only. 
          While we strive for accuracy, we make no warranties about the completeness or reliability of the information.
        </p>
      </section>
    </LegalPageShell>
  );
}
