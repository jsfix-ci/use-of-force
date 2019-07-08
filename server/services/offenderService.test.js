const serviceCreator = require('./offenderService')

const token = 'token-1'

const elite2Client = {
  getOffenderDetails: jest.fn(),
  getLocations: jest.fn(),
}

const elite2ClientBuilder = jest.fn()

let service

beforeEach(() => {
  elite2ClientBuilder.mockReturnValue(elite2Client)
  service = serviceCreator(elite2ClientBuilder)
})

afterEach(() => {
  elite2Client.getOffenderDetails.mockReset()
})

describe('getOffenderDetails', () => {
  it('should format display name', async () => {
    const details = { firstName: 'SAM', lastName: 'SMITH' }
    elite2Client.getOffenderDetails.mockReturnValue(details)
    elite2Client.getLocations.mockReturnValue([
      { locationType: 'BOX', userDescription: 'Box 1' },
      { locationType: 'WING', userDescription: 'Wing A' },
      { locationType: 'WING', userDescription: '' },
      { locationType: 'CELL', userDescription: 'Cell A' },
    ])

    const result = await service.getOffenderDetails(token, -5)

    expect(result).toEqual({
      ...details,
      displayName: 'Sam Smith',
      locations: [{ locationType: 'WING', userDescription: 'Wing A' }],
    })
  })

  it('should use the user token', async () => {
    const details = { firstName: 'SAM', lastName: 'SMITH' }
    elite2Client.getOffenderDetails.mockReturnValue(details)
    elite2Client.getLocations.mockReturnValue([])
    await service.getOffenderDetails(token, -5)

    expect(elite2ClientBuilder).toBeCalledWith(token)
  })
})
