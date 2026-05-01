/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import {
  mapConsentToGtm,
  pushConsentDenial,
  gtag,
} from "../gtm-utils";

describe("mapConsentToGtm", () => {
  it("maps analytics=true, marketing=true to all 4 granted", () => {
    const result = mapConsentToGtm({ analytics: true, marketing: true });

    expect(result).toEqual({
      analytics_storage: "granted",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
  });

  it("maps analytics=false, marketing=false to all 4 denied", () => {
    const result = mapConsentToGtm({ analytics: false, marketing: false });

    expect(result).toEqual({
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });

  it("maps analytics=true, marketing=false to analytics granted, rest denied", () => {
    const result = mapConsentToGtm({ analytics: true, marketing: false });

    expect(result).toEqual({
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });

  it("maps analytics=false, marketing=true to analytics denied, ad_* granted", () => {
    const result = mapConsentToGtm({ analytics: false, marketing: true });

    expect(result).toEqual({
      analytics_storage: "denied",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
  });
});

describe("pushConsentDenial", () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it("pushes all 4 consent signals as denied to window.dataLayer", () => {
    pushConsentDenial();

    expect(window.dataLayer.length).toBe(1);

    const pushed = window.dataLayer[0] as unknown[];
    expect(pushed[0]).toBe("consent");
    expect(pushed[1]).toBe("update");
    expect(pushed[2]).toEqual({
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });
});

describe("gtag", () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it("pushes arguments to window.dataLayer", () => {
    gtag("consent", "default", { analytics_storage: "denied" });

    expect(window.dataLayer.length).toBe(1);

    const pushed = window.dataLayer[0] as unknown[];
    expect(pushed[0]).toBe("consent");
    expect(pushed[1]).toBe("default");
    expect(pushed[2]).toEqual({ analytics_storage: "denied" });
  });

  it("initializes window.dataLayer if it does not exist", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).dataLayer;

    gtag("event", "page_view");

    expect(window.dataLayer).toBeDefined();
    expect(window.dataLayer.length).toBe(1);

    const pushed = window.dataLayer[0] as unknown[];
    expect(pushed[0]).toBe("event");
    expect(pushed[1]).toBe("page_view");
  });
});
