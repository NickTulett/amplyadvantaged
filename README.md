# Technical Test - Nick Tulett 30/6/20

## Web UI Exercise

*I have chosen to write the tests in Cypress because it includes all the dependencies required to write, run and report the tests.*

*In addition, Cypress automatically handles timing and asserts that elements are present without needing to write specific test cases.*

*Note that I have made comments under "First Impressions" that assume this is a production site, not a mock-up. These may be over the top for this exercise.*

### Test environment set up

Install **node.js** and **npm**  
Clone this repo

`cd amplyadvantaged`

`npm install cypress --save-dev`

`npx cypress open`

Run the `aa-web.spec.js` test from the Cypress interface

## Functional spec

> The web application allows users to add politicians to a database through a web form.
>
>The following fields are mandatory: 
> - name
> - country (country code or full name)
> - date of birth (mm/dd/yyyy)
> - position (string)
> - url (where the info was extracted from, can be a fake url in valid format)
> - risk level (list selection). 
>
> The data format is also validated. 
>
> If data was successfully added,  a popup will confirm it, showing the name of the politician.
>
> This process is asynchronous, it might take a few seconds.

## First Impressions
### Security
* https should be used for sensitive data entry
* The form is missing basic HTTP security headers:
* * Strict Transport Policy
* * X Content Type
* * X Frame Options
* * Content Security Policy
* * X XSS Protection
* Are we sanitising text input server-side to prevent DB injection attacks?

### Country 
Field needs labelling to indicate:
* which country is relevant in this context
* what format the information can be entered in (code/name)

*We should use a pre-populated drop-down for country entry to eliminate typos. This could show both the full name (localised for the user) and country code - and be sortable/filterable by either. This would also drastically reduce the possible scope of possible tests compared to free-form text input*

### Year of birth  
* Should be "Date of birth" to prevent confusion
* Format should be "mm/dd/yyyy" to meet spec but is "dd/mm/yyyy" - perhaps date format should be localised rather than mandated.
* Input element is missing an id property that could be used for a selector in testing

### Position  
Wrongly typed as a password field, so will be invisible to the user

### Source info URL  
Pedantically, the success message should be "Valid URL format." - validity of URLs is not a solvable problem.  
This field will need sanitising to prevent javascript URLs being used to seed unexpected behaviour when the data is presented.  

### Risk level
Each option element is missing a value.  
*The user should be forced to enter a value here - defaulting to "Low" risks accidental form completion (e.g. by tabbing or hitting space or enter, unintended swipe/tap on mobile, etc.) with the wrong risk level.*

### noscript
It should be possible to render this form using vanilla HTML and CSS - with server-side validation.

### Performance
**Expires** headers are set at 12 hours - they should have much larger values to take advantage of browser caching.  
Connections are not persistent - resulting in repeated reconnection attempts to the same domain.  
Assets should be gzipped to improve transfer speeds.  
Assets should be served from other domains/CDN to improve parallelisation.
CSS and JS assets are largely redundant given the functionality of the page. If they are needed in subsequent parts of the app, then there is an argument for bundling and delivering them early to improve the overall performance of the app. If they are just cruft, then the bundling needs to be more targetted.

## Test Scripts

All the test scripts are inside the `aa-web.spec.js` file.  

- `Checks that the form cannot be submitted without adding content` immediately submits the form without inputting any data. This should trigger multiple validation errors on the front-end and prevent the form from being saved. This assumes that there is a pop-up for invalid form submissions and that it should not contain the words "You added".

The succeeding tests are all written in a data-driven way using the `VALID_ENTRY` and `INVALID_ENTRIES` objects.  
- `Completes a form with valid values` Takes a single valid input object, submits the form and checks that the name matches in the save dialog. This test can be extended to input multiple valid values to test edge cases (see next test for an example). It includes a check that all the non-date input fields are of a text type.
- `Checks that wrong input values are rejected` Takes the valid input and loops around the invalid values in the `INVALID_ENTRIES` object, resubmitting the form each time and checking that the save dialog is not shown and that the correct Source info URL validation is applied. Note that Cypress does not allow you to input invalid dates, so an alternative test would be required to check date validation. For fields that take unstructured free-form text input, I am assuming that at least one alpha character is necessary. I am also assuming that country names should be real.
- `Should validate missing entries` Takes the valid input and removes one value at a time, resubmitting the form each time and checking that the save dialog is not shown and that the correct Source info URL validation is applied. 
- `Checks for input sanitation` Attempts to submit an injection attack in the name field (the test can be extended to repeat for all text fields). The name value should be sanitised/deleted and the form NOT submitted.


### Helper functions
`cypress/support/commands.js` adds 3 functions to the `cy` object that input complete and incomplete form entries and check the URL validation. They are kept in this file to keep the main script file free of confusing detail.

## Test Results

Completing the form always fails because:
- "John Doe" is hard-coded into the submit dialog text 
- the name value that was input is deleted, resulting in errors in every test, plus a false positive in the `Checks for input sanitation` test.
- Cypress cannot set a value for the Risk level field because the option elements are not correctly specified.

Cypress reports false positives when checking the **Position** field value - the value is correct but the text is not because it is declared as a password input. There is an extra check in the `Completes a form with valid values` test to catch this.

Other than the URL field, there is no validation of acceptable values, so each test fails because no error message appears (I have assumed here that an element with a class of "error" should appear for invalid inputs).