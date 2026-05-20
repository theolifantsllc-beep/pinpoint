import { getLineFeatures } from '../utils/lineData'
import { formatDistance } from '../utils/geo'
import type { WorldLayer, LayerItem } from './types'

export const countriesLayer: WorldLayer = {
  id: 'countries',
  name: 'On This Line',
  icon: '🌍',
  color: 'text-emerald-400',
  borderColor: 'border-emerald-900/50',

  getItems(userLat, userLon, heading, _threshold) {
    const features = getLineFeatures(userLat, userLon, heading).slice(0, 10)
    return features.map(f => ({
      id: `line-${f.name}-${f.distKm}`,
      name: f.name,
      subtitle: f.continent ?? (f.type === 'country' ? 'Country' : f.type),
      detail: formatDistance(f.distKm),
      distKm: f.distKm,
      tags: f.flag ? [f.flag] : [],
    } satisfies LayerItem))
  },
}
