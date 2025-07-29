import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // This runs your test files with `.cy.ts` inside the e2e folder
    specPattern: "cypress/e2e/**/*.cy.ts",

    // Support file for global setup (like custom commands, etc.)
    supportFile: "cypress/support/e2e.ts",

    // Base URL for `cy.visit('/')` — change it if needed
    baseUrl: "https://my-shop-eight-theta.vercel.app",

    setupNodeEvents(on, config) {
      // You can add plugins or event listeners here if needed
    },
  },
});
