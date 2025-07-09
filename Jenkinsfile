import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://my-shop-eight-theta.vercel.app/",
    specPattern: "cypress/e2e/**/*.ts",
    reporter: "mochawesome",
    reporterOptions: {
      reportDir: "cypress/results",
      overwrite: false,
      html: true, 
      json: true,
      inlineAssets: true, 
      reportPageTitle: "Cypress Test Report"
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    setupNodeEvents(on, config) {
      // No plugin needed for mochawesome
    },
  },
});
