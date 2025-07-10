describe("HACK004", () => {
  it("HACK004", () => {
    cy.userLoginHackathon();
    cy.wait(1000);
    cy.url().should("include", "/items.html");
  });
});
