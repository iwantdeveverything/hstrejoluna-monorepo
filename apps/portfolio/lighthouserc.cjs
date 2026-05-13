module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: ["http://127.0.0.1:4173/en"],
      startServerCommand: "npm run start -- --port 4173",
      startServerReadyPattern: "Ready",
      startServerReadyTimeout: 120000,
      settings: {
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:performance": [
          ["warn", { minScore: 0.7 }],
          ["error", { minScore: 0.6 }],
        ],
        "categories:accessibility": [
          ["warn", { minScore: 0.9 }],
          ["error", { minScore: 0.8 }],
        ],
        "categories:best-practices": [
          ["warn", { minScore: 0.9 }],
          ["error", { minScore: 0.8 }],
        ],
        "categories:seo": [
          ["warn", { minScore: 0.95 }],
          ["error", { minScore: 0.9 }],
        ],
        "first-contentful-paint": ["warn", { maxNumericValue: 5000 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 4000 }],
        "speed-index": ["error", { maxNumericValue: 4000 }],
        "total-blocking-time": [
          ["warn", { maxNumericValue: 600 }],
          ["error", { maxNumericValue: 1000 }],
        ],
        "cumulative-layout-shift": [
          ["warn", { maxNumericValue: 0.1 }],
          ["error", { maxNumericValue: 0.25 }],
        ],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
