import { defineConfig } from "cypress";
import { allureCypress } from "@shelex/cypress-allure-plugin/reporter";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      allureCypress(on, config);
      return config;
    },
    baseUrl: "https://my-shop-eight-theta.vercel.app/",
    specPattern: "cypress/e2e/**/*.cy.{js,ts}",
    supportFile: "cypress/support/e2e.ts",
    env: {
      allure: true,
      allureReuseAfterSpec: true,
    },
  },
});
