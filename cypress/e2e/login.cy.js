describe('Login Test', () => {
  it('should login successfully', () => {
    cy.visit('https://9000-firebase-studio-1756022814303.cluster-xpmcxs2fjnhg6xvn446ubtgpio.cloudworkstations.dev');
    cy.get('input[name="email"]').type('admin@gudang.com');
    cy.get('input[name="password"]').type('Pass155155');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard'); // sesuaikan dengan redirect setelah login
  });
});