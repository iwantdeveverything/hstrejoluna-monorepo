import { CertificatesPanel } from "@hstrejoluna/ui";
import type { Certificate } from "@/types/sanity";
import { useTranslations } from "next-intl";

interface CertificatesOverviewProps {
  certificates: Certificate[];
}

export const CertificatesOverview = ({
  certificates,
}: CertificatesOverviewProps) => {
  const t = useTranslations("fragments.certificates");

  return (
    <CertificatesPanel
      certificates={certificates}
      labels={{
        dateUnavailable: t("dateUnavailable"),
        streamEmpty: t("streamEmpty"),
        noCertificates: t("noCertificates"),
        issuerUnavailable: t("issuerUnavailable"),
        issued: t("issued"),
        viewCredential: t("viewCredential"),
      }}
    />
  );
};
