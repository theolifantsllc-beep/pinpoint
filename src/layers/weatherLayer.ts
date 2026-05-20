import { bearingTo, distanceKm, absAngularDiff, formatDistance } from '../utils/geo'
import type { WorldLayer, LayerItem } from './types'

// Mock weather zones — major climate regions with representative conditions
const WEATHER_ZONES = [
  { id: 'arctic-svalbard',   name: 'Arctic Zone',          region: 'Svalbard',          lat: 78.22,  lon: 15.65,  temp: -18, cond: 'Blizzard',      wind: 65 },
  { id: 'siberia-yakutsk',   name: 'Siberian Deep Freeze',  region: 'Yakutsk',           lat: 62.03,  lon: 129.73, temp: -42, cond: 'Clear',          wind: 8 },
  { id: 'sahara-algeria',    name: 'Saharan Heat',          region: 'Central Sahara',    lat: 23.0,   lon: 5.0,    temp: 48,  cond: 'Sandstorm',     wind: 55 },
  { id: 'amazon-manaus',     name: 'Amazon Rainforest',     region: 'Manaus, Brazil',    lat: -3.10,  lon: -60.03, temp: 32,  cond: 'Thunderstorm',  wind: 20 },
  { id: 'antarctic-ross',    name: 'Antarctic Polar',       region: 'Ross Ice Shelf',    lat: -80.0,  lon: 0.0,    temp: -55, cond: 'Whiteout',      wind: 90 },
  { id: 'pacific-typhoon',   name: 'Typhoon Alley',         region: 'W. Pacific',        lat: 15.0,   lon: 130.0,  temp: 29,  cond: 'Typhoon',       wind: 180 },
  { id: 'atlantic-hurricane',name: 'Hurricane Belt',        region: 'Caribbean',         lat: 16.0,   lon: -64.0,  temp: 30,  cond: 'Tropical Storm',wind: 120 },
  { id: 'monsoon-mumbai',    name: 'Monsoon Belt',          region: 'Mumbai',            lat: 19.08,  lon: 72.88,  temp: 27,  cond: 'Heavy Rain',    wind: 40 },
  { id: 'mediterranean',     name: 'Mediterranean Sun',     region: 'Malta',             lat: 35.90,  lon: 14.51,  temp: 28,  cond: 'Sunny',         wind: 12 },
  { id: 'iceland-volcanic',  name: 'Volcanic Activity',     region: 'Reykjavik',         lat: 64.13,  lon: -21.82, temp: 4,   cond: 'Ash Cloud',     wind: 35 },
  { id: 'patagonia-wind',    name: 'Roaring Forties',       region: 'Patagonia',         lat: -51.0,  lon: -68.0,  temp: 6,   cond: 'Gale Force',    wind: 110 },
  { id: 'atacama-dry',       name: 'Atacama Desert',        region: 'N. Chile',          lat: -24.5,  lon: -69.3,  temp: 20,  cond: 'Bone Dry',      wind: 15 },
  { id: 'monsoon-bangladesh',name: 'Bengal Monsoon',        region: 'Dhaka',             lat: 23.81,  lon: 90.41,  temp: 33,  cond: 'Flooding Rain', wind: 50 },
  { id: 'tornado-oklahoma',  name: 'Tornado Alley',         region: 'Oklahoma',          lat: 35.5,   lon: -97.5,  temp: 22,  cond: 'Tornado Risk',  wind: 95 },
  { id: 'fog-london',        name: 'North Sea Fog',         region: 'London',            lat: 51.51,  lon: -0.13,  temp: 10,  cond: 'Dense Fog',     wind: 18 },
  { id: 'aurora-alaska',     name: 'Aurora Zone',           region: 'Fairbanks, Alaska', lat: 64.84,  lon: -147.72,temp: -28, cond: 'Aurora Borealis',wind: 5 },
  { id: 'harmattan-niger',   name: 'Harmattan Wind',        region: 'Sahel',             lat: 13.51,  lon: 2.12,   temp: 38,  cond: 'Dust Haze',     wind: 45 },
  { id: 'tropical-borneo',   name: 'Equatorial Heat',       region: 'Borneo',            lat: 1.30,   lon: 114.0,  temp: 34,  cond: 'Humid Haze',    wind: 10 },
]

function condIcon(cond: string): string {
  if (cond.includes('Snow') || cond.includes('Blizzard') || cond.includes('Whiteout') || cond.includes('Freeze')) return '❄'
  if (cond.includes('Thunder') || cond.includes('Storm') || cond.includes('Typhoon') || cond.includes('Hurricane') || cond.includes('Tornado')) return '⛈'
  if (cond.includes('Rain') || cond.includes('Monsoon') || cond.includes('Flood')) return '🌧'
  if (cond.includes('Fog')) return '🌫'
  if (cond.includes('Sand') || cond.includes('Dust') || cond.includes('Haze') || cond.includes('Ash')) return '🌪'
  if (cond.includes('Sun') || cond.includes('Clear') || cond.includes('Dry')) return '☀'
  if (cond.includes('Aurora')) return '✨'
  if (cond.includes('Gale') || cond.includes('Wind')) return '💨'
  return '🌡'
}

export const weatherLayer: WorldLayer = {
  id: 'weather',
  name: 'Weather',
  icon: '🌤',
  color: 'text-cyan-400',
  borderColor: 'border-cyan-900/50',

  getItems(userLat, userLon, heading, threshold) {
    return WEATHER_ZONES
      .map(w => ({
        bearing: bearingTo(userLat, userLon, w.lat, w.lon),
        dist: distanceKm(userLat, userLon, w.lat, w.lon),
        w,
      }))
      .filter(r => r.dist > 50 && absAngularDiff(heading, r.bearing) <= threshold)
      .sort((a, b) => absAngularDiff(heading, a.bearing) - absAngularDiff(heading, b.bearing))
      .slice(0, 4)
      .map(r => ({
        id: r.w.id,
        name: r.w.name,
        subtitle: r.w.region,
        detail: formatDistance(r.dist),
        distKm: r.dist,
        bearing: r.bearing,
        tags: [`${condIcon(r.w.cond)} ${r.w.cond}`],
        meta: {
          temp: `${r.w.temp > 0 ? '+' : ''}${r.w.temp}°C`,
          wind: `${r.w.wind} km/h`,
        },
      } satisfies LayerItem))
  },
}
