import type { Metadata } from "next";
import { LegalPageShell } from "@hstrejoluna/ui";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.cookiePolicy" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function CookiePolicy({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tLegal = await getTranslations({ locale, namespace: "legal" });
  const tCookie = await getTranslations({
    locale,
    namespace: "legal.cookiePolicy",
  });

  return (
    <LegalPageShell
      title={tCookie("title")}
      lastUpdated={tCookie("lastUpdated")}
      labels={{
        lastUpdatedPrefix: tLegal("lastUpdatedPrefix"),
        contactHeading: tLegal("contactHeading"),
        contactDescription: tLegal("contactDescription"),
      }}
    >
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">
          {tCookie("sections.whatAreCookies.heading")}
        </h2>
        <p className="mt-4 text-gray-300">
          {tCookie("sections.whatAreCookies.body")}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">
          {tCookie("sections.howWeUseCookies.heading")}
        </h2>
        <p className="mt-4 text-gray-300">
          {tCookie("sections.howWeUseCookies.body")}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">
          {tCookie("sections.cookieTable.heading")}
        </h2>
        <div className="mt-4 space-y-4">
          <p className="text-gray-300">
            {tCookie("sections.cookieTable.analyticsCookies")}
          </p>
          <p className="text-gray-300">
            {tCookie("sections.cookieTable.marketingCookies")}
          </p>
          <p className="text-gray-300">
            {tCookie("sections.cookieTable.essentialStorage")}
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">
          {tCookie("sections.managingPreferences.heading")}
        </h2>
        <p className="mt-4 text-gray-300">
          {tCookie("sections.managingPreferences.body")}
        </p>
      </section>
    </LegalPageShell>
  );
}
