import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    reporter: "mochawesome",
    reporterOptions: {
      reportDir: "cypress/results",
      overwrite: false,
      html: false,
      json: true,
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "https://my-shop-eight-theta.vercel.app/", // change as needed
    specPattern: "cypress/e2e/**/*.ts",
  },
});
