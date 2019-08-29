const serviceCreator = require('./statementService')
const { StatementStatus } = require('../config/types')

const incidentClient = {
  getCurrentDraft: jest.fn(),
  getStatementsForUser: jest.fn(),
  getStatement: jest.fn(),
  saveStatement: jest.fn(),
  submitStatement: jest.fn(),
  getAdditionalComments: jest.fn(),
}

let service

beforeEach(() => {
  service = serviceCreator({ incidentClient })
  incidentClient.getCurrentDraft.mockReturnValue({ a: 'b' })
  incidentClient.getStatementsForUser.mockReturnValue({ rows: [{ id: 1 }, { id: 2 }] })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('getStatementsForUser', () => {
  test('retrieve  details', async () => {
    const output = await service.getStatementsForUser('user1', StatementStatus.PENDING)

    expect(output).toEqual([{ id: 1 }, { id: 2 }])

    expect(incidentClient.getStatementsForUser).toBeCalledTimes(1)
    expect(incidentClient.getStatementsForUser).toBeCalledWith('user1', StatementStatus.PENDING)
  })
})

describe('getStatement', () => {
  test('retrieve details when user is involved', async () => {
    const statement = { id: 1, user_id: 'BOB' }
    const comment = 'Some additional text'
    incidentClient.getStatement.mockReturnValue(statement)
    incidentClient.getAdditionalComments.mockReturnValue([
      {
        id: 1,
        statement_id: 1,
        additional_comment: comment,
        data_submitted: '2019-03-05 01:03:28',
      },
    ])

    const output = await service.getStatement('BOB', 1, StatementStatus.PENDING)

    expect(output).toEqual({
      ...statement,
      additionalComments: [
        {
          id: 1,
          statement_id: 1,
          additional_comment: comment,
          data_submitted: '2019-03-05 01:03:28',
        },
      ],
    })

    expect(incidentClient.getStatement).toBeCalledWith('BOB', 1, StatementStatus.PENDING)
  })

  test('retrieve details when statement is not present', async () => {
    incidentClient.getStatement.mockReturnValue(undefined)

    await expect(service.getStatement('BOB', 1, 'PENDING')).rejects.toThrow(new Error("Report: '1' does not exist"))

    expect(incidentClient.getStatement).toBeCalledWith('BOB', 1, 'PENDING')
  })
})

test('should call save', async () => {
  const statement = {}

  await service.save('user1', 'incident-1', statement)

  expect(incidentClient.saveStatement).toBeCalledTimes(1)
  expect(incidentClient.saveStatement).toBeCalledWith('user1', 'incident-1', statement)
})

test('should call submitStatement', async () => {
  await service.submitStatement('user1', 'incident-1')

  expect(incidentClient.submitStatement).toBeCalledTimes(1)
  expect(incidentClient.submitStatement).toBeCalledWith('user1', 'incident-1')
})

describe('validateSavedStatement', () => {
  test('valid statement', async () => {
    incidentClient.getStatement.mockReturnValue({
      lastTrainingMonth: 1,
      lastTrainingYear: 2000,
      jobStartYear: 1998,
      statement: 'A statement',
    })

    const errors = await service.validateSavedStatement('user-1', 1)
    expect(errors).toEqual([])
  })

  test('can cope with additional attributes', async () => {
    incidentClient.getStatement.mockReturnValue({
      lastTrainingMonth: 1,
      lastTrainingYear: 2000,
      jobStartYear: 1998,
      statement: 'A statement',
      id: 1223,
      bookingId: 'bookingId',
    })

    const errors = await service.validateSavedStatement('user-1', 1)
    expect(errors).toEqual([])
  })

  test('invalid statement', async () => {
    incidentClient.getStatement.mockReturnValue({})

    const errors = await service.validateSavedStatement('user-1', 1)
    expect(errors.map(error => error.href)).toEqual([
      '#lastTrainingMonth',
      '#lastTrainingYear',
      '#jobStartYear',
      '#statement',
    ])
  })
})
