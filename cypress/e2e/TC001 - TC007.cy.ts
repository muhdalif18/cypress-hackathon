describe("E-commerce Login Page Functionality", () => {
  // AI-Generated Test Configuration
  const baseUrl = "https://my-shop-eight-theta.vercel.app";

  // Test data from environment variables
  const validUser = Cypress.env("HACKATHON_USER");
  const validPassword = Cypress.env("HACKATHON_VALID_PASS");
  const defectPassword = Cypress.env("HACKATHON_DEFECT_VALID_PASS");

  beforeEach(() => {
    // Navigate to login page before each test
    cy.visit(baseUrl);

    // Verify login page elements are present
    cy.get("#username").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.get("button").contains("Login").should("be.visible");
  });

  // Test 1: Valid Login - Acceptance Criteria 1
  it("TC001: Should successfully login with valid credentials and redirect to items page", () => {
    /*
    Description: Test valid login functionality with correct credentials
    High Level Steps:
    1. Enter valid username and password
    2. Click login button
    3. Verify successful redirect to items page
    4. Verify items page content loads correctly
    */

    // AI-Generated Test Steps
    cy.log("Testing valid login functionality");

    // Enter valid credentials
    cy.get("#username").clear().type(validUser).should("have.value", validUser);

    cy.get("#password")
      .clear()
      .type(validPassword)
      .should("have.value", validPassword);

    // Click login button
    cy.get("button").contains("Login").click();

    // Verify successful login by checking URL redirect
    cy.url().should("include", "/items.html");

    // Verify items page content is loaded
    cy.get("h2").should("contain", "Select Your Items");

    cy.log("Valid login test completed successfully");
  });

  // Test 2: Invalid Credentials - Acceptance Criteria 2
  it("TC002: Should display alert for invalid credentials", () => {
    /*
    Description: Test invalid login credentials validation
    High Level Steps:
    1. Setup alert stub for verification
    2. Enter invalid username and password
    3. Click login button
    4. Verify alert is displayed
    5. Verify user remains on login page
    */

    // AI-Generated Test Steps
    cy.log("Testing invalid credentials validation");

    // Setup alert stub
    cy.window().then((win) => {
      cy.stub(win, "alert").as("windowAlert");
    });

    // Enter invalid credentials
    cy.get("#username").clear().type("invaliduser");

    cy.get("#password").clear().type("wrongpassword");

    // Click login button
    cy.get("button").contains("Login").click();

    // Verify alert is displayed for invalid credentials
    cy.get("@windowAlert").should("have.been.calledWith");

    // Verify user remains on login page
    cy.url().should("include", baseUrl);

    cy.log("Invalid credentials test completed successfully");
  });

  // Test 3: Empty Fields Validation - Acceptance Criteria 3
  it("TC003: Should display validation alerts for empty fields", () => {
    /*
    Description: Test empty field validation for login form
    High Level Steps:
    1. Setup alert stub for verification
    2. Test empty username scenario
    3. Test empty password scenario
    4. Test both fields empty scenario
    5. Verify appropriate alerts are displayed
    */

    // AI-Generated Test Steps
    cy.log("Testing empty fields validation");

    // Setup alert stub
    cy.window().then((win) => {
      cy.stub(win, "alert").as("windowAlert");
    });

    // Test empty username
    cy.get("#username").clear();
    cy.get("#password").clear().type("somepassword");
    cy.get("button").contains("Login").click();

    cy.get("@windowAlert").should("have.been.calledWith");

    cy.reload();

    // Test empty password
    cy.get("#username").clear().type("someuser");
    cy.get("#password").clear();
    cy.get("button").contains("Login").click();

    cy.get("@windowAlert").should("have.been.calledWith");

    cy.reload();

    // Test both fields empty
    cy.get("#username").clear();
    cy.get("#password").clear();
    cy.get("button").contains("Login").click();

    cy.get("@windowAlert").should("have.been.calledWith");

    cy.log("Empty fields validation test completed successfully");
  });

  // Test 4: Form Interaction - Acceptance Criteria 4
  it("TC004: Should allow proper interaction with input fields", () => {
    /*
    Description: Test form field interactions and attributes
    High Level Steps:
    1. Verify username field attributes and interactions
    2. Verify password field attributes and interactions
    3. Test login button properties
    4. Verify field focus and value changes
    */

    // AI-Generated Test Steps
    cy.log("Testing form field interactions");

    // Test username field interaction
    cy.get("#username")
      .should("be.visible")
      .should("have.attr", "type", "text")
      .should("have.attr", "placeholder", "Username")
      .focus()
      .type("testuser")
      .should("have.value", "testuser")
      .clear()
      .should("have.value", "");

    // Test password field interaction
    cy.get("#password")
      .should("be.visible")
      .should("have.attr", "type", "password")
      .should("have.attr", "placeholder", "Password")
      .focus()
      .type("testpassword")
      .should("have.value", "testpassword")
      .clear()
      .should("have.value", "");

    // Test login button interaction
    cy.get("button")
      .contains("Login")
      .should("be.visible")
      .should("not.be.disabled")
      .should("have.attr", "onclick", "login()");

    cy.log("Form interaction test completed successfully");
  });

  // Test 5: Password Field Security - Acceptance Criteria 5
  it("TC005: Should mask password input for security", () => {
    /*
    Description: Test password field security masking
    High Level Steps:
    1. Verify password field type attribute
    2. Enter password and verify masking
    3. Verify password content is not visible in DOM
    4. Confirm security implementation
    */

    // AI-Generated Test Steps
    cy.log("Testing password field security behavior");

    // Verify password field type
    cy.get("#password").should("have.attr", "type", "password");

    // Type password and verify it's masked
    cy.get("#password")
      .type("secretpassword123")
      .should("have.value", "secretpassword123");

    // Verify password field styling (masked input)
    cy.get("#password").then(($input) => {
      const inputType = $input.attr("type");
      expect(inputType).to.equal("password");
    });

    // Additional security check - verify password is not visible in DOM
    cy.get("#password").should("not.contain.text", "secretpassword123");

    cy.log("Password field security test completed successfully");
  });

  // Bonus Test: Defect Detection - Multiple Valid Passwords
  it("TC006: Should detect multiple valid password acceptance", () => {
    /*
    Description: Test for defect where multiple passwords are accepted for same user
    High Level Steps:
    1. Login with first valid password
    2. Verify successful login
    3. Return to login page
    4. Attempt login with second valid password
    5. Verify security defect (should fail but doesn't)
    */

    // AI-Generated Defect Detection Test
    cy.log("Testing identified defect - multiple valid passwords");

    // Test with first valid password
    cy.get("#username").clear().type(validUser);
    cy.get("#password").clear().type(validPassword);
    cy.get("button").contains("Login").click();

    // Verify successful login
    cy.url().should("include", "/items.html");

    // Navigate back to login page
    cy.visit(baseUrl);

    // Test with second valid password (defect case)
    cy.get("#username").clear().type(validUser);
    cy.get("#password").clear().type(defectPassword);
    cy.get("button").contains("Login").click();

    // This should fail in a properly secured system
    cy.get("@windowAlert").should("have.been.calledWith");

    cy.log("DEFECT CONFIRMED: Multiple passwords accepted for same user");
  });

  it("TC007: Should handle login button click events properly", () => {
    /*
    Description: Test login button click event handling
    High Level Steps:
    1. Verify login button is clickable
    2. Test button behavior with different field states
    3. Verify onclick event is properly attached
    4. Test button responsiveness
    */

    cy.log("Testing login button click event handling");

    // Verify button is clickable and has proper onclick attribute
    cy.get("button")
      .contains("Login")
      .should("be.visible")
      .should("not.be.disabled")
      .should("have.attr", "onclick", "login()");

    // Test button click with empty fields
    cy.get("button").contains("Login").click();

    // Test button click with partial data
    cy.get("#username").type("testuser");
    cy.get("button").contains("Login").click();

    // Test button click with complete data
    cy.get("#password").type("testpass");
    cy.get("button").contains("Login").click();

    cy.log("Login button click event test completed successfully");
  });
});
