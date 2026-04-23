import { CertificatesPanel } from "@hstrejoluna/ui";
import type { Certificate } from "@hstrejoluna/types-sanity";

interface CertificatesOverviewProps {
  certificates: Certificate[];
}

export const CertificatesOverview = ({
  certificates,
}: CertificatesOverviewProps) => {
  return <CertificatesPanel certificates={certificates} />;
};
