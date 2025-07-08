describe("Login Functionality - Case Sensitivity Check", () => {
  it("should login successssssssssfully with correct password and NOT show alert", () => {
    cy.userLoginHackathon();

    cy.url().should("include", "/items.html");
  });
});
