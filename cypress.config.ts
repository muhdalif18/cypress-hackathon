import { defineConfig } from "cypress";
import { allureCypress } from "@shelex/cypress-allure-plugin";

export default defineConfig({
  e2e: {
    baseUrl: "https://my-shop-eight-theta.vercel.app/",
    specPattern: "cypress/e2e/**/*.ts",
    setupNodeEvents(on, config) {
      // Setup Allure plugin
      allureCypress(on, config, {
        resultsDir: "allure-results",
        // Optional: configure Allure options
        links: [
          {
            type: "issue",
            urlTemplate: "https://github.com/your-repo/issues/%s",
            nameTemplate: "Issue #%s",
          },
          {
            type: "tms",
            urlTemplate: "https://your-tms.com/test/%s",
            nameTemplate: "Test Case #%s",
          },
        ],
        environmentInfo: {
          "Test Environment": "CI/CD",
          Browser: "Electron",
          OS: "Windows",
          "Node Version": process.version,
          "Base URL": config.baseUrl,
        },
      });

      // Keep your existing tasks
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });

      return config;
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
