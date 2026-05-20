import { CITIES } from './cities'

export interface SearchLocation {
  id: string
  name: string
  type: 'capital' | 'major_city' | 'landmark' | 'country' | 'continent'
  country: string
  lat: number
  lon: number
  population?: number
  aliases?: string[]
}

// Country centroids as searchable entries
const COUNTRIES: SearchLocation[] = [
  { id: 'c-usa', name: 'United States', type: 'country', country: 'USA', lat: 39.8, lon: -98.5, aliases: ['USA', 'America', 'US', 'United States of America'] },
  { id: 'c-uk', name: 'United Kingdom', type: 'country', country: 'UK', lat: 54.0, lon: -2.5, aliases: ['UK', 'Britain', 'England', 'Great Britain'] },
  { id: 'c-france', name: 'France', type: 'country', country: 'France', lat: 46.2, lon: 2.2 },
  { id: 'c-germany', name: 'Germany', type: 'country', country: 'Germany', lat: 51.2, lon: 10.4, aliases: ['Deutschland'] },
  { id: 'c-spain', name: 'Spain', type: 'country', country: 'Spain', lat: 40.5, lon: -3.7, aliases: ['España'] },
  { id: 'c-italy', name: 'Italy', type: 'country', country: 'Italy', lat: 41.9, lon: 12.6, aliases: ['Italia'] },
  { id: 'c-russia', name: 'Russia', type: 'country', country: 'Russia', lat: 61.5, lon: 105.3, aliases: ['Russian Federation'] },
  { id: 'c-china', name: 'China', type: 'country', country: 'China', lat: 35.9, lon: 104.2, aliases: ["People's Republic of China", 'PRC', 'Zhongguo'] },
  { id: 'c-india', name: 'India', type: 'country', country: 'India', lat: 20.6, lon: 78.9, aliases: ['Bharat'] },
  { id: 'c-brazil', name: 'Brazil', type: 'country', country: 'Brazil', lat: -14.2, lon: -51.9, aliases: ['Brasil'] },
  { id: 'c-australia', name: 'Australia', type: 'country', country: 'Australia', lat: -25.3, lon: 133.8 },
  { id: 'c-canada', name: 'Canada', type: 'country', country: 'Canada', lat: 56.1, lon: -106.3 },
  { id: 'c-mexico', name: 'Mexico', type: 'country', country: 'Mexico', lat: 23.6, lon: -102.5, aliases: ['México'] },
  { id: 'c-japan', name: 'Japan', type: 'country', country: 'Japan', lat: 36.2, lon: 138.2, aliases: ['Nihon', 'Nippon'] },
  { id: 'c-southkorea', name: 'South Korea', type: 'country', country: 'South Korea', lat: 35.9, lon: 127.8, aliases: ['Korea', 'Republic of Korea'] },
  { id: 'c-indonesia', name: 'Indonesia', type: 'country', country: 'Indonesia', lat: -0.8, lon: 113.9 },
  { id: 'c-argentina', name: 'Argentina', type: 'country', country: 'Argentina', lat: -38.4, lon: -63.6 },
  { id: 'c-turkey', name: 'Turkey', type: 'country', country: 'Turkey', lat: 38.96, lon: 35.24, aliases: ['Türkiye'] },
  { id: 'c-egypt', name: 'Egypt', type: 'country', country: 'Egypt', lat: 26.8, lon: 30.8 },
  { id: 'c-nigeria', name: 'Nigeria', type: 'country', country: 'Nigeria', lat: 9.1, lon: 8.7 },
  { id: 'c-southafrica', name: 'South Africa', type: 'country', country: 'South Africa', lat: -30.6, lon: 22.9 },
  { id: 'c-kenya', name: 'Kenya', type: 'country', country: 'Kenya', lat: -0.0, lon: 37.9 },
  { id: 'c-iran', name: 'Iran', type: 'country', country: 'Iran', lat: 32.4, lon: 53.7, aliases: ['Persia'] },
  { id: 'c-saudiarabia', name: 'Saudi Arabia', type: 'country', country: 'Saudi Arabia', lat: 23.9, lon: 45.1 },
  { id: 'c-ukraine', name: 'Ukraine', type: 'country', country: 'Ukraine', lat: 48.4, lon: 31.2 },
  { id: 'c-poland', name: 'Poland', type: 'country', country: 'Poland', lat: 51.9, lon: 19.1 },
  { id: 'c-netherlands', name: 'Netherlands', type: 'country', country: 'Netherlands', lat: 52.1, lon: 5.3, aliases: ['Holland', 'Nederland'] },
  { id: 'c-sweden', name: 'Sweden', type: 'country', country: 'Sweden', lat: 60.1, lon: 18.6, aliases: ['Sverige'] },
  { id: 'c-norway', name: 'Norway', type: 'country', country: 'Norway', lat: 64.5, lon: 17.9, aliases: ['Norge'] },
  { id: 'c-iceland', name: 'Iceland', type: 'country', country: 'Iceland', lat: 64.1, lon: -19.0, aliases: ['Ísland'] },
  { id: 'c-greece', name: 'Greece', type: 'country', country: 'Greece', lat: 39.1, lon: 21.8, aliases: ['Hellas', 'Ellada'] },
  { id: 'c-portugal', name: 'Portugal', type: 'country', country: 'Portugal', lat: 39.4, lon: -8.2 },
  { id: 'c-newzealand', name: 'New Zealand', type: 'country', country: 'New Zealand', lat: -40.9, lon: 174.9, aliases: ['NZ', 'Aotearoa'] },
  { id: 'c-thailand', name: 'Thailand', type: 'country', country: 'Thailand', lat: 15.9, lon: 100.9 },
  { id: 'c-vietnam', name: 'Vietnam', type: 'country', country: 'Vietnam', lat: 14.1, lon: 108.3, aliases: ['Viet Nam'] },
  { id: 'c-pakistan', name: 'Pakistan', type: 'country', country: 'Pakistan', lat: 30.4, lon: 69.3 },
  { id: 'c-colombia', name: 'Colombia', type: 'country', country: 'Colombia', lat: 4.6, lon: -74.3 },
  { id: 'c-peru', name: 'Peru', type: 'country', country: 'Peru', lat: -9.2, lon: -75.0, aliases: ['Perú'] },
  { id: 'c-chile', name: 'Chile', type: 'country', country: 'Chile', lat: -35.7, lon: -71.5 },
  { id: 'c-morocco', name: 'Morocco', type: 'country', country: 'Morocco', lat: 31.8, lon: -7.1, aliases: ['Maroc', 'Maghreb'] },
  { id: 'c-ethiopia', name: 'Ethiopia', type: 'country', country: 'Ethiopia', lat: 9.1, lon: 40.5 },
  { id: 'c-iraq', name: 'Iraq', type: 'country', country: 'Iraq', lat: 33.2, lon: 43.7 },
  { id: 'c-philippines', name: 'Philippines', type: 'country', country: 'Philippines', lat: 12.9, lon: 121.8 },
  { id: 'c-malaysia', name: 'Malaysia', type: 'country', country: 'Malaysia', lat: 4.2, lon: 108.0 },
  { id: 'c-switzerland', name: 'Switzerland', type: 'country', country: 'Switzerland', lat: 46.8, lon: 8.2, aliases: ['Schweiz', 'Suisse'] },
  { id: 'c-austria', name: 'Austria', type: 'country', country: 'Austria', lat: 47.5, lon: 14.6, aliases: ['Österreich'] },
  { id: 'c-singapore', name: 'Singapore', type: 'country', country: 'Singapore', lat: 1.4, lon: 103.8 },
  { id: 'c-uae', name: 'UAE', type: 'country', country: 'UAE', lat: 23.4, lon: 53.8, aliases: ['United Arab Emirates', 'Emirates'] },
  { id: 'c-israel', name: 'Israel', type: 'country', country: 'Israel', lat: 31.5, lon: 34.8 },
  // Continents
  { id: 'cont-europe', name: 'Europe', type: 'continent', country: 'Continent', lat: 54.5, lon: 15.3 },
  { id: 'cont-asia', name: 'Asia', type: 'continent', country: 'Continent', lat: 34.0, lon: 100.6 },
  { id: 'cont-africa', name: 'Africa', type: 'continent', country: 'Continent', lat: 8.8, lon: 34.5 },
  { id: 'cont-na', name: 'North America', type: 'continent', country: 'Continent', lat: 46.1, lon: -100.5 },
  { id: 'cont-sa', name: 'South America', type: 'continent', country: 'Continent', lat: -14.3, lon: -51.0 },
  { id: 'cont-oceania', name: 'Oceania', type: 'continent', country: 'Continent', lat: -22.7, lon: 140.0 },
  { id: 'cont-antarctica', name: 'Antarctica', type: 'continent', country: 'Continent', lat: -82.0, lon: 0.0 },
]

// Convert existing CITIES to SearchLocation format
const CITY_LOCATIONS: SearchLocation[] = CITIES.map(c => ({
  id: c.id,
  name: c.name,
  type: c.type as SearchLocation['type'],
  country: c.country,
  lat: c.lat,
  lon: c.lon,
  population: c.population,
}))

export const ALL_LOCATIONS: SearchLocation[] = [...CITY_LOCATIONS, ...COUNTRIES]

// ─── Fuzzy search ─────────────────────────────────────────────────────────────

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

function scoreMatch(loc: SearchLocation, q: string): number {
  const terms = [loc.name, ...(loc.aliases ?? []), loc.country].map(normalize)
  const nq = normalize(q)
  if (!nq) return 0

  let best = 0
  for (const t of terms) {
    if (t === nq) { best = Math.max(best, 100); continue }
    if (t.startsWith(nq)) { best = Math.max(best, 85); continue }
    // Word boundary match (e.g. "new" matches "New York")
    if (t.split(/\s+/).some(w => w.startsWith(nq))) { best = Math.max(best, 70); continue }
    if (t.includes(nq)) { best = Math.max(best, 50); continue }
  }
  return best
}

export function searchLocations(query: string, limit = 8): SearchLocation[] {
  if (!query.trim()) return []
  const scored = ALL_LOCATIONS
    .map(loc => ({ loc, score: scoreMatch(loc, query) }))
    .filter(x => x.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      // Tiebreak: population > type priority > alphabetical
      const typePriority = { capital: 3, major_city: 2, country: 2, continent: 1, landmark: 1 }
      const tp = (typePriority[b.loc.type] ?? 0) - (typePriority[a.loc.type] ?? 0)
      if (tp !== 0) return tp
      return (b.loc.population ?? 0) - (a.loc.population ?? 0)
    })
    .slice(0, limit)
    .map(x => x.loc)
  return scored
}

const RECENT_KEY = 'pinpoint_recent_searches'

export function getRecentSearches(): SearchLocation[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as SearchLocation[]) : []
  } catch {
    return []
  }
}

export function saveRecentSearch(loc: SearchLocation) {
  try {
    const existing = getRecentSearches().filter(r => r.id !== loc.id)
    localStorage.setItem(RECENT_KEY, JSON.stringify([loc, ...existing].slice(0, 6)))
  } catch { /* ignore */ }
}
