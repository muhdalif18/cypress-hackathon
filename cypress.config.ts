import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Allure plugin setup
      try {
        const allureWriter = require("@shelex/cypress-allure-plugin/writer");
        allureWriter(on, config);

        // Optional: Configure Allure environment info
        return {
          ...config,
          env: {
            ...config.env,
            allure: true,
            allureReuseAfterSpec: true,
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
