describe("Login Functionality - Case Sensitivity Check", () => {
  it("should login successfully with correct password and NOT show alert", () => {
    cy.userLoginHackathon();

    cy.url().should("include", "/items.html");
  });
});
