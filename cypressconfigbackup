import { defineConfig } from "cypress";
import * as os from "os";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Allure plugin setup
      try {
        const allureWriter = require("@shelex/cypress-allure-plugin/writer");
        allureWriter(on, config);

        // Configure Allure environment info
        const environmentInfo = {
          Browser: "Chrome",
          OS: os.platform(),
          "OS Version": os.release(),
          "Node Version": process.version,
          Environment: process.env.NODE_ENV || "test",
          "Base URL": config.baseUrl,
          "CI/CD": process.env.BUILD_NUMBER
            ? `Jenkins Build #${process.env.BUILD_NUMBER}`
            : "Local",
          "Test Framework": "Cypress",
          "Report Generation": new Date().toISOString(),
          Executor: process.env.JENKINS_URL ? "Jenkins" : "Local Machine",
          Branch: process.env.GIT_BRANCH || "unknown",
          "Build ID": process.env.BUILD_ID || "local",
        };

        // Write environment info to allure-results
        on("after:run", (results) => {
          const fs = require("fs");
          const path = require("path");

          // Ensure allure-results directory exists
          const allureResultsDir = path.join(process.cwd(), "allure-results");
          if (!fs.existsSync(allureResultsDir)) {
            fs.mkdirSync(allureResultsDir, { recursive: true });
          }

          // Write environment.properties file
          const envPropsPath = path.join(
            allureResultsDir,
            "environment.properties"
          );
          const envProps = Object.entries(environmentInfo)
            .map(([key, value]) => `${key}=${value}`)
            .join("\n");

          fs.writeFileSync(envPropsPath, envProps);
          console.log("Environment properties written to:", envPropsPath);
        });

        return {
          ...config,
          env: {
            ...config.env,
            allure: true,
            allureReuseAfterSpec: true,
            environmentInfo,
          },
        };
      } catch (error) {
        console.log("Allure plugin not loaded:", error.message);
        return config;
      }
    },
    baseUrl: "https://my-shop-eight-theta.vercel.app/",
    specPattern: "cypress/e2e/**/*.cy.{js,ts}",
    supportFile: "cypress/support/e2e.ts",

    // Allure-specific configurations
    env: {
      allure: true,
      allureReuseAfterSpec: true,
      allureAddVideoOnPass: false, // Only add video on failure
    },
  },
});
