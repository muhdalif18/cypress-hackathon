describe("HACK005", () => {
  it("HACK005", () => {
    cy.userLoginHackathon();
    cy.wait(1000);
    cy.url().should("include", "/items.html");
  });
});
