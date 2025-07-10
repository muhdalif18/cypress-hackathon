describe("HACK003", () => {
  it("HACK003", () => {
    cy.userLoginHackathon();
    cy.wait(1000);
    cy.url().should("include", "/items.html");
  });
});
