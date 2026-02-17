describe('Módulo de Productos', () => {

  beforeEach(() => {

    cy.visit('/login')

    cy.get('[data-cy=login-email]')
      .type('admin@cafecito-feliz.com')

    cy.get('[data-cy=login-password]')
      .type('qwe1234')

    cy.get('[data-cy=login-submit]')
      .click()

   
    cy.url().should('not.include', 'login')

    cy.visit('/productos')
  })

  it('Debe mostrar la lista de productos', () => {
    cy.get('[data-cy=producto-card]')
      .should('exist')
      .should('have.length.greaterThan', 0)
  })

  it('Debe mostrar nombre de producto', () => {
    cy.get('[data-cy=producto-card]')
      .first()
      .within(() => {
        cy.get('[data-cy=producto-nombre]')
          .should('not.be.empty')
      })
  })

it('Debe permitir crear un producto', () => {

  cy.intercept('POST', '**/productos').as('crearProducto')
  cy.intercept('GET', '**/productos').as('recargarProductos')

  cy.get('[data-cy=agregar-producto]').click()

  cy.get('input[name="nombre"]').type('Producto de prueba Cypress')
  cy.get('input[name="precio"]').type('25')
  cy.get('input[name="stock"]').type('10')

  cy.contains('Guardar').click()

  cy.wait('@crearProducto')        
  cy.wait('@recargarProductos')   

  cy.contains('Producto de prueba Cypress').should('be.visible')
})




})
