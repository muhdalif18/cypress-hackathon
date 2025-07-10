describe("HACK002", () => {
  it("HACK002", () => {
    cy.userLoginHackathon();

    cy.url().should("include", "/items.html");
  });
});
