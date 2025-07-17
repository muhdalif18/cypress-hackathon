import { defineConfig } from "cypress";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";

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

        // Store all test results
        let allTestResults: any[] = [];

        // Task to save test results
        on("task", {
          saveTestResults(results) {
            allTestResults = [...allTestResults, ...results];
            console.log(
              `Saved ${results.length} test results. Total: ${allTestResults.length}`
            );
            return null;
          },
        });

        // Generate CSV after each spec
        on("after:spec", (spec, results) => {
          if (results && results.tests) {
            const specResults = results.tests.map((test) => {
              const result = {
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
                failureReason: "",
                actionItem: "",
                action: "",
                localRun: process.env.JENKINS_URL ? "NO" : "YES",
                detectedBy: "Cypress Automation",
              };

              // Capture ACTUAL error details from Cypress/Allure
              if (test.state === "failed") {
                // Get the actual error object
                const error = test.err || test.error;

                if (error) {
                  // Capture the raw error message exactly as it appears
                  result.errorMessage = error.message || "";
                  result.errorStack = error.stack || "";
                  result.errorType = error.name || "Error";

                  // Use the actual error message as the reason
                  result.failureReason = error.message || "Unknown error";

                  // Extract actionable info from the actual error without predefined categories
                  if (error.message) {
                    result.actionItem = `Investigate: ${error.message}`;
                    result.action = "Debug based on actual error details";
                  }
                }

                // Also capture displayError if available (this is the formatted error from Cypress)
                if (test.displayError) {
                  result.errorMessage = test.displayError;
                  result.failureReason =
                    test.displayError.split("\n")[0] || "Unknown error";
                  result.errorStack = test.displayError;
                }
              } else if (test.state === "passed") {
                result.errorType = "PASSED";
                result.failureReason = "Test executed successfully";
                result.actionItem = "No action required";
                result.action = "Continue monitoring";
              }

              return result;
            });

            allTestResults = [...allTestResults, ...specResults];
          }
        });

        // Write comprehensive results after all tests complete
        on("after:run", (results) => {
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

          // Create CSV with ACTUAL error details from Cypress/Allure
          if (allTestResults.length > 0) {
            const csvHeader = [
              "defectFactorDependentPassedInLocal",
              "reason",
              "actionItem",
              "action",
              "localRun",
              "detectedBy",
              "errorMessage",
              "testId",
              "specFile",
              "duration",
              "status",
              "startTime",
              "endTime",
              "suite",
              "testClass",
              "testMethod",
              "errorType",
              "errorStack",
            ].join(",");

            const csvRows = allTestResults.map((test) =>
              [
                test.status === "failed" ? "YES" : "NO",
                `"${(test.failureReason || "").replace(/"/g, '""')}"`,
                `"${(test.actionItem || "").replace(/"/g, '""')}"`,
                `"${(test.action || "").replace(/"/g, '""')}"`,
                `"${test.localRun}"`,
                `"${test.detectedBy}"`,
                `"${(test.errorMessage || "").replace(/"/g, '""')}"`,
                `"${test.testId}"`,
                `"${test.specFile}"`,
                test.duration,
                test.status,
                test.startTime,
                test.endTime,
                `"${test.suite}"`,
                `"${test.testClass}"`,
                `"${test.testMethod}"`,
                `"${test.errorType}"`,
                `"${(test.errorStack || "")
                  .replace(/"/g, '""')
                  .replace(/\n/g, "\\n")}"`,
              ].join(",")
            );

            const csvContent = [csvHeader, ...csvRows].join("\n");
            const csvPath = path.join(allureResultsDir, "data_suites.csv");
            fs.writeFileSync(csvPath, csvContent);
            console.log(
              "CSV report with ACTUAL error details written to:",
              csvPath
            );
            console.log(`Total tests processed: ${allTestResults.length}`);
          }

          // Also read from allure-results JSON files if they exist
          try {
            const allureFiles = fs
              .readdirSync(allureResultsDir)
              .filter((file) => file.endsWith("-result.json"));

            allureFiles.forEach((file) => {
              const filePath = path.join(allureResultsDir, file);
              const allureData = JSON.parse(fs.readFileSync(filePath, "utf8"));

              if (allureData.status === "failed" && allureData.statusDetails) {
                console.log(`Allure error details for ${allureData.name}:`);
                console.log(`Message: ${allureData.statusDetails.message}`);
                console.log(`Trace: ${allureData.statusDetails.trace}`);

                // Update our CSV data with Allure details if available
                const matchingTest = allTestResults.find(
                  (test) =>
                    test.testMethod === allureData.name ||
                    test.testId.includes(allureData.name)
                );

                if (matchingTest && allureData.statusDetails) {
                  matchingTest.errorMessage =
                    allureData.statusDetails.message ||
                    matchingTest.errorMessage;
                  matchingTest.errorStack =
                    allureData.statusDetails.trace || matchingTest.errorStack;
                  matchingTest.failureReason =
                    allureData.statusDetails.message ||
                    matchingTest.failureReason;
                }
              }
            });

            // Re-write CSV with updated Allure data
            if (allTestResults.length > 0) {
              const csvHeader = [
                "defectFactorDependentPassedInLocal",
                "reason",
                "actionItem",
                "action",
                "localRun",
                "detectedBy",
                "errorMessage",
                "testId",
                "specFile",
                "duration",
                "status",
                "startTime",
                "endTime",
                "suite",
                "testClass",
                "testMethod",
                "errorType",
                "errorStack",
              ].join(",");

              const csvRows = allTestResults.map((test) =>
                [
                  test.status === "failed" ? "YES" : "NO",
                  `"${(test.failureReason || "").replace(/"/g, '""')}"`,
                  `"${(test.actionItem || "").replace(/"/g, '""')}"`,
                  `"${(test.action || "").replace(/"/g, '""')}"`,
                  `"${test.localRun}"`,
                  `"${test.detectedBy}"`,
                  `"${(test.errorMessage || "").replace(/"/g, '""')}"`,
                  `"${test.testId}"`,
                  `"${test.specFile}"`,
                  test.duration,
                  test.status,
                  test.startTime,
                  test.endTime,
                  `"${test.suite}"`,
                  `"${test.testClass}"`,
                  `"${test.testMethod}"`,
                  `"${test.errorType}"`,
                  `"${(test.errorStack || "")
                    .replace(/"/g, '""')
                    .replace(/\n/g, "\\n")}"`,
                ].join(",")
              );

              const csvContent = [csvHeader, ...csvRows].join("\n");
              const csvPath = path.join(allureResultsDir, "data_suites.csv");
              fs.writeFileSync(csvPath, csvContent);
              console.log("CSV updated with Allure error details");
            }
          } catch (error) {
            console.log("Could not read Allure JSON files:", error.message);
          }
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

    env: {
      allure: true,
      allureReuseAfterSpec: true,
      allureAddVideoOnPass: false,
    },
  },
});
