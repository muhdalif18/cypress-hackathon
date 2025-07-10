describe("Item Selection Page - E-commerce Flow", () => {
  /*
  Description: Comprehensive test suite for item selection page functionality
  High Level Steps:
  1. Navigate to item selection page
  2. Verify page elements and items display
  3. Test item selection and variations
  4. Test quantity management
  5. Test checkout process flow
  6. Test customer information handling
  7. Test order confirmation flow
  8. Test validation scenarios
  */

  beforeEach(() => {
    // Navigate to the item selection page before each test
    cy.visit("/items.html");

    // Wait for the page to load completely
    cy.get("#itemsForm").should("be.visible");
  });

  it("TC008: Should display all available items when page loads", () => {
    /*
    Description: Test page load and item display functionality
    High Level Steps:
    1. Verify items form is visible
    2. Verify item checkboxes are present
    3. Verify specific items are displayed
    4. Confirm page loaded correctly
    */

    // Verify the items form is visible
    cy.get("#itemsForm").should("be.visible");

    // Verify items are displayed (checking for checkboxes which represent items)
    cy.get('input[type="checkbox"]').should("have.length.greaterThan", 0);

    // Verify at least one item is visible (T-Shirt in this case)
    cy.get('input[type="checkbox"][value="T-Shirt"]').should("be.visible");
  });

  it("TC009: Should allow selection of item variations from dropdown menus", () => {
    /*
    Description: Test item variation selection functionality
    High Level Steps:
    1. Verify size selector dropdown is present
    2. Test selecting different sizes (S, M, L, XL)
    3. Verify size selection values are updated
    4. Confirm dropdown functionality works
    */

    // Verify size selector dropdown is present
    cy.get(".size-selector").should("be.visible");

    // Test selecting different sizes
    cy.get(".size-selector").eq(0).select("S");
    cy.get(".size-selector").should("have.value", "S");

    cy.get(".size-selector").eq(0).select("M");
    cy.get(".size-selector").should("have.value", "M");

    cy.get(".size-selector").eq(0).select("L");
    cy.get(".size-selector").should("have.value", "L");

    cy.get(".size-selector").eq(0).select("XL");
    cy.get(".size-selector").should("have.value", "XL");
  });

  it("TC010: Should update quantity correctly when set to value greater than 0", () => {
    /*
    Description: Test quantity input functionality
    High Level Steps:
    1. Select an item first
    2. Verify quantity input is visible
    3. Test setting different quantities
    4. Verify quantity values are updated correctly
    */

    // First select an item
    cy.get('input[type="checkbox"][value="T-Shirt"]').check();

    // Verify quantity input is visible
    cy.get(".quantity-input").eq(0).should("be.visible");

    // Test setting different quantities
    cy.get(".quantity-input").eq(0).clear().type("2");
    cy.get(".quantity-input").eq(0).should("have.value", "2");

    cy.get(".quantity-input").eq(0).clear().type("5");
    cy.get(".quantity-input").eq(0).should("have.value", "5");

    cy.get(".quantity-input").eq(0).clear().type("10");
    cy.get(".quantity-input").eq(0).should("have.value", "10");
  });

  it("TC011: Should show customer information popup when proceeding to checkout with valid selections", () => {
    /*
    Description: Test checkout process initiation
    High Level Steps:
    1. Select an item
    2. Set quantity greater than 0
    3. Click proceed to checkout
    4. Verify customer information modal appears
    5. Verify all required fields are present
    */

    // Select an item
    cy.get('input[type="checkbox"][value="T-Shirt"]').check();

    // Set quantity greater than 0
    cy.get(".quantity-input").eq(0).clear().type("2");

    // Click proceed to checkout
    cy.get(".submit-btn").click();

    // Verify customer information modal appears
    cy.get(".modal-content").should("be.visible");

    // Verify customer information fields are present
    cy.get("#customerName").should("be.visible");
    cy.get("#customerPhone").should("be.visible");
    cy.get("#customerAddress").should("be.visible");
    cy.get("#proceedBtn").should("be.visible");
    cy.get("#cancelBtn").should("be.visible");
  });

  it("TC012: Should allow entering correct customer information and proceeding", () => {
    /*
    Description: Test customer information form functionality
    High Level Steps:
    1. Select item and set quantity
    2. Proceed to checkout
    3. Fill in customer information
    4. Verify information was entered correctly
    5. Proceed to confirmation modal
    */

    // Select an item and set quantity
    cy.get('input[type="checkbox"][value="T-Shirt"]').check();
    cy.get(".quantity-input").eq(0).clear().type("1");

    // Proceed to checkout
    cy.get(".submit-btn").click();

    // Fill in customer information
    cy.get("#customerName").type("John Doe");
    cy.get("#customerPhone").type("0123456789");
    cy.get("#customerAddress").type("123 Main Street, Kuala Lumpur");

    // Verify information was entered correctly
    cy.get("#customerName").should("have.value", "John Doe");
    cy.get("#customerPhone").should("have.value", "0123456789");
    cy.get("#customerAddress").should(
      "have.value",
      "123 Main Street, Kuala Lumpur"
    );

    // Click proceed button
    cy.get("#proceedBtn").should("be.enabled").click();

    // Verify confirmation modal appears
    cy.get(".modal-content").should("be.visible");
    cy.get("#confirmYes").should("be.visible").and("contain", "Yes, Proceed");
    cy.get("#confirmNo").should("be.visible").and("contain", "No, Go Back");
  });

  it("TC013: Should allow clicking Yes to proceed or No to cancel", () => {
    /*
    Description: Test order confirmation dialog functionality
    High Level Steps:
    1. Complete flow to confirmation dialog
    2. Test clicking No (Go Back) button
    3. Repeat flow to test Yes button
    4. Verify order summary appears after Yes
    */

    // Complete the flow to confirmation dialog
    cy.get('input[type="checkbox"][value="T-Shirt"]').check();
    cy.get(".quantity-input").eq(0).clear().type("1");
    cy.get(".submit-btn").click();

    cy.get("#customerName").type("Test User");
    cy.get("#customerPhone").type("0123456789");
    cy.get("#customerAddress").type("Test Address");
    cy.get("#proceedBtn").click();

    // Test clicking No (Go Back)
    cy.get("#confirmNo").click();
    // Should go back to previous state

    // Repeat flow to test Yes button
    cy.get(".submit-btn").click();
    cy.get("#customerName").clear().type("Test User");
    cy.get("#customerPhone").clear().type("0123456789");
    cy.get("#customerAddress").clear().type("Test Address");
    cy.get("#proceedBtn").click();

    // Test clicking Yes (Proceed)
    cy.get("#confirmYes").should("not.be.disabled").click();

    // Verify order summary appears
    cy.get(".summary-header").should("be.visible");
  });

  it("TC014: Should display order details after confirmation", () => {
    /*
    Description: Test order summary display functionality
    High Level Steps:
    1. Complete full order flow
    2. Verify order summary header
    3. Verify order number is displayed
    4. Verify customer details are shown
    5. Verify total price is displayed
    */

    // Complete full flow
    cy.get('input[type="checkbox"][value="T-Shirt"]').check();
    cy.get(".quantity-input").eq(0).clear().type("2");
    cy.get(".submit-btn").click();

    cy.get("#customerName").type("Summary Test User");
    cy.get("#customerPhone").type("0123456789");
    cy.get("#customerAddress").type("Summary Test Address");
    cy.get("#proceedBtn").click();

    cy.get("#confirmYes").click();

    cy.get(".summary-header h2").should("contain", "Order Summary");
    cy.get(".order-number").should("be.visible").and("contain", "Order #");

    // Verify customer details are displayed
    cy.get("#customerDetails").should("be.visible");

    // Verify summary list is present
    cy.get("#summaryList").should("be.visible");

    // Verify total price is displayed
    cy.get("#totalPrice").should("be.visible").and("contain", "Total: RM");
  });

  it("TC015: Should provide option to go back to item selection", () => {
    /*
    Description: Test back navigation functionality
    High Level Steps:
    1. Complete full flow to order summary
    2. Verify back button is present
    3. Test back button functionality
    4. Verify return to items page
    */

    // Complete full flow to order summary
    cy.get('input[type="checkbox"][value="T-Shirt"]').check();
    cy.get(".quantity-input").eq(0).clear().type("1");
    cy.get(".submit-btn").click();

    cy.get("#customerName").type("Back Test User");
    cy.get("#customerPhone").type("0123456789");
    cy.get("#customerAddress").type("Back Test Address");
    cy.get("#proceedBtn").click();

    cy.get("#confirmYes").click();

    // Verify back button is present and functional
    cy.get(".btn-back").should("be.visible").and("contain", "Back to Items");

    // Test back button functionality
    cy.get(".btn-back").click();
    cy.url().should("include", "items.html");
  });

  it("TC016: Should prevent proceeding to checkout when no items are selected", () => {
    /*
    Description: Test validation for no items selected
    High Level Steps:
    1. Try to proceed without selecting any items
    2. Verify form is still visible
    3. Verify error message is displayed
    4. Confirm validation works correctly
    */

    // Try to proceed without selecting any items
    cy.get(".submit-btn").click();

    // Should not proceed - form should still be visible
    cy.get("#itemsForm").should("be.visible");

    // Check if error message is displayed or button is disabled
    // This depends on the actual implementation
    cy.get(".modal-content").should("exist");
    cy.contains("Please select at least one item.").should("be.visible");
  });

  it("TC017: Should prevent proceeding when item is selected but quantity is 0", () => {
    /*
    Description: Test validation for zero quantity
    High Level Steps:
    1. Select an item
    2. Set quantity to 0
    3. Try to proceed
    4. Verify checkout doesn't proceed
    */

    // Select an item
    cy.get('input[type="checkbox"][value="T-Shirt"]').check();

    // Set quantity to 0
    cy.get(".quantity-input").eq(0).clear();

    // Try to proceed
    cy.get(".submit-btn").click();

    // Should not proceed to checkout
    cy.get(".modal-content").should("not.exist");
  });

  it("TC018: Should prevent proceeding if name are not filled", () => {
    /*
    Description: Test validation for empty name field
    High Level Steps:
    1. Get to customer information form
    2. Leave name field empty
    3. Fill other fields
    4. Try to proceed
    5. Verify validation prevents proceeding
    */

    // Get to customer information form
    cy.get('input[type="checkbox"][value="T-Shirt"]').check();
    cy.get(".quantity-input").eq(0).clear().type("1");
    cy.get(".submit-btn").click();

    // Fill phone number and address
    cy.get("#customerName").clear();
    cy.get("#customerPhone").type("0123456789");
    cy.get("#customerAddress").type("Phone Test Address");

    // Try to proceed
    cy.get("#proceedBtn").click();

    // Should not proceed or should show validation error
    cy.get(".modal-content").should("not.be.visible"); // Should still be on customer info modal
  });

  it("TC019: Should validate phone number input and prevent invalid characters", () => {
    /*
    Description: Test phone number validation
    High Level Steps:
    1. Get to customer information form
    2. Fill name and address fields
    3. Enter invalid phone number with special characters
    4. Try to proceed
    5. Verify validation prevents proceeding
    */

    // Get to customer information form
    cy.get('input[type="checkbox"][value="T-Shirt"]').check();
    cy.get(".quantity-input").eq(0).clear().type("1");
    cy.get(".submit-btn").click();

    // Fill name and address
    cy.get("#customerName").type("Phone Test User");
    cy.get("#customerAddress").type("Phone Test Address");

    // Test invalid phone number with symbols
    cy.get("#customerPhone").type("abc!@#$%^&*()");

    // Try to proceed
    cy.get("#proceedBtn").click();

    // Should not proceed or should show validation error
    cy.get(".modal-content").should("not.be.visible"); // Should still be on customer info modal
  });

  it("TC020: Should accept valid phone numbers and proceed", () => {
    /*
    Description: Test valid phone number acceptance
    High Level Steps:
    1. Get to customer information form
    2. Fill all fields with valid data
    3. Enter valid Malaysian phone number
    4. Verify proceeding to confirmation modal
    */

    // Get to customer information form
    cy.get('input[type="checkbox"][value="T-Shirt"]').check();
    cy.get(".quantity-input").eq(0).clear().type("1");
    cy.get(".submit-btn").click();

    // Fill all fields with valid data
    cy.get("#customerName").type("Valid Phone User");
    cy.get("#customerPhone").type("0123456789"); // Valid Malaysian phone number
    cy.get("#customerAddress").type("Valid Address");

    // Should be able to proceed
    cy.get("#proceedBtn").click();

    // Should reach confirmation modal
    cy.get("#confirmYes").should("be.visible");
    cy.get("#confirmNo").should("be.visible");
  });

  it("TC021: Should complete full happy path flow from item selection to order summary", () => {
    /*
    Description: Test complete end-to-end flow
    High Level Steps:
    1. Select item with size and quantity
    2. Proceed to checkout
    3. Fill customer information
    4. Confirm order
    5. Verify order summary
    6. Test back button functionality
    */

    // Complete end-to-end flow
    cy.get('input[type="checkbox"][value="T-Shirt"]').check();
    cy.get(".size-selector").eq(0).select("M");
    cy.get(".quantity-input").eq(0).clear().type("3");

    cy.get(".submit-btn").click();

    cy.get("#customerName").type("Integration Test User");
    cy.get("#customerPhone").type("0123456789");
    cy.get("#customerAddress").type(
      "123 Integration Test Street, Kuala Lumpur"
    );

    cy.get("#proceedBtn").click();

    cy.get("#confirmYes").click();

    // Verify final order summary
    cy.get(".summary-header").should("be.visible");
    cy.get("#customerDetails").should("contain", "Integration Test User");
    cy.get("#summaryList").should("be.visible");
    cy.get("#totalPrice").should("contain", "RM");

    // Verify back button works
    cy.get(".btn-back").should("be.visible");
  });

  it("TC022: Should handle cancel operations at different stages", () => {
    /*
    Description: Test cancel functionality at various stages
    High Level Steps:
    1. Test cancel at customer information stage
    2. Verify return to item selection
    3. Test cancel at confirmation stage
    4. Verify appropriate navigation behavior
    */

    // Test cancel at customer information stage
    cy.get('input[type="checkbox"][value="T-Shirt"]').check();
    cy.get(".quantity-input").eq(0).clear().type("1");
    cy.get(".submit-btn").click();

    cy.get("#cancelBtn").click();

    // Should return to item selection
    cy.get("#itemsForm").should("be.visible");

    // Test cancel at confirmation stage
    cy.get('input[type="checkbox"][value="T-Shirt"]').check();
    cy.get(".quantity-input").eq(0).clear().type("1");
    cy.get(".submit-btn").click();
    cy.get("#customerName").type("Cancel Test User");
    cy.get("#customerPhone").type("0123456789");
    cy.get("#customerAddress").type("Cancel Test Address");
    cy.get("#proceedBtn").click();

    cy.get("#confirmNo").click();

    // Should go back appropriately
    cy.get("#itemsForm").should("be.visible");
  });
});
