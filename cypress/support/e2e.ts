import "@shelex/cypress-allure-plugin";
// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

Cypress.on("test:after:run", (test, runnable) => {
  if (test.state === "failed") {
    // Capture screenshot on failure
    cy.screenshot(`${test.parent.title} -- ${test.title} (failed)`);
  }
});

// Add custom commands or configurations here
declare global {
  namespace Cypress {
    interface Chainable {
      // Add your custom commands here if any
    }
  }
}
