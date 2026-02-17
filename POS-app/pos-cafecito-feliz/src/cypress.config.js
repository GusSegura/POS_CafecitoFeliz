const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl: "http://localhost:4200", 
    specPattern: "cypress/e2e/**/*.cy.{js,ts}",

    setupNodeEvents(on, config) {
      
    },
  },
});