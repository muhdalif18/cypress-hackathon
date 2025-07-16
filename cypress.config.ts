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

        // Enhanced test results tracking
        const testResults = [];

        // Track test results with detailed error information
        on("after:spec", (spec, results) => {
          if (results && results.tests) {
            results.tests.forEach((test) => {
              const testResult = {
                testId: test.title ? test.title.join(" - ") : "Unknown Test",
                specFile: spec.name,
                duration: test.duration || 0,
                status: test.state || "unknown",
                startTime: test.wallClockStartedAt || new Date().toISOString(),
                endTime: test.wallClockDuration
                  ? new Date(
                      new Date(test.wallClockStartedAt).getTime() +
                        test.wallClockDuration
                    ).toISOString()
                  : new Date().toISOString(),
                suite: test.title
                  ? test.title.slice(0, -1).join(" - ")
                  : "Unknown Suite",
                testClass: spec.name
                  .replace(".cy.js", "")
                  .replace(".cy.ts", ""),
                testMethod: test.title
                  ? test.title[test.title.length - 1]
                  : "Unknown Method",
                errorMessage: "",
                errorStack: "",
                errorType: "",
              };

              // Add error details if test failed
              if (test.state === "failed" && test.displayError) {
                testResult.errorMessage =
                  test.displayError.split("\n")[0] || "Unknown error";
                testResult.errorStack = test.displayError || "";
                testResult.errorType = test.displayError.includes(
                  "AssertionError"
                )
                  ? "AssertionError"
                  : test.displayError.includes("TimeoutError")
                  ? "TimeoutError"
                  : test.displayError.includes("NetworkError")
                  ? "NetworkError"
                  : "UnknownError";
              }

              testResults.push(testResult);
            });
          }
        });

        // Write comprehensive results after all tests complete
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

          // Create detailed CSV report with error information
          if (testResults.length > 0) {
            const csvHeader = [
              "TEST_ID",
              "SPEC_FILE",
              "DURATION_MS",
              "STATUS",
              "START_TIME",
              "END_TIME",
              "SUITE",
              "TEST_CLASS",
              "TEST_METHOD",
              "ERROR_MESSAGE",
              "ERROR_TYPE",
              "ERROR_STACK",
            ].join(",");

            const csvRows = testResults.map((test) =>
              [
                `"${test.testId}"`,
                `"${test.specFile}"`,
                test.duration,
                test.status,
                test.startTime,
                test.endTime,
                `"${test.suite}"`,
                `"${test.testClass}"`,
                `"${test.testMethod}"`,
                `"${test.errorMessage.replace(/"/g, '""')}"`,
                `"${test.errorType}"`,
                `"${test.errorStack
                  .replace(/"/g, '""')
                  .replace(/\n/g, "\\n")}"`,
              ].join(",")
            );

            const csvContent = [csvHeader, ...csvRows].join("\n");
            const csvPath = path.join(
              allureResultsDir,
              "test-results-detailed.csv"
            );
            fs.writeFileSync(csvPath, csvContent);
            console.log("Detailed test results CSV written to:", csvPath);
          }

          // Also create a summary CSV for Jenkins
          const summaryPath = path.join(allureResultsDir, "test-summary.csv");
          const summary = {
            totalTests: results.totalTests || 0,
            totalPassed: results.totalPassed || 0,
            totalFailed: results.totalFailed || 0,
            totalPending: results.totalPending || 0,
            totalSkipped: results.totalSkipped || 0,
            totalDuration: results.totalDuration || 0,
            runDate: new Date().toISOString(),
            buildNumber: process.env.BUILD_NUMBER || "local",
            environment: process.env.NODE_ENV || "test",
          };

          const summaryContent = Object.entries(summary)
            .map(([key, value]) => `${key},${value}`)
            .join("\n");
          fs.writeFileSync(summaryPath, summaryContent);

          console.log("Environment properties written to:", envPropsPath);
          console.log("Test summary written to:", summaryPath);
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
