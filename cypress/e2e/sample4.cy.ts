describe("module4 - aasssa", () => {
  it("aksdas jhdjsdakdj sdhjsd hakdhjs kashdasj djask dksahdjsh djsdt", () => {
    cy.userLoginHackathon();

    cy.url().should("include", "/items.html");
  });
});
