const request = require('supertest')
const appSetup = require('./testutils/appSetup')
const createRouter = require('./incidents')
const { authenticationMiddleware } = require('./testutils/mockAuthentication')

const formService = {
  getIncidentsForUser: () => [{ id: 1, booking_id: 2, start_date: '12/12/2018', user_id: 'ITAG_USER' }],
}

const offenderService = {
  getOffenderNames: () => [],
}
const route = createRouter({ authenticationMiddleware, formService, offenderService })

let app

beforeEach(() => {
  app = appSetup(route)
})

describe('GET /', () => {
  it('should redirect to /incidents', () =>
    request(app)
      .get('/')
      .expect(302)
      .expect('Location', '/incidents'))
})

describe('GET /incidents', () => {
  it('should render page', () =>
    request(app)
      .get('/incidents/')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Use of force incidents')
      }))
})

describe('GET /incidents/:incidentId/statement', () => {
  it('should render page', () =>
    request(app)
      .get('/incidents/-1/statement')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Use of force statement')
      }))
})

describe('POST /incidents/:incidentId/statement', () => {
  it('should render page', () =>
    request(app)
      .post('/incidents/-1/statement')
      .expect(302)
      .expect('Location', '/incidents/-1/statement/submitted'))
})

describe('GET /incidents/:incidentId/statement', () => {
  it('should render page', () =>
    request(app)
      .get('/incidents/-1/statement/submitted')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Statement submitted')
      }))
})