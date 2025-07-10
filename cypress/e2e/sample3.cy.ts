describe("module1 - aaa", () => {
  it("should login successfully with correct passwddddddddord and NOT show alert", () => {
    cy.userLoginHackathon();

    cy.url().should("include", "/items.html");
  });
});
