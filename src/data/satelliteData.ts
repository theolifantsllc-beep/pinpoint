export type SatelliteType = 'ISS' | 'Starlink' | 'GPS' | 'Weather' | 'Science' | 'Communication'

export interface SatelliteEntry {
  id: string
  name: string
  type: SatelliteType
  lat: number         // initial ground track latitude
  lon: number         // initial ground track longitude
  altitudeKm: number
  speedKmh: number
  orbitHeading: number // degrees — direction satellite is moving
  inclination: number  // orbital inclination (deg)
  periodMin: number    // orbital period in minutes
  magnitude: number    // visual magnitude (lower = brighter, < 2 naked eye)
  description: string
}

export const MOCK_SATELLITES: SatelliteEntry[] = [
  {
    id: 'iss',
    name: 'ISS',
    type: 'ISS',
    lat: 51.5, lon: 12.3,
    altitudeKm: 408, speedKmh: 27600, orbitHeading: 51, inclination: 51.6,
    periodMin: 92, magnitude: -3.0,
    description: 'International Space Station — 6 crew, 109m wide, visible to naked eye',
  },
  {
    id: 'starlink-3021',
    name: 'Starlink-3021',
    type: 'Starlink',
    lat: 45.2, lon: -20.1,
    altitudeKm: 550, speedKmh: 27000, orbitHeading: 53, inclination: 53.0,
    periodMin: 95, magnitude: 3.5,
    description: 'SpaceX Starlink broadband constellation satellite',
  },
  {
    id: 'starlink-4488',
    name: 'Starlink-4488',
    type: 'Starlink',
    lat: 38.6, lon: 45.7,
    altitudeKm: 550, speedKmh: 27000, orbitHeading: 128, inclination: 53.0,
    periodMin: 95, magnitude: 3.8,
    description: 'SpaceX Starlink broadband constellation satellite',
  },
  {
    id: 'starlink-5901',
    name: 'Starlink-5901',
    type: 'Starlink',
    lat: 22.1, lon: 68.4,
    altitudeKm: 550, speedKmh: 27000, orbitHeading: 230, inclination: 53.0,
    periodMin: 95, magnitude: 4.0,
    description: 'SpaceX Starlink broadband constellation satellite',
  },
  {
    id: 'gps-biir2',
    name: 'GPS BIIR-2',
    type: 'GPS',
    lat: 55.3, lon: -30.2,
    altitudeKm: 20200, speedKmh: 14000, orbitHeading: 0, inclination: 55.0,
    periodMin: 718, magnitude: 7.0,
    description: 'GPS navigation satellite — 20,200 km altitude, MEO orbit',
  },
  {
    id: 'gps-biir5',
    name: 'GPS BIIR-5',
    type: 'GPS',
    lat: 10.5, lon: 80.1,
    altitudeKm: 20200, speedKmh: 14000, orbitHeading: 0, inclination: 55.0,
    periodMin: 718, magnitude: 7.0,
    description: 'GPS navigation satellite — 20,200 km altitude, MEO orbit',
  },
  {
    id: 'noaa19',
    name: 'NOAA-19',
    type: 'Weather',
    lat: 72.1, lon: 5.6,
    altitudeKm: 870, speedKmh: 26600, orbitHeading: 359, inclination: 98.7,
    periodMin: 102, magnitude: 4.5,
    description: 'NOAA weather satellite — polar orbit, global weather imagery',
  },
  {
    id: 'metop-c',
    name: 'MetOp-C',
    type: 'Weather',
    lat: -65.0, lon: 22.3,
    altitudeKm: 817, speedKmh: 26800, orbitHeading: 180, inclination: 98.7,
    periodMin: 101, magnitude: 5.0,
    description: 'European weather satellite — polar sun-synchronous orbit',
  },
  {
    id: 'sentinel2a',
    name: 'Sentinel-2A',
    type: 'Science',
    lat: 43.2, lon: -5.8,
    altitudeKm: 786, speedKmh: 26900, orbitHeading: 350, inclination: 98.6,
    periodMin: 100, magnitude: 5.5,
    description: 'ESA Earth observation — 10m resolution multispectral imaging',
  },
  {
    id: 'hubble',
    name: 'Hubble Space Telescope',
    type: 'Science',
    lat: 28.4, lon: -15.9,
    altitudeKm: 537, speedKmh: 27300, orbitHeading: 28, inclination: 28.5,
    periodMin: 95, magnitude: 2.5,
    description: 'NASA/ESA space telescope — in orbit since 1990, still active',
  },
  {
    id: 'intelsat36',
    name: 'Intelsat 36',
    type: 'Communication',
    lat: 0.0, lon: 68.5,
    altitudeKm: 35786, speedKmh: 11000, orbitHeading: 90, inclination: 0.0,
    periodMin: 1436, magnitude: 8.0,
    description: 'Geostationary communications satellite — appears fixed in sky',
  },
  {
    id: 'goes16',
    name: 'GOES-16',
    type: 'Weather',
    lat: 0.0, lon: -75.2,
    altitudeKm: 35786, speedKmh: 11000, orbitHeading: 90, inclination: 0.1,
    periodMin: 1436, magnitude: 7.5,
    description: 'NOAA geostationary weather satellite — covers Americas',
  },
]

// Advance satellite ground track position based on elapsed time
// Returns updated lat/lon for a given satellite at `nowMs`
export function getSatellitePosition(sat: SatelliteEntry, nowMs: number): { lat: number; lon: number } {
  // Earth rotates 360° in 24h = 0.25°/min
  // Satellite moves along its orbit: 360° / periodMin degrees per minute
  const elapsedMin = (nowMs / 1000) / 60

  // Ground track speed in degrees per minute (approximate)
  const degsPerMin = 360 / sat.periodMin

  // For demo: advance position along orbit heading direction
  const distDeg = degsPerMin * elapsedMin

  // Simple lat/lon offset along orbit heading
  const rad = (sat.orbitHeading * Math.PI) / 180
  const dlat = (distDeg * Math.cos(rad)) / 6
  const dlon = (distDeg * Math.sin(rad)) / (6 * Math.cos((sat.lat * Math.PI) / 180) || 1)

  let lat = ((sat.lat + dlat) % 180 + 180) % 180 - 90
  // keep lat in -inclination..+inclination range via simple modulo
  const lon = ((sat.lon + dlon) % 360 + 360) % 360 - 180

  // Clamp lat to inclination bounds
  if (Math.abs(lat) > sat.inclination) {
    lat = sat.inclination * Math.sign(lat)
  }

  return { lat, lon }
}
