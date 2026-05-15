module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: ["http://127.0.0.1:4173/en"],
      startServerCommand: "npm run start -- --port 4173 --hostname 127.0.0.1",
      startServerReadyPattern: "Ready",
      startServerReadyTimeout: 120000,
      settings: {
        preset: "desktop",
        chromeFlags: [
          "--no-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--headless=new",
          "--ignore-certificate-errors",
          "--allow-insecure-localhost",
        ].join(" "),
        maxWaitForLoad: 45000,
        maxWaitForFcp: 30000,
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.65 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "first-contentful-paint": ["error", { maxNumericValue: 3000 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "speed-index": ["error", { maxNumericValue: 4000 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
