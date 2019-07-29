const TasklistPage = require('../../pages/tasklistPage')
const IncidentsPage = require('../../pages/incidentsPage')
const SubmittedPage = require('../../pages/submittedPage')

context('Submit the incident report', () => {
  const bookingId = 1001
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubOffenderDetails', bookingId)
    cy.task('stubLocations', 'MDI')
    cy.task('stubOffenders')
    cy.task('stubLocation', '357591')
  })

  it('A form cannot be submitted until confirmed', () => {
    cy.login(bookingId)

    const tasklistPage = TasklistPage.visit(bookingId)
    tasklistPage.checkNoPartsComplete()

    const newIncidentPage = tasklistPage.startNewForm()
    const detailsPage = newIncidentPage.save()
    const relocationAndInjuriesPage = detailsPage.save()
    const evidencePage = relocationAndInjuriesPage.save()
    const checkAnswersPage = evidencePage.save()

    checkAnswersPage.clickSubmit()

    checkAnswersPage.checkStillOnPage()
    checkAnswersPage.errorSummary().contains('There is a problem')
    checkAnswersPage.errorLink('Check that you agree before submitting').click()
    cy.focused().check()
    checkAnswersPage.clickSubmit()

    SubmittedPage.verifyOnPage()
  })

  it('Can defer submitting form', () => {
    cy.login(bookingId)

    const tasklistPage = TasklistPage.visit(bookingId)
    tasklistPage.checkNoPartsComplete()

    const newIncidentPage = tasklistPage.startNewForm()
    const detailsPage = newIncidentPage.save()
    const relocationAndInjuriesPage = detailsPage.save()
    const evidencePage = relocationAndInjuriesPage.save()
    const checkAnswersPage = evidencePage.save()

    checkAnswersPage.backToTasklist().click()

    TasklistPage.verifyOnPage()
  })

  it('After submitting, can not resubmit, go on to view all incidents', () => {
    cy.login(bookingId)

    const tasklistPage = TasklistPage.visit(bookingId)
    tasklistPage.checkNoPartsComplete()

    const newIncidentPage = tasklistPage.startNewForm()
    const detailsPage = newIncidentPage.save()
    const relocationAndInjuriesPage = detailsPage.save()
    const evidencePage = relocationAndInjuriesPage.save()
    const checkAnswersPage = evidencePage.save()

    checkAnswersPage.confirm()
    checkAnswersPage.clickSubmit()

    SubmittedPage.verifyOnPage()

    cy.go('back')

    checkAnswersPage.clickSubmit()

    const incidentPage = IncidentsPage.verifyOnPage()
    const [date, prisoner, reporter] = incidentPage.getTodoRow(0)
    prisoner().should('contain', 'Norman Smith')
    reporter().should('contain', 'James Stuart')
    date().should(elem => expect(elem.text()).to.match(/\d{2}\/\d{2}\/\d{4} - \d{2}:\d{2}/))
  })
})
