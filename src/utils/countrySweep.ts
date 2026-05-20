import { bearingTo, distanceKm } from './geo'

export type Difficulty = 'easy' | 'medium' | 'hard'

export const DIFFICULTY_CONFIG: Record<Difficulty, {
  radiusKm: number
  threshold: number
  label: string
  timeSeconds: number
}> = {
  easy:   { radiusKm: 2500, threshold: 14, label: 'EASY',   timeSeconds: 180 },
  medium: { radiusKm: 4500, threshold: 9,  label: 'MEDIUM', timeSeconds: 120 },
  hard:   { radiusKm: 7000, threshold: 5,  label: 'HARD',   timeSeconds: 90  },
}

export interface SweepTarget {
  id: string
  name: string
  flag: string
  bearing: number
  distKm: number
  discovered: boolean
  discoveredAt?: number
}

// Country centroids with flags — used as sweep targets
const COUNTRY_DATA: Array<{ name: string; flag: string; lat: number; lon: number }> = [
  { name: 'Iceland',        flag: '🇮🇸', lat: 64.1,  lon: -19.0  },
  { name: 'Norway',         flag: '🇳🇴', lat: 64.5,  lon: 17.9   },
  { name: 'Sweden',         flag: '🇸🇪', lat: 60.1,  lon: 18.6   },
  { name: 'Finland',        flag: '🇫🇮', lat: 61.9,  lon: 25.7   },
  { name: 'Denmark',        flag: '🇩🇰', lat: 56.3,  lon: 9.5    },
  { name: 'United Kingdom', flag: '🇬🇧', lat: 54.0,  lon: -2.5   },
  { name: 'Ireland',        flag: '🇮🇪', lat: 53.1,  lon: -8.2   },
  { name: 'Netherlands',    flag: '🇳🇱', lat: 52.1,  lon: 5.3    },
  { name: 'Belgium',        flag: '🇧🇪', lat: 50.5,  lon: 4.5    },
  { name: 'Luxembourg',     flag: '🇱🇺', lat: 49.8,  lon: 6.1    },
  { name: 'France',         flag: '🇫🇷', lat: 46.2,  lon: 2.2    },
  { name: 'Spain',          flag: '🇪🇸', lat: 40.5,  lon: -3.7   },
  { name: 'Portugal',       flag: '🇵🇹', lat: 39.4,  lon: -8.2   },
  { name: 'Germany',        flag: '🇩🇪', lat: 51.2,  lon: 10.4   },
  { name: 'Switzerland',    flag: '🇨🇭', lat: 46.8,  lon: 8.2    },
  { name: 'Austria',        flag: '🇦🇹', lat: 47.5,  lon: 14.6   },
  { name: 'Italy',          flag: '🇮🇹', lat: 41.9,  lon: 12.6   },
  { name: 'Czech Republic', flag: '🇨🇿', lat: 49.8,  lon: 15.5   },
  { name: 'Slovakia',       flag: '🇸🇰', lat: 48.7,  lon: 19.7   },
  { name: 'Poland',         flag: '🇵🇱', lat: 51.9,  lon: 19.1   },
  { name: 'Hungary',        flag: '🇭🇺', lat: 47.2,  lon: 19.5   },
  { name: 'Slovenia',       flag: '🇸🇮', lat: 46.2,  lon: 15.0   },
  { name: 'Croatia',        flag: '🇭🇷', lat: 45.1,  lon: 15.2   },
  { name: 'Serbia',         flag: '🇷🇸', lat: 44.0,  lon: 21.0   },
  { name: 'Romania',        flag: '🇷🇴', lat: 45.9,  lon: 24.9   },
  { name: 'Bulgaria',       flag: '🇧🇬', lat: 42.7,  lon: 25.5   },
  { name: 'Greece',         flag: '🇬🇷', lat: 39.1,  lon: 21.8   },
  { name: 'Albania',        flag: '🇦🇱', lat: 41.2,  lon: 20.2   },
  { name: 'North Macedonia',flag: '🇲🇰', lat: 41.6,  lon: 21.7   },
  { name: 'Bosnia',         flag: '🇧🇦', lat: 44.2,  lon: 17.9   },
  { name: 'Montenegro',     flag: '🇲🇪', lat: 42.7,  lon: 19.4   },
  { name: 'Ukraine',        flag: '🇺🇦', lat: 48.4,  lon: 31.2   },
  { name: 'Belarus',        flag: '🇧🇾', lat: 53.7,  lon: 27.9   },
  { name: 'Moldova',        flag: '🇲🇩', lat: 47.4,  lon: 28.4   },
  { name: 'Estonia',        flag: '🇪🇪', lat: 58.6,  lon: 25.0   },
  { name: 'Latvia',         flag: '🇱🇻', lat: 56.9,  lon: 24.6   },
  { name: 'Lithuania',      flag: '🇱🇹', lat: 55.2,  lon: 23.9   },
  { name: 'Russia',         flag: '🇷🇺', lat: 61.5,  lon: 55.0   },
  { name: 'Turkey',         flag: '🇹🇷', lat: 38.9,  lon: 35.2   },
  { name: 'Georgia',        flag: '🇬🇪', lat: 41.7,  lon: 44.0   },
  { name: 'Armenia',        flag: '🇦🇲', lat: 40.1,  lon: 45.0   },
  { name: 'Azerbaijan',     flag: '🇦🇿', lat: 40.1,  lon: 47.6   },
  { name: 'Kazakhstan',     flag: '🇰🇿', lat: 48.0,  lon: 66.9   },
  { name: 'Cyprus',         flag: '🇨🇾', lat: 35.1,  lon: 33.4   },
  { name: 'Malta',          flag: '🇲🇹', lat: 35.9,  lon: 14.5   },
  { name: 'Morocco',        flag: '🇲🇦', lat: 31.8,  lon: -7.1   },
  { name: 'Algeria',        flag: '🇩🇿', lat: 28.0,  lon: 2.6    },
  { name: 'Tunisia',        flag: '🇹🇳', lat: 33.9,  lon: 9.5    },
  { name: 'Libya',          flag: '🇱🇾', lat: 26.3,  lon: 17.2   },
  { name: 'Egypt',          flag: '🇪🇬', lat: 26.8,  lon: 30.8   },
  { name: 'Israel',         flag: '🇮🇱', lat: 31.5,  lon: 34.8   },
  { name: 'Jordan',         flag: '🇯🇴', lat: 30.6,  lon: 36.2   },
  { name: 'Lebanon',        flag: '🇱🇧', lat: 33.9,  lon: 35.5   },
  { name: 'Syria',          flag: '🇸🇾', lat: 34.8,  lon: 38.9   },
  { name: 'Iraq',           flag: '🇮🇶', lat: 33.2,  lon: 43.7   },
  { name: 'Iran',           flag: '🇮🇷', lat: 32.4,  lon: 53.7   },
  { name: 'Saudi Arabia',   flag: '🇸🇦', lat: 23.9,  lon: 45.1   },
  { name: 'UAE',            flag: '🇦🇪', lat: 23.4,  lon: 53.8   },
  { name: 'Nigeria',        flag: '🇳🇬', lat: 9.1,   lon: 8.7    },
  { name: 'Ghana',          flag: '🇬🇭', lat: 7.9,   lon: -1.0   },
  { name: 'Kenya',          flag: '🇰🇪', lat: -0.0,  lon: 37.9   },
  { name: 'Ethiopia',       flag: '🇪🇹', lat: 9.1,   lon: 40.5   },
  { name: 'South Africa',   flag: '🇿🇦', lat: -30.6, lon: 22.9   },
  { name: 'USA',            flag: '🇺🇸', lat: 39.8,  lon: -98.5  },
  { name: 'Canada',         flag: '🇨🇦', lat: 56.1,  lon: -106.3 },
  { name: 'Mexico',         flag: '🇲🇽', lat: 23.6,  lon: -102.5 },
  { name: 'Brazil',         flag: '🇧🇷', lat: -14.2, lon: -51.9  },
  { name: 'Argentina',      flag: '🇦🇷', lat: -38.4, lon: -63.6  },
  { name: 'India',          flag: '🇮🇳', lat: 20.6,  lon: 78.9   },
  { name: 'China',          flag: '🇨🇳', lat: 35.9,  lon: 104.2  },
  { name: 'Japan',          flag: '🇯🇵', lat: 36.2,  lon: 138.2  },
  { name: 'South Korea',    flag: '🇰🇷', lat: 35.9,  lon: 127.8  },
  { name: 'Australia',      flag: '🇦🇺', lat: -25.3, lon: 133.8  },
  { name: 'New Zealand',    flag: '🇳🇿', lat: -40.9, lon: 174.9  },
  { name: 'Indonesia',      flag: '🇮🇩', lat: -0.8,  lon: 113.9  },
  { name: 'Thailand',       flag: '🇹🇭', lat: 15.9,  lon: 100.9  },
  { name: 'Pakistan',       flag: '🇵🇰', lat: 30.4,  lon: 69.3   },
  { name: 'Afghanistan',    flag: '🇦🇫', lat: 33.9,  lon: 67.7   },
  { name: 'Uzbekistan',     flag: '🇺🇿', lat: 41.4,  lon: 64.6   },
]

export function getNearbySweepTargets(
  userLat: number,
  userLon: number,
  difficulty: Difficulty
): SweepTarget[] {
  const { radiusKm } = DIFFICULTY_CONFIG[difficulty]

  return COUNTRY_DATA
    .map((c, i) => ({
      id: `sweep-${i}`,
      name: c.name,
      flag: c.flag,
      bearing: bearingTo(userLat, userLon, c.lat, c.lon),
      distKm: distanceKm(userLat, userLon, c.lat, c.lon),
      discovered: false,
    }))
    .filter(t => t.distKm > 80 && t.distKm <= radiusKm)
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 14)
}

export function calcScore(
  discoveredCount: number,
  totalCount: number,
  timeUsedSeconds: number,
  totalTimeSeconds: number
): number {
  const base = discoveredCount * 120
  const completion = discoveredCount === totalCount ? 300 : 0
  const timeBonus = Math.max(0, Math.round(((totalTimeSeconds - timeUsedSeconds) / totalTimeSeconds) * 400))
  return base + completion + timeBonus
}
