const newIncidentPage = require('./newIncidentPage')
const checkAnswersPage = require('./checkAnswersPage')
const page = require('./page')

const tasklistPage = () =>
  page('Report use of force', {
    startNewForm: () => {
      cy.get('[data-qa-new-incident-link]').click()
      return newIncidentPage()
    },
    goToAnswerPage: () => {
      cy.get('[data-qa-check-answers-link]').click()
      return checkAnswersPage()
    },
    offenderName: () => cy.get('[data-qa="offender-name"]'),
    nomisId: () => cy.get('[data-qa="nomis-id"]'),
    dob: () => cy.get('[data-qa="dob"]'),
    offenderImage: () => cy.get('[data-qa="offender-image"]'),
    checkNoPartsComplete: () => {
      cy.get('[data-qa-new-incident-completed]').should('not.exist')
      cy.get('[data-qa-details-completed]').should('not.exist')
      cy.get('[data-qa-relocation-and-injuries-completed]').should('not.exist')
      cy.get('[data-qa-evidence-completed]').should('not.exist')
    },
    checkAllPartsComplete: () => {
      cy.get('[data-qa-new-incident-completed]').should('exist')
      cy.get('[data-qa-details-completed]').should('exist')
      cy.get('[data-qa-relocation-and-injuries-completed]').should('exist')
      cy.get('[data-qa-evidence-completed]').should('exist')
    },
  })

export default {
  visit: bookingId => {
    cy.visit(`/report/${bookingId}/report-use-of-force`)
    return tasklistPage()
  },
  verifyOnPage: tasklistPage,
}
