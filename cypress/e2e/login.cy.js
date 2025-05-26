describe("login", ()=>{
    it ("test case 1: login con usuario correcto", ()=>{
        cy.visit("https://quickgasoline.netlify.app");
        cy.get('[href="/login"]').first().click();
        cy.get('[id="ci"]').type("1234567");
        cy.get('[id="password"]').type("1234567");
        cy.get('[id="submit-btn"]').click();
    })
})

describe("login", ()=>{
    it ("test case 2: login con usuario incorrecto", ()=>{
        cy.visit("https://quickgasoline.netlify.app/login");
        cy.get('[id="ci"]').type("1234567");
        cy.get('[id="password"]').type("12345678");
        cy.get('[id="submit-btn"]').click();
        cy.get('[id="error-message"]').should('be.visible');
    })
})
