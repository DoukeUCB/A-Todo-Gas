describe("register gasoline", ()=>{
    it ("test case 1: una vez iniciado sesion podremos registrar gasolineria", ()=>{
        cy.visit("https://quickgasoline.netlify.app/login");
        cy.get('[id="ci"]').type("1234567");
        cy.get('[id="password"]').type("1234567");
        cy.get('[id="submit-btn"]').click();
        cy.url().should('eq', 'https://quickgasoline.netlify.app/admin-dashboard.html');
        cy.get('[onclick="window.location.href=\'/registro-gasolinera.html\'"]').click();
        cy.get('[id="stationNumber"]').type("42");
        cy.get('[id="name"]').type("Estación Central");
        cy.get('[id="address"]').type("Av. Principal #123");
        //cy.get('[id="openTime"]').type("8:00");
        //cy.get('[id="closeTime"]').type("20:00");
        cy.get('[id="currentLevel"]').type("100");
        cy.get('#availabilityStatus').should('contain', 'Disponible');
        cy.get('[class="btn btn-primary"]').click();
    })
})