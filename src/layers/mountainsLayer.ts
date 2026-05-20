import { bearingTo, distanceKm, absAngularDiff, formatDistance } from '../utils/geo'
import type { WorldLayer, LayerItem } from './types'

const MOUNTAINS = [
  { id: 'everest',      name: 'Mount Everest',    range: 'Himalayas',        lat: 27.99,  lon: 86.93,  elevM: 8849 },
  { id: 'k2',           name: 'K2',               range: 'Karakoram',        lat: 35.88,  lon: 76.51,  elevM: 8611 },
  { id: 'kangchenjunga',name: 'Kangchenjunga',    range: 'Himalayas',        lat: 27.70,  lon: 88.15,  elevM: 8586 },
  { id: 'lhotse',       name: 'Lhotse',           range: 'Himalayas',        lat: 27.96,  lon: 86.93,  elevM: 8516 },
  { id: 'montblanc',    name: 'Mont Blanc',       range: 'Alps',             lat: 45.83,  lon: 6.86,   elevM: 4808 },
  { id: 'matterhorn',   name: 'Matterhorn',       range: 'Alps',             lat: 45.98,  lon: 7.66,   elevM: 4478 },
  { id: 'eiger',        name: 'Eiger',            range: 'Alps',             lat: 46.58,  lon: 8.00,   elevM: 3967 },
  { id: 'elbrus',       name: 'Mount Elbrus',     range: 'Caucasus',         lat: 43.35,  lon: 42.44,  elevM: 5642 },
  { id: 'kilimanjaro',  name: 'Kilimanjaro',      range: 'East Africa',      lat: -3.07,  lon: 37.35,  elevM: 5895 },
  { id: 'kenyamount',   name: 'Mount Kenya',      range: 'East Africa',      lat: -0.15,  lon: 37.31,  elevM: 5199 },
  { id: 'denali',       name: 'Denali',           range: 'Alaska Range',     lat: 63.07,  lon: -151.0, elevM: 6190 },
  { id: 'aconcagua',    name: 'Aconcagua',        range: 'Andes',            lat: -32.65, lon: -70.01, elevM: 6961 },
  { id: 'fuji',         name: 'Mount Fuji',       range: 'Fuji Volcanic',    lat: 35.36,  lon: 138.73, elevM: 3776 },
  { id: 'vesuvius',     name: 'Vesuvius',         range: 'Campania',         lat: 40.82,  lon: 14.43,  elevM: 1281 },
  { id: 'etna',         name: 'Mount Etna',       range: 'Sicily',           lat: 37.73,  lon: 15.00,  elevM: 3329 },
  { id: 'olympus',      name: 'Mount Olympus',    range: 'Greek Mountains',  lat: 40.09,  lon: 22.35,  elevM: 2918 },
  { id: 'ararat',       name: 'Mount Ararat',     range: 'Eastern Anatolia', lat: 39.70,  lon: 44.30,  elevM: 5137 },
  { id: 'blanc_domed',  name: 'Grossglockner',    range: 'Alps',             lat: 47.07,  lon: 12.69,  elevM: 3798 },
  { id: 'whitney',      name: 'Mount Whitney',    range: 'Sierra Nevada',    lat: 36.58,  lon: -118.3, elevM: 4421 },
  { id: 'logan',        name: 'Mount Logan',      range: 'Saint Elias',      lat: 60.57,  lon: -140.4, elevM: 5959 },
  { id: 'cook',         name: 'Aoraki / Mt Cook', range: 'Southern Alps NZ', lat: -43.59, lon: 170.14, elevM: 3724 },
  { id: 'kosciuszko',   name: 'Mount Kosciuszko', range: 'Snowy Mountains',  lat: -36.45, lon: 148.26, elevM: 2228 },
  { id: 'blanc_tatry',  name: 'Gerlachovský štít',range: 'Carpathians',      lat: 49.17,  lon: 20.13,  elevM: 2655 },
  { id: 'snowdon',      name: 'Snowdon',          range: 'Welsh Mountains',  lat: 53.07,  lon: -4.08,  elevM: 1085 },
  { id: 'ben_nevis',    name: 'Ben Nevis',        range: 'Grampians',        lat: 56.80,  lon: -5.00,  elevM: 1345 },
]

export const mountainsLayer: WorldLayer = {
  id: 'mountains',
  name: 'Mountains',
  icon: '⛰',
  color: 'text-amber-400',
  borderColor: 'border-amber-900/50',

  getItems(userLat, userLon, heading, threshold) {
    return MOUNTAINS
      .map(m => ({
        bearing: bearingTo(userLat, userLon, m.lat, m.lon),
        dist: distanceKm(userLat, userLon, m.lat, m.lon),
        m,
      }))
      .filter(r => r.dist > 5 && absAngularDiff(heading, r.bearing) <= threshold)
      .sort((a, b) => absAngularDiff(heading, a.bearing) - absAngularDiff(heading, b.bearing))
      .slice(0, 6)
      .map(r => ({
        id: r.m.id,
        name: r.m.name,
        subtitle: r.m.range,
        detail: formatDistance(r.dist),
        distKm: r.dist,
        bearing: r.bearing,
        meta: { elev: `${(r.m.elevM / 1000).toFixed(2)} km high` },
      } satisfies LayerItem))
  },
}
