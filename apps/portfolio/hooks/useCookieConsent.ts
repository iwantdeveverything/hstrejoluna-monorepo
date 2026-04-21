import { useState, useEffect } from "react";

type ConsentPreferences = {
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

export function useCookieConsent() {
  const [hasConsented, setHasConsented] = useState(false);
  const [isGpcActive, setIsGpcActive] = useState(false);
  const [shouldShowBanner, setShouldShowBanner] = useState(false);

  useEffect(() => {
    // Read GPC flag
    const gpc = (navigator as any).globalPrivacyControl;
    const isGpcTruthy = typeof gpc !== "undefined" && gpc === true;

    // Read existing preferences
    const stored = localStorage.getItem("consent_preferences");

    if (isGpcTruthy && !stored) {
      // Auto-reject scenario
      const prefs: ConsentPreferences = {
        analytics: false,
        marketing: false,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("consent_preferences", JSON.stringify(prefs));
      setIsGpcActive(true);
      setHasConsented(true); // Treat auto-reject as resolved consent
      setShouldShowBanner(false);
      return;
    }

    if (isGpcTruthy) {
      setIsGpcActive(true);
    }

    if (stored) {
      setHasConsented(true);
      setShouldShowBanner(false);
    } else {
      setShouldShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    const prefs: ConsentPreferences = {
      analytics: true,
      marketing: true, // simplified for now
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("consent_preferences", JSON.stringify(prefs));
    setHasConsented(true);
    setShouldShowBanner(false);
  };

  const rejectCookies = () => {
    const prefs: ConsentPreferences = {
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("consent_preferences", JSON.stringify(prefs));
    setHasConsented(true);
    setShouldShowBanner(false);
  };

  return {
    hasConsented,
    isGpcActive,
    shouldShowBanner,
    acceptCookies,
    rejectCookies,
  };
}
