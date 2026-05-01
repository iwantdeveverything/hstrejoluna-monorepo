import type { Metadata } from "next";
import { LegalPageShell } from "@hstrejoluna/ui";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacyPolicy" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function PrivacyPolicy({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tLegal = await getTranslations({ locale, namespace: "legal" });
  const tPrivacy = await getTranslations({
    locale,
    namespace: "legal.privacyPolicy",
  });

  return (
    <LegalPageShell
      title={tPrivacy("title")}
      lastUpdated={tPrivacy("lastUpdated")}
      labels={{
        lastUpdatedPrefix: tLegal("lastUpdatedPrefix"),
        contactHeading: tLegal("contactHeading"),
        contactDescription: tLegal("contactDescription"),
      }}
    >
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">
          {tPrivacy("sections.introduction.heading")}
        </h2>
        <p className="mt-4 text-gray-300">
          {tPrivacy("sections.introduction.body")}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">
          {tPrivacy("sections.dataCollection.heading")}
        </h2>
        <p className="mt-4 text-gray-300">
          {tPrivacy("sections.dataCollection.body")}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">
          {tPrivacy("sections.thirdPartyServices.heading")}
        </h2>
        <p className="mt-4 text-gray-300">
          {tPrivacy("sections.thirdPartyServices.body")}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">
          {tPrivacy("sections.gpc.heading")}
        </h2>
        <p className="mt-4 text-gray-300">{tPrivacy("sections.gpc.body")}</p>
      </section>
    </LegalPageShell>
  );
}
