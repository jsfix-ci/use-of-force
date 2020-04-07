import { DescribedGroups } from '../incidentCountAggregator/aggregatorFunctions'

export const DEFAULT_GROUP = 'OTHER'

export const GROUPS: DescribedGroups = {
  BUDDHIST: { description: 'Buddhist', codes: ['BUDD'] },
  CHRISTIAN: {
    description: 'Christian',
    codes: [
      'ADV',
      'BAPT',
      'CALV',
      'CCOG',
      'CE',
      'CHRST',
      'CHSC',
      'CINW',
      'COFE',
      'COFI',
      'COFN',
      'COFS',
      'CONG',
      'COPT',
      'CSW',
      'EODX',
      'EORTH',
      'EPIS',
      'ETHO',
      'EVAN',
      'GOSP',
      'GROX',
      'JEHV',
      'METH',
      'MORM',
      'NONC',
      'OORTH',
      'PENT',
      'PRES',
      'PROT',
      'QUAK',
      'RC',
      'RUSS',
      'SALV',
      'SDAY',
      'UNIT',
      'UR',
      'WELS',
    ],
  },
  HINDU: { description: 'Hindu', codes: ['HARE', 'HIND'] },
  JEWISH: { description: 'Jewish', codes: ['JEW'] },
  MUSLIM: { description: 'Muslim', codes: ['BLAC', 'MOS', 'SHIA', 'SUNI'] },
  NONE: { description: 'No religion', codes: ['AGNO', 'ATHE', 'NIL', 'UNKN'] },
  [DEFAULT_GROUP]: { description: 'Not recognised / not recorded', codes: ['NONP', 'OTH'] },
  OTHER_RELIGIOUS: {
    description: 'Other',
    codes: [
      'APO',
      'BAHA',
      'DRU',
      'HUM',
      'JAIN',
      'LUTH',
      'PAG',
      'PARS',
      'RAST',
      'SATN',
      'SCIE',
      'SHIN',
      'SPIR',
      'TAO',
      'UNIF',
      'ZORO',
    ],
  },
  SIKH: { description: 'Sikh', codes: ['SIKH'] },
}
