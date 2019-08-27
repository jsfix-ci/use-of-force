const request = require('supertest')
const { appSetup } = require('./testutils/appSetup')
const createRouter = require('./index')
const { authenticationMiddleware } = require('./testutils/mockAuthentication')

const reportService = {
  getCurrentDraft: jest.fn(),
}

const offenderService = {
  getOffenderDetails: jest.fn(),
  getLocation: jest.fn(),
}

const checkAnswersRoute = createRouter({ authenticationMiddleware, reportService, offenderService })

let app

beforeEach(() => {
  app = appSetup(checkAnswersRoute)
  reportService.getCurrentDraft.mockResolvedValue({})
  offenderService.getOffenderDetails.mockResolvedValue({})
  offenderService.getLocation.mockResolvedValue({})
})

describe('GET /check-answers', () => {
  it('should render page content', () =>
    request(app)
      .get('/check-answers/-35')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Check your answers')
      }))
})
