import { useState, useEffect } from "react";

type ConsentPreferences = {
  analytics: boolean;
  timestamp: string;
};

declare global {
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}

export function useCookieConsent() {
  const [hasConsented, setHasConsented] = useState(false);
  const [isGpcActive, setIsGpcActive] = useState(false);
  const [shouldShowBanner, setShouldShowBanner] = useState(false);

  const saveConsent = (analytics: boolean) => {
    const prefs: ConsentPreferences = {
      analytics,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("consent_preferences", JSON.stringify(prefs));
    setHasConsented(true);
    setShouldShowBanner(false);
  };

  useEffect(() => {
    const isGpcTruthy = typeof navigator.globalPrivacyControl !== "undefined" && navigator.globalPrivacyControl === true;
    const stored = localStorage.getItem("consent_preferences");

    if (isGpcTruthy) {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as ConsentPreferences;
          if (parsed && typeof parsed.analytics === "boolean" && parsed.analytics) {
            saveConsent(false);
          }
        } catch (error) {
          console.error("Consent preferences parsing failed:", error);
        }
      } else {
        saveConsent(false);
      }
      setIsGpcActive(true);
      return;
    }

    if (stored) {
      setHasConsented(true);
      setShouldShowBanner(false);
    } else {
      setShouldShowBanner(true);
    }
  }, []);

  const acceptCookies = () => saveConsent(true);
  const rejectCookies = () => saveConsent(false);

  return {
    hasConsented,
    isGpcActive,
    shouldShowBanner,
    acceptCookies,
    rejectCookies,
  };
}
