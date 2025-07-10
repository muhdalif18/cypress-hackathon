describe("module1 - Case Sensitivity Check", () => {
  const username = Cypress.env("HACKATHON_USER");
  const validPassword = Cypress.env("HACKATHON_VALID_PASS");
  const invalidPassword = Cypress.env("HACKATHON_INVALID_PASS");

  it("test ", () => {
    cy.visit("/");
    const alertStub = cy.stub();
    cy.on("window:alert", alertStub);

    cy.get("#username").type(username);
    cy.get("#username").clear();
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
});
