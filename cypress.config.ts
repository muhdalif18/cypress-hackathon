import { defineConfig } from "cypress";
import allureWriter from "@shelex/cypress-allure-plugin/writer";

export default defineConfig({
  e2e: {
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    baseUrl: "https://my-shop-eight-theta.vercel.app",

    setupNodeEvents(on, config) {
      // Allure plugin writer
      allureWriter(on, config);
      return config;
    },
  },
});
