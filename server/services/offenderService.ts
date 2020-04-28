import logger from '../../log'
import { isNilOrEmpty, properCaseName } from '../utils/utils'
import { AgencyId, OffenderService, PrisonerDetail, PrisonLocation } from '../types/uof'

export default function createOffenderService(elite2ClientBuilder): OffenderService {
  const getOffenderDetails = async (token, bookingId): Promise<object> => {
    try {
      const elite2Client = elite2ClientBuilder(token)
      const result = await elite2Client.getOffenderDetails(bookingId)

      if (isNilOrEmpty(result)) {
        logger.warn(`No details found for bookingId=${bookingId}`)
        return []
      }

      const displayName = `${properCaseName(result.firstName)} ${properCaseName(result.lastName)}`
      const { dateOfBirth } = result

      return {
        displayName,
        ...result,
        dateOfBirth,
      }
    } catch (error) {
      logger.error(error, 'Error during getOffenderDetails')
      throw error
    }
  }

  const getPrisonersDetails = async (token: string, offenderNumbers: string[]): Promise<Array<PrisonerDetail>> => {
    try {
      const elite2Client = elite2ClientBuilder(token)
      const result = await elite2Client.getPrisoners(offenderNumbers)

      if (isNilOrEmpty(result)) {
        logger.warn(`No details found for offenderNumbers ${offenderNumbers}`)
        return []
      }
      return result
    } catch (error) {
      logger.error(error, 'Error during getPrisonersDetails')
      throw error
    }
  }

  const getOffenderImage = (token, bookingId): Promise<ReadableStream> => {
    const elite2Client = elite2ClientBuilder(token)
    return elite2Client.getOffenderImage(bookingId)
  }

  const fullName = ({ firstName, lastName }): string => `${properCaseName(lastName)}, ${properCaseName(firstName)}`

  const getOffenderNames = async (token, offenderNos): Promise<{ [offenderNo: string]: string }> => {
    if (offenderNos.length === 0) {
      return {}
    }
    const uniqueNos = [...new Set(offenderNos)]
    const offenders = await elite2ClientBuilder(token).getOffenders(uniqueNos)

    return offenders.reduce((rv, offender) => ({ ...rv, [offender.offenderNo]: fullName(offender) }), {})
  }

  const getLocation = (token: string, locationId: string): Promise<PrisonLocation> => {
    if (!locationId) {
      return Promise.resolve({})
    }
    const elite2Client = elite2ClientBuilder(token)
    return elite2Client.getLocation(locationId)
  }

  const getIncidentLocations = async (token: string, agencyId: AgencyId): Promise<PrisonLocation[]> => {
    try {
      const elite2Client = elite2ClientBuilder(token)
      const incidentLocations = await elite2Client.getLocations(agencyId)

      const prisonersCell = incidentLocations.find(
        location => location.userDescription.toUpperCase() === "PRISONER'S CELL"
      )
      const otherCell = incidentLocations.find(location => location.userDescription.toUpperCase() === 'OTHER CELL')

      const remainingLocations = incidentLocations
        .filter(
          location =>
            location.userDescription.toUpperCase() !== 'OTHER CELL' &&
            location.userDescription.toUpperCase() !== "PRISONER'S CELL"
        )
        .sort((a, b) => a.userDescription.localeCompare(b.userDescription, 'en', { ignorePunctuation: true }))

      return [...(prisonersCell ? [prisonersCell] : []), ...(otherCell ? [otherCell] : []), ...remainingLocations]
    } catch (error) {
      logger.error(error, 'Error during getIncidentLocations')
      throw error
    }
  }

  return {
    getOffenderDetails,
    getPrisonersDetails,
    getOffenderImage,
    getOffenderNames,
    getLocation,
    getIncidentLocations,
  }
}