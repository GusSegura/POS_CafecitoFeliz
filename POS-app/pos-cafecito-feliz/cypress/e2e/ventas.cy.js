describe('Módulo de Ventas', () => {

  beforeEach(() => {

    cy.visit('/login')

    cy.get('[data-cy=login-email]').type('admin@cafecito-feliz.com')
    cy.get('[data-cy=login-password]').type('qwe1234')
    cy.get('[data-cy=login-submit]').click()

    cy.url().should('not.include', 'login')

    // Esperar que backend valide sesión
    cy.intercept('GET', '**/api/productos').as('getProductos')

    cy.visit('/ventas')
    cy.wait('@getProductos')
  })


   it('Debe agregar productos al carrito', () => {

    cy.get('[data-cy=producto-card]').first().click()

    cy.get('[data-cy=carrito-item]')
      .should('have.length', 1)
  })


  it('Debe calcular total automáticamente', () => {

    cy.get('[data-cy=producto-card]').eq(0).click()
    cy.get('[data-cy=producto-card]').eq(1).click()

    cy.get('[data-cy=total]')
      .invoke('text')
      .then(total => {
        expect(total).to.not.contain('$0')
      })
  })


  it('Debe permitir cobrar una venta', () => {

    cy.intercept('POST', '**/api/ventas').as('postVenta')

    cy.get('[data-cy=producto-card]').first().click()

    cy.get('[data-cy=metodo-efectivo]').click()

    cy.get('[data-cy=btn-cobrar]').click()

    cy.wait('@postVenta')
      .its('response.statusCode')
      .should('eq', 201)
  })


  it('Debe vaciar el carrito después de cobrar', () => {

    cy.intercept('POST', '**/api/ventas').as('postVenta')

    cy.get('[data-cy=producto-card]').first().click()
    cy.get('[data-cy=btn-cobrar]').click()

    cy.wait('@postVenta')

    cy.get('[data-cy=carrito-item]').should('not.exist')
  })

})