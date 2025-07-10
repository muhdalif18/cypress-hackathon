describe("Login Functionality - Case Sensitivity Check", () => {
  const username = Cypress.env("HACKATHON_USER");
  const validPassword = Cypress.env("HACKATHON_VALID_PASS");
  const invalidPassword = Cypress.env("HACKATHON_INVALID_PASS");

  it("should login successfully with correct password and NOT show alert", () => {
    cy.visit("/");
    const alertStub = cy.stub();
    cy.on("window:alert", alertStub);

    cy.get("#username").type(username);
    cy.get("#password").type(validPassword);
    cy.contains("button", "Login").click();

    // Assert alert was NOT called
    cy.then(() => {
      expect(alertStub).not.to.have.been.called;
    });

    // Assert redirection to items.html
    cy.url().should("include", "/items.html");
  });

  /* it("should reject login with UPPERCASE password and show alert", () => {
    cy.visit("/");

    // Listen to alert and assert the message
    const alertStub = cy.stub();
    cy.on("window:alert", alertStub);

    cy.get("#username").type(username);
    cy.get("#password").type(invalidPassword);
    cy.contains("button", "Login").click();

    // Assert that the alert was called with correct message
    cy.then(() => {
      expect(alertStub).to.have.been.called;
    });

    // Optional: Ensure the URL did NOT redirect
    cy.url().should("not.include", "/items.html");
  }); */
});
