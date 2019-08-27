const serviceCreator = require('./involvedStaffService')

const userService = {
  getUsers: jest.fn(),
}

const incidentClient = {
  getInvolvedStaff: jest.fn(),
  deleteInvolvedStaff: jest.fn(),
  createStatements: jest.fn(),
}

let service

beforeEach(() => {
  service = serviceCreator({ incidentClient, userService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('get', () => {
  test('it should call query on db', async () => {
    await service.get('incident-1')
    expect(incidentClient.getInvolvedStaff).toBeCalledTimes(1)
  })
})

describe('lookup', () => {
  test('skips lookup if no users provided', async () => {
    const result = await service.lookup('token-1', [])

    expect(result).toEqual({
      additionalErrors: [],
      additionalFields: {
        involvedStaff: [],
      },
    })
    expect(userService.getUsers).not.toBeCalled()
  })

  test('fails when invalid / unavailable users', async () => {
    userService.getUsers.mockReturnValue({
      exist: [
        {
          i: 0,
          email: 'an@email.com',
          exists: true,
          name: 'Bob Smith',
          username: 'Bob',
          verified: true,
        },
      ],
      missing: [{ i: 1, exists: false, username: 'June', verified: false }],
      notVerified: [{ i: 2, exists: true, username: 'Jenny', verified: false }],
      success: false,
    })

    const result = await service.lookup('token-1', ['Bob', 'June', 'Jenny'])

    expect(result).toEqual({
      additionalFields: {},
      additionalErrors: [
        {
          href: '#involvedStaff[1][username]',
          text: "User with name 'June' does not have a new nomis account",
        },
        {
          href: '#involvedStaff[2][username]',
          text: "User with name 'Jenny' has not verified their email address",
        },
      ],
    })
  })

  test('fails with duplicate users', async () => {
    const result = await service.lookup('token-1', ['Bob', 'June', 'Bob', 'Jenny', 'Jenny'])

    expect(result).toEqual({
      additionalFields: {},
      additionalErrors: [
        {
          i: 2,
          href: '#involvedStaff[2][username]',
          text: "User with name 'Bob' has already been added",
        },
        {
          i: 4,
          href: '#involvedStaff[4][username]',
          text: "User with name 'Jenny' has already been added",
        },
      ],
    })
  })

  test('success', async () => {
    userService.getUsers.mockReturnValue({
      exist: [
        {
          staffId: 3,
          i: 2,
          email: 'an@email',
          exists: true,
          name: 'Bob Smith',
          username: 'Bob',
          verified: true,
        },
        { staffId: 1, i: 0, exists: true, email: 'bn@email', username: 'June', name: 'June Smith', verified: true },
        {
          staffId: 2,
          i: 1,
          exists: true,
          email: 'cn@email',
          username: 'Jenny',
          name: 'Jenny Walker',
          verified: true,
        },
      ],
      missing: [],
      notVerified: [],
      success: true,
    })

    const result = await service.lookup('token-1', ['Bob', 'June', 'Jenny'])

    expect(result).toEqual({
      additionalFields: {
        involvedStaff: [
          {
            staffId: 1,
            email: 'bn@email',
            username: 'June',
            name: 'June Smith',
          },
          {
            staffId: 2,
            email: 'cn@email',
            username: 'Jenny',
            name: 'Jenny Walker',
          },
          {
            staffId: 3,
            email: 'an@email',
            username: 'Bob',
            name: 'Bob Smith',
          },
        ],
      },
      additionalErrors: [],
    })
  })
})

describe('save', () => {
  test('when user has already added themselves', async () => {
    incidentClient.getInvolvedStaff.mockReturnValue([
      {
        staffId: 1,
        email: 'bn@email',
        username: 'June',
        name: 'June Smith',
      },
      {
        staffId: 2,
        email: 'cn@email',
        username: 'Jenny',
        name: 'Jenny Walker',
      },
      {
        staffId: 3,
        email: 'an@email',
        username: 'Bob',
        name: 'Bob Smith',
      },
    ])

    await service.save('form1', { name: 'Bob Smith', staffId: 3, username: 'Bob' })

    expect(incidentClient.createStatements).toBeCalledWith('form1', [
      { email: 'bn@email', name: 'June Smith', staffId: 1, userId: 'June' },
      {
        email: 'cn@email',
        name: 'Jenny Walker',
        staffId: 2,
        userId: 'Jenny',
      },
      {
        email: 'an@email',
        name: 'Bob Smith',
        staffId: 3,
        userId: 'Bob',
      },
    ])
  })

  test('when user is not already added', async () => {
    incidentClient.getInvolvedStaff.mockReturnValue([
      {
        staffId: 1,
        email: 'bn@email',
        username: 'June',
        name: 'June Smith',
      },
      {
        staffId: 2,
        email: 'cn@email',
        username: 'Jenny',
        name: 'Jenny Walker',
      },
    ])

    userService.getUsers.mockReturnValue({
      success: true,
      exist: [
        {
          staffId: 3,
          email: 'an@email',
          username: 'Bob',
          name: 'Bob Smith',
        },
      ],
    })

    await service.save('form1', { name: 'Bob Smith', staffId: 3, username: 'Bob' })

    expect(incidentClient.createStatements).toBeCalledWith('form1', [
      { email: 'bn@email', name: 'June Smith', staffId: 1, userId: 'June' },
      {
        email: 'cn@email',
        name: 'Jenny Walker',
        staffId: 2,
        userId: 'Jenny',
      },
      {
        email: 'an@email',
        name: 'Bob Smith',
        staffId: 3,
        userId: 'Bob',
      },
    ])
  })

  test('fail to find current user', async () => {
    incidentClient.getInvolvedStaff.mockReturnValue([
      {
        staffId: 1,
        email: 'bn@email',
        username: 'June',
        name: 'June Smith',
      },
      {
        staffId: 2,
        email: 'cn@email',
        username: 'Jenny',
        name: 'Jenny Walker',
      },
    ])

    userService.getUsers.mockReturnValue({
      success: false,
      exist: [],
      missing: [{}],
    })

    await expect(service.save('form1', { name: 'Bob Smith', staffId: 3, username: 'Bob' })).rejects.toThrow(
      `Could not retrieve user details for 'Bob', missing: 'true', not verified: 'false'`
    )
  })
})