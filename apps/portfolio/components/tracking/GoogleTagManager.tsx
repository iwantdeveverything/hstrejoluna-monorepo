"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useCookieConsent } from "@hstrejoluna/compliance";
import { gtag, mapConsentToGtm } from "./gtm-utils";

interface GoogleTagManagerProps {
  gtmId: string;
}

export default function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  const { consentState } = useCookieConsent();

  // Push consent defaults and gtm.start event on mount
  useEffect(() => {
    if (!gtmId) return;

    gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": Date.now(),
      event: "gtm.js",
    });
  }, [gtmId]);

  // Push consent update when consentState changes
  useEffect(() => {
    if (!gtmId || !consentState) return;

    const mapped = mapConsentToGtm({
      analytics: consentState.analytics,
      marketing: consentState.marketing,
    });

    gtag("consent", "update", mapped);
  }, [gtmId, consentState]);

  if (!gtmId) return null;

  return (
    <>
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
