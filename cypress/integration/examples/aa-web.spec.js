describe("AmplyAdvantaged Web UI tests", () => {
    /** I am using the name properties of the input elements
    as the keys for the test input objects
    to make the completeForm function easier to write */
    const VALID_ENTRY = {
        "fullName": "Joe Bloggs",
        "country": "GB",
        "yob": "1970-01-01",//format imposed by Cypress
        "position": "Yes Minister",
        "url": "https://cia.gov/bluebook/narnia",
        "risk": "HUGE"
    }

    const INVALID_ENTRIES = {
        "fullName": ["'"],
        "country": ["'", "Narnia"],
        "yob": ["2070-01-01", "1070-01-01", "1970-33-44"],
        "position": ["'", "99"],
        "url": ["fttps://cia.gov/bluebook/narnia", "http:/invalidslash.com", "https://invaliddomain/nowhere", "javascript:(alert('PWNED!'))"],
        "risk": ["NOT HUGE", 3]
    }

    it("Checks that the form cannot be submitted without adding content", () => {
        cy.completeForm()
        cy.get(".modal-dialog")
            .should("be.visible")
            .and("not.contain", "You added")
    })

    context("Completes a form with valid values", () => {

        it("Checks that a valid entries are accepted", () => {
            cy.completeForm(VALID_ENTRY)
            for (let paramName in VALID_ENTRY) {
                cy.get(`[name='${paramName}']`)
                    .should(($input) => {
                        expect($input).to.have.value(VALID_ENTRY[paramName])
                        if (paramName !== "yob") {
                            expect($input).to.have.attr("type", "text")
                        }
                    })
            }
        })
        it("Checks that confirmation message appears after saving", () => {
            cy.get(".modal-dialog")
                .should("be.visible")
                .and("contain", `You added ${VALID_ENTRY.fullName} to the list of entities.`)
        })
        it("Checks that the URL is marked as valid", () => {
            cy.get(".valid-feedback")
                .should("be.visible")
                .and("have.value", "Valid URL.")
        })

    })

    context(`Checks that wrong input values are rejected`, () => {

        for (let badParamName in INVALID_ENTRIES) {
            // clone the valid entry object
            // so that we can replace individual parameters
            // to test form handling with bad values
            const INVALID_ENTRY = Object.assign({}, VALID_ENTRY)
            const BAD_VALUES = INVALID_ENTRIES[badParamName]
            BAD_VALUES.forEach((badValue) => {
                it(`Should reject bad ${badParamName} value ${badValue}`, () => {
                    INVALID_ENTRY[badParamName] = badValue
                    cy.completeForm(INVALID_ENTRY)
                    if (badParamName !== "url") {
                        cy.get(".error")
                            .should("be.visible")
                    }
                })
                it(`Should not add forms with bad ${badParamName} value ${badValue}`, () => {
                    cy.get(".modal-dialog")
                        .should("not.be.visible")
                })
                it(`Should immediately validate URLs`, () => {
                    cy.checkURLvalidation(badParamName)
                })
            })
        }

    })
        
    context("Should validate missing entries", () => {

        const PARAM_NAMES = Object.keys(VALID_ENTRY);
        PARAM_NAMES.forEach((missingParamName) => {
            // clone the valid entry object
            // so that we can remove individual parameters
            // to test incomplete form handling
            const INCOMPLETE_ENTRY = Object.assign({}, VALID_ENTRY)
            it(`Checks that forms are rejected when "${missingParamName}" is missing`, () => {
                cy.incompleteForm(INCOMPLETE_ENTRY, missingParamName)
                cy.get(".modal-dialog")
                    .should("not.be.visible")
            })
            it(`Should immediately validate URLs`, () => {
                if (missingParamName === "url") {
                    cy.get('[class*="valid-feedback"]')
                        .should("not.be.visible")
                } else {
                    cy.checkURLvalidation(missingParamName)
                }
            })
        })
        
    })

    context("Checks for input sanitation", () => {
        
        it("Should not allow unsanitised input in the name field", () => {
            const BOBBY_TABLES = Object.assign({}, VALID_ENTRY)
            BOBBY_TABLES.fullName = "Robert'); DROP TABLE Politicians;--"
            cy.completeForm(BOBBY_TABLES)
            cy.get("[name='fullName']")
              .should("not.contain", "DROP TABLE")
        })
        it("Should not allow the form to be saved", () => {
            cy.get(".modal-dialog")
                .should("not.be.visible") 
        })
    
    })


})