import { defineConfig } from "cypress";

export default defineConfig({
  reporter: "mochawesome",
  reporterOptions: {
    reportDir: "cypress/results",
    overwrite: false,
    html: false,
    json: true,
    timestamp: "mmddyyyy_HHMMss",
    // Enhanced reporting options
    charts: true,
    reportPageTitle: "Cypress Test Report",
    reportTitle: "Test Results Dashboard",
    embeddedScreenshots: true,
    inlineAssets: true,
    saveJson: true,
    saveHtml: false, // We'll generate HTML later with merge
  },

  e2e: {
    baseUrl: "https://my-shop-eight-theta.vercel.app/",
    specPattern: "cypress/e2e/**/*.ts",
    setupNodeEvents(on, config) {
      // implement node event listeners here

      // Optional: Add task for custom reporting
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
    viewportWidth: 1920,
    viewportHeight: 1080,

    // Professional additions
    video: true,
    videosFolder: "cypress/videos",
    screenshotOnRunFailure: true,
    screenshotsFolder: "cypress/screenshots",

    // Retry configuration for flaky tests
    retries: {
      runMode: 2,
      openMode: 0,
    },

    // Timeouts
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    // Test isolation
    testIsolation: true,
  },
});
