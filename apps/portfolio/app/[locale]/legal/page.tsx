import type { Metadata } from "next";
import { LegalPageShell } from "@hstrejoluna/ui";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.legalNotice" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function LegalNotice({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tLegal = await getTranslations({ locale, namespace: "legal" });
  const tNotice = await getTranslations({
    locale,
    namespace: "legal.legalNotice",
  });

  return (
    <LegalPageShell
      title={tNotice("title")}
      lastUpdated={tNotice("lastUpdated")}
      labels={{
        lastUpdatedPrefix: tLegal("lastUpdatedPrefix"),
        contactHeading: tLegal("contactHeading"),
        contactDescription: tLegal("contactDescription"),
      }}
    >
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">
          {tNotice("sections.ownership.heading")}
        </h2>
        <p className="mt-4 text-gray-300">
          {tNotice("sections.ownership.body")}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">
          {tNotice("sections.intellectualProperty.heading")}
        </h2>
        <p className="mt-4 text-gray-300">
          {tNotice("sections.intellectualProperty.body")}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">
          {tNotice("sections.disclaimers.heading")}
        </h2>
        <p className="mt-4 text-gray-300">
          {tNotice("sections.disclaimers.body")}
        </p>
      </section>
    </LegalPageShell>
  );
}
