import { defineConfig } from "cypress";

export default defineConfig({
  reporter: "mochawesome",
  reporterOptions: {
    reportDir: "cypress/results",
    overwrite: false,
    html: false,
    json: true,
    timestamp: "mmddyyyy_HHMMss",
    // Enhanced reporting options for dashboard-style reports
    charts: true,
    reportPageTitle: "Cypress Test Dashboard",
    reportTitle: "Test Results Dashboard",
    embeddedScreenshots: true,
    inlineAssets: true,
    saveJson: true,
    saveHtml: false,
    // Add these for better dashboard experience
    showPassed: true,
    showFailed: true,
    showPending: true,
    showSkipped: true,
    showHooks: "failed",
    enableCode: true,
    enableCharts: true,
    autoOpen: false,
    // Add custom CSS for better styling
    customCss: "cypress/support/custom-report.css",
  },

  e2e: {
    baseUrl: "https://my-shop-eight-theta.vercel.app/",
    specPattern: "cypress/e2e/**/*.ts",
    setupNodeEvents(on, config) {
      // Enhanced reporting task
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
        // Add custom task for generating dashboard stats
        generateDashboardData(results) {
          // Process test results for dashboard
          const stats = {
            total: results.stats.tests,
            passed: results.stats.passes,
            failed: results.stats.failures,
            pending: results.stats.pending,
            skipped: results.stats.skipped,
            passPercentage: (
              (results.stats.passes / results.stats.tests) *
              100
            ).toFixed(2),
            duration: results.stats.duration,
          };
          console.log("Dashboard Stats:", stats);
          return stats;
        },
      });
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: true,
    videosFolder: "cypress/videos",
    screenshotOnRunFailure: true,
    screenshotsFolder: "cypress/screenshots",
    retries: {
      runMode: 2,
      openMode: 0,
    },
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    testIsolation: true,
  },
});
