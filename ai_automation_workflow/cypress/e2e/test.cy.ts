describe("E-commerce Login Page Functionality", () => {
  // AI-Generated Test Configuration
  const baseUrl = "https://my-shop-eight-theta.vercel.app";

  // Test data from environment variables
  const validUser = Cypress.env("HACKATHON_USER");
  const validPassword = Cypress.env("HACKATHON_VALID_PASS");
  const defectPassword = Cypress.env("HACKATHON_DEFECT_VALID_PASS");

  beforeEach(() => {
    // Navigate to login page before each test
    cy.visit(baseUrl);

    // Verify login page elements are present
    cy.get("#username").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.get("button").contains("Login").should("be.visible");
  });

  // Test 1: Valid Login - Acceptance Criteria 1
  it("TC001: Should successfully login with valid credentials and redirect to items page", () => {
    /*
    Description: Test valid login functionality with correct credentials
    High Level Steps:
    1. Enter valid username and password
    2. Click login button
    3. Verify successful redirect to items page
    4. Verify items page content loads correctly
    */

    // AI-Generated Test Steps
    cy.log("Testing valid login functionality");

    // Enter valid credentials
    cy.get("#username").clear().type(validUser).should("have.value", validUser);

    cy.get("#password")
      .clear()
      .type(validPassword)
      .should("have.value", validPassword);

    // Click login button
    cy.get("button").contains("Login").click();

    // Verify successful login by checking URL redirect
    cy.url().should("include", "/items.html");

    // Verify items page content is loaded
    cy.get("h2").should("contain", "Select Your Items");

    cy.log("Valid login test completed successfully");
  });
});
