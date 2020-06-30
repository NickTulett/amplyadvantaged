    /**
 * A helper function to take in an object in the above format
 * and feed it into the form, then check the value persists
 * Cypress handles any error messages automatically
 * @param {*} params an input object in the above format
 * defaults to an empty object for the no-user-input case
 */
Cypress.Commands.add("completeForm", (params = {}) => {
    cy.visit("/")
    for (let paramName in params) {
        cy.get(`[name='${paramName}']`)
            .type(params[paramName])
    }
    cy.get("button").click()
})

/** a helper function to remove a named parameter
 * from the input object
 * before submitting the remaining values in the form
 */
Cypress.Commands.add("incompleteForm", (params, excludedParam) => {
    delete(params[excludedParam]);
    cy.completeForm(params)
})

Cypress.Commands.add("checkURLvalidation", (badParamName) => {
    cy.get('[class*="valid-feedback"]')
        .should(($feedbackValidation) => {
            expect($feedbackValidation).to.be.visible
            if (badParamName === "url") {
                expect($feedbackValidation).to.have.class("invalid-feedback")
                expect($feedbackValidation).to.contain("Invalid URL format.")
            } else {
                expect($feedbackValidation).to.have.class("valid-feedback")
                expect($feedbackValidation).to.contain("Valid URL.")
            }
        })
})