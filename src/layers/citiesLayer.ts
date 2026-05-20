import { CITIES } from '../utils/cities'
import { bearingTo, distanceKm, absAngularDiff, formatDistance } from '../utils/geo'
import type { WorldLayer, LayerItem } from './types'

export const citiesLayer: WorldLayer = {
  id: 'cities',
  name: 'Cities',
  icon: '🏙',
  color: 'text-sky-400',
  borderColor: 'border-sky-900/50',

  getItems(userLat, userLon, heading, threshold) {
    return CITIES
      .map(c => ({
        bearing: bearingTo(userLat, userLon, c.lat, c.lon),
        dist: distanceKm(userLat, userLon, c.lat, c.lon),
        city: c,
      }))
      .filter(r => r.dist > 10 && absAngularDiff(heading, r.bearing) <= threshold)
      .sort((a, b) => absAngularDiff(heading, a.bearing) - absAngularDiff(heading, b.bearing))
      .slice(0, 8)
      .map(r => ({
        id: r.city.id,
        name: r.city.name,
        subtitle: r.city.country,
        detail: formatDistance(r.dist),
        distKm: r.dist,
        bearing: r.bearing,
        tags: [r.city.type === 'capital' ? 'CAPITAL' : r.city.type === 'landmark' ? 'LANDMARK' : 'CITY'],
        meta: r.city.population
          ? { pop: `${(r.city.population / 1e6).toFixed(1)}M people` }
          : undefined,
      } satisfies LayerItem))
  },
}
