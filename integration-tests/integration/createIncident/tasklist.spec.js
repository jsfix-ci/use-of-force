const TasklistPage = require('../../pages/tasklistPage')

context('Submit the incident report', () => {
  const bookingId = 1001
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubOffenderDetails', bookingId)
    cy.task('stubLocations', 'MDI')
  })

  it('Offender details are rendered correctly', () => {
    cy.login(bookingId)

    const tasklistPage = TasklistPage.visit(bookingId)
    tasklistPage.checkNoPartsComplete()
    tasklistPage.offenderName().contains('Norman Smith')
    tasklistPage.dob().contains('26/12/2000')
    tasklistPage.nomisId().contains('A1234AC')
    tasklistPage.offenderImage().should('be.visible')
  })

  it('Parts are marked as complete after filled in', () => {
    cy.login(bookingId)

    const tasklistPage = TasklistPage.visit(bookingId)
    tasklistPage.checkNoPartsComplete()
    const newIncidentPage = tasklistPage.startNewForm()
    const detailsPage = newIncidentPage.save()
    detailsPage.fillForm()
    const relocationPage = detailsPage.save()
    const evidencePage = relocationPage.save()
    evidencePage.save()

    const tasklistPageAfterAllPartsComplete = TasklistPage.visit(bookingId)
    tasklistPageAfterAllPartsComplete.checkAllPartsComplete()
  })
})