import { bearingTo, distanceKm, absAngularDiff, formatDistance } from '../utils/geo'
import type { WorldLayer, LayerItem } from './types'

const HISTORY_ROUTES = [
  { id: 'silk-road-xian',     name: 'Silk Road — Xi\'an',         era: 'Ancient Trade Routes',   lat: 34.27,  lon: 108.93, desc: 'Eastern terminus of the great Silk Road' },
  { id: 'silk-road-samarkand',name: 'Silk Road — Samarkand',      era: 'Ancient Trade Routes',   lat: 39.65,  lon: 66.97,  desc: 'Jewel of the Silk Road, crossroads of civilizations' },
  { id: 'silk-road-istanbul', name: 'Constantinople',              era: 'Ancient Trade Routes',   lat: 41.01,  lon: 28.98,  desc: 'Western gateway of the Silk Road' },
  { id: 'viking-oslo',        name: 'Viking Age — Oslo',           era: 'Viking Era (800–1100)',  lat: 59.91,  lon: 10.75,  desc: 'Departure point of Norse raiders and explorers' },
  { id: 'viking-reykjavik',   name: 'Viking Settlement — Iceland', era: 'Viking Era (800–1100)',  lat: 64.13,  lon: -21.82, desc: 'First European settlement in the North Atlantic' },
  { id: 'viking-newfoundland',name: 'L\'Anse aux Meadows',         era: 'Viking Era (800–1100)',  lat: 51.60,  lon: -55.52, desc: 'Where Vikings first set foot in America (c. 1000 AD)' },
  { id: 'spice-malacca',      name: 'Malacca Straits',             era: 'Spice Trade Routes',     lat: 2.19,   lon: 102.25, desc: 'Vital chokepoint of the ancient spice trade' },
  { id: 'spice-goa',          name: 'Portuguese Goa',              era: 'Spice Trade Routes',     lat: 15.50,  lon: 73.83,  desc: 'Portugal\'s jewel in the Indian spice trade' },
  { id: 'marco-polo-venice',  name: 'Marco Polo — Venice',         era: 'Exploration (1200s)',    lat: 45.44,  lon: 12.33,  desc: 'Home of Marco Polo, gateway to the East' },
  { id: 'columbus-palos',     name: 'Columbus Departure — Palos',  era: 'Age of Discovery',       lat: 37.23,  lon: -6.89,  desc: 'Columbus set sail from here in 1492' },
  { id: 'columbus-hispaniola',name: 'Columbus Landfall',           era: 'Age of Discovery',       lat: 18.97,  lon: -72.29, desc: 'First European landfall in the Americas (1492)' },
  { id: 'magellan-cebu',      name: 'Magellan — Cebu',             era: 'Age of Discovery',       lat: 10.32,  lon: 123.89, desc: 'Where Magellan\'s circumnavigation ended in battle' },
  { id: 'rome-via-appia',     name: 'Via Appia — Rome',            era: 'Roman Empire',           lat: 41.89,  lon: 12.51,  desc: 'Queen of Roads — the great Roman highway south' },
  { id: 'rome-carthage',      name: 'Carthage',                    era: 'Roman Empire',           lat: 36.86,  lon: 10.33,  desc: 'Rome\'s great rival, destroyed 146 BC' },
  { id: 'egypt-giza',         name: 'Pyramids of Giza',            era: 'Ancient Civilizations',  lat: 29.98,  lon: 31.13,  desc: 'Built ~2560 BC, still standing' },
  { id: 'mesopotamia-babylon',name: 'Babylon',                     era: 'Ancient Civilizations',  lat: 32.54,  lon: 44.42,  desc: 'Ancient capital of the world\'s first empire' },
  { id: 'inca-cusco',         name: 'Inca Empire — Cusco',         era: 'Pre-Columbian Americas', lat: -13.53, lon: -71.97, desc: 'The navel of the Inca world' },
  { id: 'inca-machu-picchu',  name: 'Machu Picchu',                era: 'Pre-Columbian Americas', lat: -13.16, lon: -72.54, desc: 'Lost city of the Incas, rediscovered 1911' },
  { id: 'aztec-tenochtitlan', name: 'Tenochtitlan (Mexico City)',   era: 'Pre-Columbian Americas', lat: 19.43,  lon: -99.13, desc: 'Aztec capital on a lake, now Mexico City' },
  { id: 'trans-sahara-timbuktu',name:'Timbuktu',                   era: 'Trans-Saharan Trade',    lat: 16.77,  lon: -3.01,  desc: 'Fabled city of gold at the edge of the Sahara' },
  { id: 'mongol-karakorum',   name: 'Karakorum',                   era: 'Mongol Empire',          lat: 47.20,  lon: 102.83, desc: 'Capital of the largest land empire in history' },
  { id: 'alexander-persepolis',name:'Persepolis',                  era: 'Alexander\'s Campaigns', lat: 29.93,  lon: 52.89,  desc: 'Ceremonial capital burned by Alexander (330 BC)' },
  { id: 'crusades-jerusalem', name: 'Jerusalem',                   era: 'Crusades (1096–1291)',   lat: 31.78,  lon: 35.22,  desc: 'Holy city fought over for centuries' },
  { id: 'slave-trade-goree',  name: 'Gorée Island',                era: 'Atlantic Slave Trade',   lat: 14.67,  lon: -17.40, desc: 'Departure point for millions of enslaved Africans' },
  { id: 'wwii-normandy',      name: 'D-Day — Normandy',            era: 'World War II',           lat: 49.37,  lon: -0.85,  desc: 'The largest seaborne invasion in history (June 6, 1944)' },
  { id: 'wwii-stalingrad',    name: 'Battle of Stalingrad',        era: 'World War II',           lat: 48.71,  lon: 44.52,  desc: 'Turning point of WWII on the Eastern Front' },
]

export const historyLayer: WorldLayer = {
  id: 'history',
  name: 'History',
  icon: '⚔',
  color: 'text-orange-400',
  borderColor: 'border-orange-900/50',

  getItems(userLat, userLon, heading, threshold) {
    return HISTORY_ROUTES
      .map(h => ({
        bearing: bearingTo(userLat, userLon, h.lat, h.lon),
        dist: distanceKm(userLat, userLon, h.lat, h.lon),
        h,
      }))
      .filter(r => r.dist > 10 && absAngularDiff(heading, r.bearing) <= threshold)
      .sort((a, b) => absAngularDiff(heading, a.bearing) - absAngularDiff(heading, b.bearing))
      .slice(0, 4)
      .map(r => ({
        id: r.h.id,
        name: r.h.name,
        subtitle: r.h.era,
        detail: formatDistance(r.dist),
        distKm: r.dist,
        bearing: r.bearing,
        meta: { note: r.h.desc },
      } satisfies LayerItem))
  },
}
