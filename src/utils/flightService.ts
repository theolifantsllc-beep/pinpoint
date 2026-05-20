export interface Aircraft {
  id: string
  callsign: string
  airline: string
  flightNumber: string
  origin: string
  originCode: string
  destination: string
  destinationCode: string
  lat: number
  lon: number
  altitudeM: number
  speedKmh: number
  heading: number
  aircraftType: string
  lastUpdated: number // ms timestamp
}

// ─── Mock dataset ────────────────────────────────────────────────────────────
// Positions are roughly plausible for active transatlantic / European / Asia routes

const MOCK_FLIGHTS: Omit<Aircraft, 'lastUpdated'>[] = [
  {
    id: 'DL401',
    callsign: 'DAL401',
    airline: 'Delta Air Lines',
    flightNumber: 'DL401',
    origin: 'New York',
    originCode: 'JFK',
    destination: 'Amsterdam',
    destinationCode: 'AMS',
    lat: 54.2, lon: -22.1,
    altitudeM: 11200, speedKmh: 890, heading: 52, aircraftType: 'Boeing 767',
  },
  {
    id: 'BA038',
    callsign: 'BAW038',
    airline: 'British Airways',
    flightNumber: 'BA038',
    origin: 'London',
    originCode: 'LHR',
    destination: 'Tokyo',
    destinationCode: 'HND',
    lat: 58.7, lon: 42.3,
    altitudeM: 12100, speedKmh: 910, heading: 38, aircraftType: 'Boeing 777',
  },
  {
    id: 'KL0642',
    callsign: 'KLM642',
    airline: 'KLM Royal Dutch Airlines',
    flightNumber: 'KL642',
    origin: 'Amsterdam',
    originCode: 'AMS',
    destination: 'New York',
    destinationCode: 'JFK',
    lat: 51.4, lon: -8.6,
    altitudeM: 10700, speedKmh: 870, heading: 285, aircraftType: 'Boeing 787',
  },
  {
    id: 'AF006',
    callsign: 'AFR006',
    airline: 'Air France',
    flightNumber: 'AF006',
    origin: 'Paris',
    originCode: 'CDG',
    destination: 'Dubai',
    destinationCode: 'DXB',
    lat: 42.1, lon: 18.4,
    altitudeM: 11600, speedKmh: 900, heading: 117, aircraftType: 'Airbus A380',
  },
  {
    id: 'LH400',
    callsign: 'DLH400',
    airline: 'Lufthansa',
    flightNumber: 'LH400',
    origin: 'Frankfurt',
    originCode: 'FRA',
    destination: 'New York',
    destinationCode: 'JFK',
    lat: 52.8, lon: -2.1,
    altitudeM: 11000, speedKmh: 885, heading: 282, aircraftType: 'Airbus A340',
  },
  {
    id: 'EK074',
    callsign: 'UAE074',
    airline: 'Emirates',
    flightNumber: 'EK074',
    origin: 'Dubai',
    originCode: 'DXB',
    destination: 'Los Angeles',
    destinationCode: 'LAX',
    lat: 38.5, lon: 62.3,
    altitudeM: 12500, speedKmh: 920, heading: 42, aircraftType: 'Airbus A380',
  },
  {
    id: 'TK001',
    callsign: 'THY001',
    airline: 'Turkish Airlines',
    flightNumber: 'TK1',
    origin: 'Istanbul',
    originCode: 'IST',
    destination: 'New York',
    destinationCode: 'JFK',
    lat: 46.2, lon: 14.8,
    altitudeM: 10900, speedKmh: 875, heading: 305, aircraftType: 'Boeing 777',
  },
  {
    id: 'SQ022',
    callsign: 'SIA022',
    airline: 'Singapore Airlines',
    flightNumber: 'SQ22',
    origin: 'Singapore',
    originCode: 'SIN',
    destination: 'London',
    destinationCode: 'LHR',
    lat: 29.4, lon: 68.2,
    altitudeM: 13100, speedKmh: 930, heading: 315, aircraftType: 'Airbus A350',
  },
  {
    id: 'QF002',
    callsign: 'QFA002',
    airline: 'Qantas',
    flightNumber: 'QF2',
    origin: 'Sydney',
    originCode: 'SYD',
    destination: 'London',
    destinationCode: 'LHR',
    lat: 13.6, lon: 76.4,
    altitudeM: 11800, speedKmh: 905, heading: 295, aircraftType: 'Boeing 787',
  },
  {
    id: 'UA901',
    callsign: 'UAL901',
    airline: 'United Airlines',
    flightNumber: 'UA901',
    origin: 'San Francisco',
    originCode: 'SFO',
    destination: 'Frankfurt',
    destinationCode: 'FRA',
    lat: 60.3, lon: -18.7,
    altitudeM: 11400, speedKmh: 895, heading: 74, aircraftType: 'Boeing 787',
  },
  {
    id: 'AA100',
    callsign: 'AAL100',
    airline: 'American Airlines',
    flightNumber: 'AA100',
    origin: 'New York',
    originCode: 'JFK',
    destination: 'London',
    destinationCode: 'LHR',
    lat: 51.8, lon: -28.4,
    altitudeM: 10600, speedKmh: 860, heading: 88, aircraftType: 'Boeing 777',
  },
  {
    id: 'AY006',
    callsign: 'FIN006',
    airline: 'Finnair',
    flightNumber: 'AY6',
    origin: 'Helsinki',
    originCode: 'HEL',
    destination: 'Tokyo',
    destinationCode: 'HND',
    lat: 65.1, lon: 92.4,
    altitudeM: 11900, speedKmh: 915, heading: 95, aircraftType: 'Airbus A350',
  },
  {
    id: 'OS066',
    callsign: 'AUA066',
    airline: 'Austrian Airlines',
    flightNumber: 'OS66',
    origin: 'Vienna',
    originCode: 'VIE',
    destination: 'Bangkok',
    destinationCode: 'BKK',
    lat: 37.2, lon: 44.7,
    altitudeM: 10800, speedKmh: 870, heading: 120, aircraftType: 'Boeing 777',
  },
  {
    id: 'IB3166',
    callsign: 'IBE3166',
    airline: 'Iberia',
    flightNumber: 'IB3166',
    origin: 'Madrid',
    originCode: 'MAD',
    destination: 'Buenos Aires',
    destinationCode: 'EZE',
    lat: 22.3, lon: -18.9,
    altitudeM: 12000, speedKmh: 880, heading: 210, aircraftType: 'Airbus A340',
  },
  {
    id: 'CA933',
    callsign: 'CCA933',
    airline: 'Air China',
    flightNumber: 'CA933',
    origin: 'Beijing',
    originCode: 'PEK',
    destination: 'Frankfurt',
    destinationCode: 'FRA',
    lat: 55.6, lon: 78.2,
    altitudeM: 11300, speedKmh: 900, heading: 295, aircraftType: 'Airbus A330',
  },
  {
    id: 'U22175',
    callsign: 'EZY2175',
    airline: 'easyJet',
    flightNumber: 'U22175',
    origin: 'Amsterdam',
    originCode: 'AMS',
    destination: 'Barcelona',
    destinationCode: 'BCN',
    lat: 46.8, lon: 3.2,
    altitudeM: 10100, speedKmh: 820, heading: 194, aircraftType: 'Airbus A319',
  },
  {
    id: 'FR1234',
    callsign: 'RYR1234',
    airline: 'Ryanair',
    flightNumber: 'FR1234',
    origin: 'Dublin',
    originCode: 'DUB',
    destination: 'Rome',
    destinationCode: 'FCO',
    lat: 47.6, lon: -1.3,
    altitudeM: 9800, speedKmh: 800, heading: 162, aircraftType: 'Boeing 737',
  },
  {
    id: 'ET508',
    callsign: 'ETH508',
    airline: 'Ethiopian Airlines',
    flightNumber: 'ET508',
    origin: 'Addis Ababa',
    originCode: 'ADD',
    destination: 'London',
    destinationCode: 'LHR',
    lat: 24.8, lon: 18.6,
    altitudeM: 11500, speedKmh: 895, heading: 330, aircraftType: 'Boeing 787',
  },
  {
    id: 'NH201',
    callsign: 'ANA201',
    airline: 'ANA',
    flightNumber: 'NH201',
    origin: 'Tokyo',
    originCode: 'HND',
    destination: 'London',
    destinationCode: 'LHR',
    lat: 58.4, lon: 148.7,
    altitudeM: 12200, speedKmh: 920, heading: 12, aircraftType: 'Boeing 787',
  },
  {
    id: 'KE907',
    callsign: 'KAL907',
    airline: 'Korean Air',
    flightNumber: 'KE907',
    origin: 'Seoul',
    originCode: 'ICN',
    destination: 'Amsterdam',
    destinationCode: 'AMS',
    lat: 61.2, lon: 112.4,
    altitudeM: 11700, speedKmh: 910, heading: 318, aircraftType: 'Boeing 777',
  },
]

// ─── Abstract data source interface ───────────────────────────────────────────
// Swap this implementation for a live API later

export type DataSource = 'mock' | 'opensky' | 'aviationstack'

interface FlightServiceConfig {
  source: DataSource
  apiKey?: string
}

let config: FlightServiceConfig = { source: 'mock' }

export function configureFlightService(cfg: FlightServiceConfig) {
  config = cfg
}

/** Slightly randomise mock positions to simulate movement */
let _lastTick = Date.now()
let _mockPositions: Map<string, { lat: number; lon: number }> = new Map()

function advanceMockFlights() {
  const now = Date.now()
  const dt = (now - _lastTick) / 1000 / 3600 // hours elapsed
  _lastTick = now

  MOCK_FLIGHTS.forEach(f => {
    const prev = _mockPositions.get(f.id) ?? { lat: f.lat, lon: f.lon }
    const distKm = f.speedKmh * dt
    const dLat = (distKm / 111) * Math.cos((f.heading * Math.PI) / 180)
    const dLon = (distKm / (111 * Math.cos((prev.lat * Math.PI) / 180))) * Math.sin((f.heading * Math.PI) / 180)
    _mockPositions.set(f.id, { lat: prev.lat + dLat, lon: prev.lon + dLon })
  })
}

async function fetchMock(_userLat: number, _userLon: number): Promise<Aircraft[]> {
  advanceMockFlights()
  return MOCK_FLIGHTS.map(f => {
    const pos = _mockPositions.get(f.id) ?? { lat: f.lat, lon: f.lon }
    return { ...f, lat: pos.lat, lon: pos.lon, lastUpdated: Date.now() }
  })
}

// OpenSky Network (free, no API key needed for anonymous access)
async function fetchOpenSky(userLat: number, userLon: number): Promise<Aircraft[]> {
  const range = 8 // degrees
  const url = `https://opensky-network.org/api/states/all?lamin=${userLat - range}&lomin=${userLon - range}&lamax=${userLat + range}&lomax=${userLon + range}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('OpenSky error')
  const data = await res.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.states ?? []).filter((s: any) => s[5] && s[6]).map((s: any) => ({
    id: s[0],
    callsign: (s[1] ?? '').trim(),
    airline: '',
    flightNumber: (s[1] ?? '').trim(),
    origin: s[2] ?? 'Unknown',
    originCode: '',
    destination: 'Unknown',
    destinationCode: '',
    lat: s[6],
    lon: s[5],
    altitudeM: s[7] ?? 0,
    speedKmh: (s[9] ?? 0) * 3.6,
    heading: s[10] ?? 0,
    aircraftType: 'Aircraft',
    lastUpdated: Date.now(),
  }))
}

export async function getNearbyFlights(userLat: number, userLon: number): Promise<Aircraft[]> {
  try {
    if (config.source === 'opensky') return await fetchOpenSky(userLat, userLon)
    return await fetchMock(userLat, userLon)
  } catch {
    return fetchMock(userLat, userLon)
  }
}

export function getDataSourceLabel(source: DataSource): string {
  const labels: Record<DataSource, string> = {
    mock: 'DEMO DATA',
    opensky: 'OpenSky Live',
    aviationstack: 'Aviationstack Live',
  }
  return labels[source] ?? 'Unknown'
}
