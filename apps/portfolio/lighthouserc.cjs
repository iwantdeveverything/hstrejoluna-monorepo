module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: ["http://127.0.0.1:4173/"],
      startServerCommand: "npm run start -- --port 4173",
      startServerReadyPattern: "Ready",
      startServerReadyTimeout: 120000,
      settings: {
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.85 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "first-contentful-paint": ["error", { maxNumericValue: 3000 }],
        "speed-index": ["error", { maxNumericValue: 4000 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
