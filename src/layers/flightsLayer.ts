import { bearingTo, distanceKm, absAngularDiff, formatDistance } from '../utils/geo'
import type { WorldLayer, LayerItem } from './types'

// Reuse mock flights inline so this layer is self-contained
const MOCK_FLIGHTS = [
  { id: 'DL401', callsign: 'DAL401', airline: 'Delta', dest: 'Amsterdam', lat: 54.2, lon: -22.1, altM: 11200, speedKmh: 890 },
  { id: 'BA038', callsign: 'BAW038', airline: 'British Airways', dest: 'Tokyo', lat: 58.7, lon: 42.3, altM: 12100, speedKmh: 910 },
  { id: 'KL0642', callsign: 'KLM642', airline: 'KLM', dest: 'New York', lat: 51.4, lon: -8.6, altM: 10700, speedKmh: 870 },
  { id: 'AF006', callsign: 'AFR006', airline: 'Air France', dest: 'Dubai', lat: 42.1, lon: 18.4, altM: 11600, speedKmh: 900 },
  { id: 'LH400', callsign: 'DLH400', airline: 'Lufthansa', dest: 'New York', lat: 52.8, lon: -2.1, altM: 11000, speedKmh: 885 },
  { id: 'EK074', callsign: 'UAE074', airline: 'Emirates', dest: 'Los Angeles', lat: 38.5, lon: 62.3, altM: 12500, speedKmh: 920 },
  { id: 'TK001', callsign: 'THY001', airline: 'Turkish Airlines', dest: 'New York', lat: 46.2, lon: 14.8, altM: 10900, speedKmh: 875 },
  { id: 'SQ022', callsign: 'SIA022', airline: 'Singapore Airlines', dest: 'London', lat: 29.4, lon: 68.2, altM: 13100, speedKmh: 930 },
  { id: 'QF002', callsign: 'QFA002', airline: 'Qantas', dest: 'London', lat: 13.6, lon: 76.4, altM: 11800, speedKmh: 905 },
  { id: 'UA901', callsign: 'UAL901', airline: 'United', dest: 'Frankfurt', lat: 60.3, lon: -18.7, altM: 11400, speedKmh: 895 },
  { id: 'AA100', callsign: 'AAL100', airline: 'American', dest: 'London', lat: 51.8, lon: -28.4, altM: 10600, speedKmh: 860 },
  { id: 'AY006', callsign: 'FIN006', airline: 'Finnair', dest: 'Tokyo', lat: 65.1, lon: 92.4, altM: 11900, speedKmh: 915 },
  { id: 'NH201', callsign: 'ANA201', airline: 'ANA', dest: 'London', lat: 58.4, lon: 148.7, altM: 12200, speedKmh: 920 },
  { id: 'KE907', callsign: 'KAL907', airline: 'Korean Air', dest: 'Amsterdam', lat: 61.2, lon: 112.4, altM: 11700, speedKmh: 910 },
]

export const flightsLayer: WorldLayer = {
  id: 'flights',
  name: 'Flights',
  icon: '✈',
  color: 'text-violet-400',
  borderColor: 'border-violet-900/50',

  getItems(userLat, userLon, heading, threshold) {
    return MOCK_FLIGHTS
      .map(f => ({
        bearing: bearingTo(userLat, userLon, f.lat, f.lon),
        dist: distanceKm(userLat, userLon, f.lat, f.lon),
        flight: f,
      }))
      .filter(r => absAngularDiff(heading, r.bearing) <= threshold)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5)
      .map(r => ({
        id: r.flight.id,
        name: `Flight to ${r.flight.dest}`,
        subtitle: `${r.flight.airline} · ${r.flight.callsign}`,
        detail: formatDistance(r.dist),
        distKm: r.dist,
        bearing: r.bearing,
        meta: {
          alt: `${Math.round(r.flight.altM / 1000 * 3.281)}k ft`,
          spd: `${r.flight.speedKmh} km/h`,
        },
      } satisfies LayerItem))
  },
}
