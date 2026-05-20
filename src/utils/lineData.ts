export interface LineFeature {
  name: string
  type: 'country' | 'ocean' | 'sea' | 'gulf' | 'strait'
  flag?: string
  continent?: string
  distKm: number
}

interface Country {
  name: string
  flag: string
  continent: string
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

// Countries sorted by bounding-box area ascending (smallest first → higher priority)
const RAW_COUNTRIES: Country[] = [
  // === EUROPE ===
  { name: 'Iceland', flag: '🇮🇸', continent: 'Europe', minLat: 63, maxLat: 67, minLon: -25, maxLon: -12 },
  { name: 'Norway', flag: '🇳🇴', continent: 'Europe', minLat: 57, maxLat: 72, minLon: 4, maxLon: 32 },
  { name: 'Sweden', flag: '🇸🇪', continent: 'Europe', minLat: 55, maxLat: 70, minLon: 10, maxLon: 25 },
  { name: 'Finland', flag: '🇫🇮', continent: 'Europe', minLat: 59, maxLat: 70, minLon: 19, maxLon: 32 },
  { name: 'Estonia', flag: '🇪🇪', continent: 'Europe', minLat: 57, maxLat: 60, minLon: 21, maxLon: 28 },
  { name: 'Latvia', flag: '🇱🇻', continent: 'Europe', minLat: 55, maxLat: 58, minLon: 20, maxLon: 28 },
  { name: 'Lithuania', flag: '🇱🇹', continent: 'Europe', minLat: 53, maxLat: 57, minLon: 20, maxLon: 27 },
  { name: 'Belarus', flag: '🇧🇾', continent: 'Europe', minLat: 51, maxLat: 57, minLon: 23, maxLon: 33 },
  { name: 'Ukraine', flag: '🇺🇦', continent: 'Europe', minLat: 44, maxLat: 53, minLon: 22, maxLon: 40 },
  { name: 'Moldova', flag: '🇲🇩', continent: 'Europe', minLat: 45, maxLat: 48, minLon: 26, maxLon: 31 },
  { name: 'Poland', flag: '🇵🇱', continent: 'Europe', minLat: 49, maxLat: 55, minLon: 14, maxLon: 24 },
  { name: 'Germany', flag: '🇩🇪', continent: 'Europe', minLat: 47, maxLat: 55, minLon: 6, maxLon: 15 },
  { name: 'Netherlands', flag: '🇳🇱', continent: 'Europe', minLat: 50, maxLat: 54, minLon: 3, maxLon: 7 },
  { name: 'Belgium', flag: '🇧🇪', continent: 'Europe', minLat: 49, maxLat: 52, minLon: 2, maxLon: 7 },
  { name: 'Luxembourg', flag: '🇱🇺', continent: 'Europe', minLat: 49, maxLat: 50.5, minLon: 5.7, maxLon: 6.6 },
  { name: 'France', flag: '🇫🇷', continent: 'Europe', minLat: 42, maxLat: 51, minLon: -5, maxLon: 9 },
  { name: 'Spain', flag: '🇪🇸', continent: 'Europe', minLat: 35, maxLat: 44, minLon: -10, maxLon: 4 },
  { name: 'Portugal', flag: '🇵🇹', continent: 'Europe', minLat: 36, maxLat: 42, minLon: -10, maxLon: -6 },
  { name: 'United Kingdom', flag: '🇬🇧', continent: 'Europe', minLat: 49, maxLat: 61, minLon: -9, maxLon: 2 },
  { name: 'Ireland', flag: '🇮🇪', continent: 'Europe', minLat: 51, maxLat: 56, minLon: -11, maxLon: -5 },
  { name: 'Denmark', flag: '🇩🇰', continent: 'Europe', minLat: 54, maxLat: 58, minLon: 8, maxLon: 16 },
  { name: 'Switzerland', flag: '🇨🇭', continent: 'Europe', minLat: 45, maxLat: 48, minLon: 6, maxLon: 11 },
  { name: 'Austria', flag: '🇦🇹', continent: 'Europe', minLat: 46, maxLat: 49, minLon: 9, maxLon: 18 },
  { name: 'Czech Republic', flag: '🇨🇿', continent: 'Europe', minLat: 48, maxLat: 51, minLon: 12, maxLon: 19 },
  { name: 'Slovakia', flag: '🇸🇰', continent: 'Europe', minLat: 47, maxLat: 50, minLon: 16, maxLon: 23 },
  { name: 'Hungary', flag: '🇭🇺', continent: 'Europe', minLat: 45, maxLat: 49, minLon: 16, maxLon: 23 },
  { name: 'Romania', flag: '🇷🇴', continent: 'Europe', minLat: 43, maxLat: 49, minLon: 22, maxLon: 30 },
  { name: 'Bulgaria', flag: '🇧🇬', continent: 'Europe', minLat: 41, maxLat: 44, minLon: 22, maxLon: 29 },
  { name: 'Serbia', flag: '🇷🇸', continent: 'Europe', minLat: 42, maxLat: 46, minLon: 18, maxLon: 23 },
  { name: 'Croatia', flag: '🇭🇷', continent: 'Europe', minLat: 42, maxLat: 47, minLon: 13, maxLon: 20 },
  { name: 'Bosnia & Herzegovina', flag: '🇧🇦', continent: 'Europe', minLat: 42, maxLat: 46, minLon: 15, maxLon: 20 },
  { name: 'Slovenia', flag: '🇸🇮', continent: 'Europe', minLat: 45, maxLat: 47, minLon: 13, maxLon: 16 },
  { name: 'Montenegro', flag: '🇲🇪', continent: 'Europe', minLat: 41, maxLat: 44, minLon: 18, maxLon: 21 },
  { name: 'North Macedonia', flag: '🇲🇰', continent: 'Europe', minLat: 40, maxLat: 43, minLon: 20, maxLon: 23 },
  { name: 'Albania', flag: '🇦🇱', continent: 'Europe', minLat: 39, maxLat: 43, minLon: 19, maxLon: 21 },
  { name: 'Greece', flag: '🇬🇷', continent: 'Europe', minLat: 34, maxLat: 42, minLon: 19, maxLon: 28 },
  { name: 'Italy', flag: '🇮🇹', continent: 'Europe', minLat: 36, maxLat: 48, minLon: 6, maxLon: 19 },
  { name: 'Malta', flag: '🇲🇹', continent: 'Europe', minLat: 35.5, maxLat: 36.1, minLon: 14, maxLon: 14.7 },
  { name: 'Cyprus', flag: '🇨🇾', continent: 'Europe', minLat: 34, maxLat: 36, minLon: 32, maxLon: 35 },

  // === ASIA ===
  { name: 'Turkey', flag: '🇹🇷', continent: 'Asia', minLat: 35, maxLat: 43, minLon: 25, maxLon: 45 },
  { name: 'Georgia', flag: '🇬🇪', continent: 'Asia', minLat: 41, maxLat: 44, minLon: 39, maxLon: 47 },
  { name: 'Armenia', flag: '🇦🇲', continent: 'Asia', minLat: 38, maxLat: 42, minLon: 43, maxLon: 47 },
  { name: 'Azerbaijan', flag: '🇦🇿', continent: 'Asia', minLat: 38, maxLat: 42, minLon: 44, maxLon: 51 },
  { name: 'Syria', flag: '🇸🇾', continent: 'Asia', minLat: 32, maxLat: 37, minLon: 35, maxLon: 43 },
  { name: 'Lebanon', flag: '🇱🇧', continent: 'Asia', minLat: 33, maxLat: 35, minLon: 35, maxLon: 37 },
  { name: 'Israel', flag: '🇮🇱', continent: 'Asia', minLat: 29, maxLat: 33, minLon: 34, maxLon: 36 },
  { name: 'Palestine', flag: '🇵🇸', continent: 'Asia', minLat: 31, maxLat: 33, minLon: 34, maxLon: 36 },
  { name: 'Jordan', flag: '🇯🇴', continent: 'Asia', minLat: 29, maxLat: 33, minLon: 35, maxLon: 40 },
  { name: 'Iraq', flag: '🇮🇶', continent: 'Asia', minLat: 29, maxLat: 38, minLon: 38, maxLon: 49 },
  { name: 'Iran', flag: '🇮🇷', continent: 'Asia', minLat: 25, maxLat: 40, minLon: 44, maxLon: 64 },
  { name: 'Kuwait', flag: '🇰🇼', continent: 'Asia', minLat: 28, maxLat: 31, minLon: 46, maxLon: 49 },
  { name: 'Saudi Arabia', flag: '🇸🇦', continent: 'Asia', minLat: 16, maxLat: 32, minLon: 34, maxLon: 56 },
  { name: 'Bahrain', flag: '🇧🇭', continent: 'Asia', minLat: 25, maxLat: 27, minLon: 50, maxLon: 51 },
  { name: 'Qatar', flag: '🇶🇦', continent: 'Asia', minLat: 24, maxLat: 27, minLon: 50, maxLon: 52 },
  { name: 'UAE', flag: '🇦🇪', continent: 'Asia', minLat: 22, maxLat: 26, minLon: 51, maxLon: 56 },
  { name: 'Oman', flag: '🇴🇲', continent: 'Asia', minLat: 16, maxLat: 26, minLon: 52, maxLon: 60 },
  { name: 'Yemen', flag: '🇾🇪', continent: 'Asia', minLat: 12, maxLat: 19, minLon: 42, maxLon: 55 },
  { name: 'Afghanistan', flag: '🇦🇫', continent: 'Asia', minLat: 29, maxLat: 39, minLon: 60, maxLon: 75 },
  { name: 'Pakistan', flag: '🇵🇰', continent: 'Asia', minLat: 23, maxLat: 38, minLon: 61, maxLon: 78 },
  { name: 'India', flag: '🇮🇳', continent: 'Asia', minLat: 8, maxLat: 37, minLon: 68, maxLon: 98 },
  { name: 'Nepal', flag: '🇳🇵', continent: 'Asia', minLat: 26, maxLat: 31, minLon: 79, maxLon: 89 },
  { name: 'Sri Lanka', flag: '🇱🇰', continent: 'Asia', minLat: 5, maxLat: 10, minLon: 79, maxLon: 82 },
  { name: 'Bangladesh', flag: '🇧🇩', continent: 'Asia', minLat: 20, maxLat: 27, minLon: 88, maxLon: 93 },
  { name: 'Myanmar', flag: '🇲🇲', continent: 'Asia', minLat: 10, maxLat: 29, minLon: 92, maxLon: 102 },
  { name: 'Thailand', flag: '🇹🇭', continent: 'Asia', minLat: 5, maxLat: 21, minLon: 97, maxLon: 106 },
  { name: 'Laos', flag: '🇱🇦', continent: 'Asia', minLat: 13, maxLat: 23, minLon: 100, maxLon: 108 },
  { name: 'Vietnam', flag: '🇻🇳', continent: 'Asia', minLat: 8, maxLat: 24, minLon: 102, maxLon: 110 },
  { name: 'Cambodia', flag: '🇰🇭', continent: 'Asia', minLat: 10, maxLat: 15, minLon: 102, maxLon: 108 },
  { name: 'Malaysia', flag: '🇲🇾', continent: 'Asia', minLat: 0, maxLat: 8, minLon: 99, maxLon: 120 },
  { name: 'Singapore', flag: '🇸🇬', continent: 'Asia', minLat: 1, maxLat: 2, minLon: 103, maxLon: 105 },
  { name: 'Indonesia', flag: '🇮🇩', continent: 'Asia', minLat: -11, maxLat: 6, minLon: 95, maxLon: 141 },
  { name: 'Philippines', flag: '🇵🇭', continent: 'Asia', minLat: 4, maxLat: 21, minLon: 116, maxLon: 128 },
  { name: 'Taiwan', flag: '🇹🇼', continent: 'Asia', minLat: 21, maxLat: 26, minLon: 119, maxLon: 123 },
  { name: 'China', flag: '🇨🇳', continent: 'Asia', minLat: 17, maxLat: 54, minLon: 73, maxLon: 136 },
  { name: 'Mongolia', flag: '🇲🇳', continent: 'Asia', minLat: 41, maxLat: 52, minLon: 87, maxLon: 120 },
  { name: 'North Korea', flag: '🇰🇵', continent: 'Asia', minLat: 37, maxLat: 43, minLon: 124, maxLon: 131 },
  { name: 'South Korea', flag: '🇰🇷', continent: 'Asia', minLat: 33, maxLat: 39, minLon: 125, maxLon: 130 },
  { name: 'Japan', flag: '🇯🇵', continent: 'Asia', minLat: 24, maxLat: 46, minLon: 122, maxLon: 146 },
  { name: 'Kazakhstan', flag: '🇰🇿', continent: 'Asia', minLat: 40, maxLat: 56, minLon: 50, maxLon: 88 },
  { name: 'Uzbekistan', flag: '🇺🇿', continent: 'Asia', minLat: 37, maxLat: 43, minLon: 55, maxLon: 73 },
  { name: 'Turkmenistan', flag: '🇹🇲', continent: 'Asia', minLat: 35, maxLat: 43, minLon: 52, maxLon: 67 },
  { name: 'Kyrgyzstan', flag: '🇰🇬', continent: 'Asia', minLat: 39, maxLat: 43, minLon: 69, maxLon: 81 },
  { name: 'Tajikistan', flag: '🇹🇯', continent: 'Asia', minLat: 36, maxLat: 41, minLon: 67, maxLon: 75 },
  // Russia split to avoid matching central Pacific/Arctic
  { name: 'Russia', flag: '🇷🇺', continent: 'Europe', minLat: 50, maxLat: 73, minLon: 20, maxLon: 60 },
  { name: 'Russia', flag: '🇷🇺', continent: 'Asia', minLat: 50, maxLat: 73, minLon: 60, maxLon: 180 },

  // === AFRICA ===
  { name: 'Morocco', flag: '🇲🇦', continent: 'Africa', minLat: 27, maxLat: 36, minLon: -14, maxLon: -1 },
  { name: 'Algeria', flag: '🇩🇿', continent: 'Africa', minLat: 18, maxLat: 38, minLon: -9, maxLon: 12 },
  { name: 'Tunisia', flag: '🇹🇳', continent: 'Africa', minLat: 30, maxLat: 38, minLon: 7, maxLon: 12 },
  { name: 'Libya', flag: '🇱🇾', continent: 'Africa', minLat: 19, maxLat: 34, minLon: 9, maxLon: 26 },
  { name: 'Egypt', flag: '🇪🇬', continent: 'Africa', minLat: 22, maxLat: 32, minLon: 24, maxLon: 37 },
  { name: 'Sudan', flag: '🇸🇩', continent: 'Africa', minLat: 8, maxLat: 23, minLon: 21, maxLon: 39 },
  { name: 'Ethiopia', flag: '🇪🇹', continent: 'Africa', minLat: 3, maxLat: 15, minLon: 33, maxLon: 48 },
  { name: 'Somalia', flag: '🇸🇴', continent: 'Africa', minLat: -2, maxLat: 12, minLon: 40, maxLon: 52 },
  { name: 'Kenya', flag: '🇰🇪', continent: 'Africa', minLat: -5, maxLat: 5, minLon: 34, maxLon: 42 },
  { name: 'Tanzania', flag: '🇹🇿', continent: 'Africa', minLat: -12, maxLat: -1, minLon: 29, maxLon: 41 },
  { name: 'Uganda', flag: '🇺🇬', continent: 'Africa', minLat: -2, maxLat: 5, minLon: 29, maxLon: 35 },
  { name: 'Mozambique', flag: '🇲🇿', continent: 'Africa', minLat: -27, maxLat: -10, minLon: 32, maxLon: 41 },
  { name: 'Madagascar', flag: '🇲🇬', continent: 'Africa', minLat: -26, maxLat: -12, minLon: 43, maxLon: 51 },
  { name: 'South Africa', flag: '🇿🇦', continent: 'Africa', minLat: -35, maxLat: -22, minLon: 16, maxLon: 33 },
  { name: 'Namibia', flag: '🇳🇦', continent: 'Africa', minLat: -29, maxLat: -17, minLon: 11, maxLon: 26 },
  { name: 'Botswana', flag: '🇧🇼', continent: 'Africa', minLat: -27, maxLat: -18, minLon: 19, maxLon: 30 },
  { name: 'Zimbabwe', flag: '🇿🇼', continent: 'Africa', minLat: -23, maxLat: -15, minLon: 25, maxLon: 34 },
  { name: 'Angola', flag: '🇦🇴', continent: 'Africa', minLat: -19, maxLat: -4, minLon: 11, maxLon: 25 },
  { name: 'Zambia', flag: '🇿🇲', continent: 'Africa', minLat: -18, maxLat: -8, minLon: 21, maxLon: 34 },
  { name: 'Nigeria', flag: '🇳🇬', continent: 'Africa', minLat: 4, maxLat: 14, minLon: 2, maxLon: 15 },
  { name: 'Ghana', flag: '🇬🇭', continent: 'Africa', minLat: 4, maxLat: 11, minLon: -4, maxLon: 1 },
  { name: 'DR Congo', flag: '🇨🇩', continent: 'Africa', minLat: -14, maxLat: 5, minLon: 12, maxLon: 31 },
  { name: 'Cameroon', flag: '🇨🇲', continent: 'Africa', minLat: 1, maxLat: 13, minLon: 8, maxLon: 17 },
  { name: 'Chad', flag: '🇹🇩', continent: 'Africa', minLat: 7, maxLat: 24, minLon: 13, maxLon: 24 },
  { name: 'Niger', flag: '🇳🇪', continent: 'Africa', minLat: 11, maxLat: 24, minLon: 3, maxLon: 16 },
  { name: 'Mali', flag: '🇲🇱', continent: 'Africa', minLat: 10, maxLat: 25, minLon: -5, maxLon: 5 },
  { name: 'Senegal', flag: '🇸🇳', continent: 'Africa', minLat: 12, maxLat: 17, minLon: -18, maxLon: -11 },
  { name: 'Mauritania', flag: '🇲🇷', continent: 'Africa', minLat: 14, maxLat: 27, minLon: -17, maxLon: -4 },
  { name: 'Khartoum', flag: '🇸🇩', continent: 'Africa', minLat: 14, maxLat: 18, minLon: 31, maxLon: 34 },

  // === NORTH AMERICA ===
  { name: 'Canada', flag: '🇨🇦', continent: 'North America', minLat: 41, maxLat: 84, minLon: -141, maxLon: -52 },
  { name: 'USA', flag: '🇺🇸', continent: 'North America', minLat: 24, maxLat: 50, minLon: -125, maxLon: -66 },
  { name: 'Alaska', flag: '🇺🇸', continent: 'North America', minLat: 54, maxLat: 72, minLon: -170, maxLon: -130 },
  { name: 'Mexico', flag: '🇲🇽', continent: 'North America', minLat: 14, maxLat: 33, minLon: -118, maxLon: -86 },
  { name: 'Guatemala', flag: '🇬🇹', continent: 'North America', minLat: 13, maxLat: 18, minLon: -93, maxLon: -88 },
  { name: 'Honduras', flag: '🇭🇳', continent: 'North America', minLat: 13, maxLat: 17, minLon: -90, maxLon: -83 },
  { name: 'El Salvador', flag: '🇸🇻', continent: 'North America', minLat: 13, maxLat: 15, minLon: -91, maxLon: -87 },
  { name: 'Nicaragua', flag: '🇳🇮', continent: 'North America', minLat: 10, maxLat: 15, minLon: -88, maxLon: -83 },
  { name: 'Costa Rica', flag: '🇨🇷', continent: 'North America', minLat: 8, maxLat: 12, minLon: -86, maxLon: -82 },
  { name: 'Panama', flag: '🇵🇦', continent: 'North America', minLat: 7, maxLat: 10, minLon: -83, maxLon: -77 },
  { name: 'Cuba', flag: '🇨🇺', continent: 'North America', minLat: 19, maxLat: 24, minLon: -85, maxLon: -74 },
  { name: 'Dominican Republic', flag: '🇩🇴', continent: 'North America', minLat: 17, maxLat: 20, minLon: -72, maxLon: -68 },
  { name: 'Haiti', flag: '🇭🇹', continent: 'North America', minLat: 17, maxLat: 21, minLon: -75, maxLon: -71 },

  // === SOUTH AMERICA ===
  { name: 'Colombia', flag: '🇨🇴', continent: 'South America', minLat: -4, maxLat: 13, minLon: -79, maxLon: -66 },
  { name: 'Venezuela', flag: '🇻🇪', continent: 'South America', minLat: 0, maxLat: 13, minLon: -74, maxLon: -60 },
  { name: 'Guyana', flag: '🇬🇾', continent: 'South America', minLat: 1, maxLat: 9, minLon: -62, maxLon: -56 },
  { name: 'Suriname', flag: '🇸🇷', continent: 'South America', minLat: 1, maxLat: 6, minLon: -59, maxLon: -53 },
  { name: 'Brazil', flag: '🇧🇷', continent: 'South America', minLat: -34, maxLat: 6, minLon: -74, maxLon: -33 },
  { name: 'Ecuador', flag: '🇪🇨', continent: 'South America', minLat: -5, maxLat: 2, minLon: -81, maxLon: -75 },
  { name: 'Peru', flag: '🇵🇪', continent: 'South America', minLat: -19, maxLat: 1, minLon: -82, maxLon: -68 },
  { name: 'Bolivia', flag: '🇧🇴', continent: 'South America', minLat: -23, maxLat: -9, minLon: -70, maxLon: -57 },
  { name: 'Paraguay', flag: '🇵🇾', continent: 'South America', minLat: -28, maxLat: -19, minLon: -63, maxLon: -54 },
  { name: 'Uruguay', flag: '🇺🇾', continent: 'South America', minLat: -35, maxLat: -30, minLon: -59, maxLon: -53 },
  { name: 'Argentina', flag: '🇦🇷', continent: 'South America', minLat: -56, maxLat: -21, minLon: -74, maxLon: -53 },
  { name: 'Chile', flag: '🇨🇱', continent: 'South America', minLat: -56, maxLat: -17, minLon: -76, maxLon: -66 },

  // === OCEANIA ===
  { name: 'Australia', flag: '🇦🇺', continent: 'Oceania', minLat: -44, maxLat: -10, minLon: 113, maxLon: 154 },
  { name: 'New Zealand', flag: '🇳🇿', continent: 'Oceania', minLat: -48, maxLat: -34, minLon: 166, maxLon: 178 },
  { name: 'Papua New Guinea', flag: '🇵🇬', continent: 'Oceania', minLat: -12, maxLat: 0, minLon: 140, maxLon: 157 },
  { name: 'Fiji', flag: '🇫🇯', continent: 'Oceania', minLat: -22, maxLat: -15, minLon: 176, maxLon: 180 },
]

// Sort by bbox area ascending → smaller countries checked first
const COUNTRIES = RAW_COUNTRIES.map(c => ({
  ...c,
  _area: (c.maxLat - c.minLat) * (c.maxLon - c.minLon)
})).sort((a, b) => a._area - b._area)

/** Compute destination point given start, bearing (deg), distance (km) */
function destinationPoint(lat: number, lon: number, bearing: number, distKm: number) {
  const R = 6371
  const d = distKm / R
  const φ1 = (lat * Math.PI) / 180
  const λ1 = (lon * Math.PI) / 180
  const θ = (bearing * Math.PI) / 180

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(d) + Math.cos(φ1) * Math.sin(d) * Math.cos(θ)
  )
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(d) * Math.cos(φ1),
      Math.cos(d) - Math.sin(φ1) * Math.sin(φ2)
    )
  return {
    lat: (φ2 * 180) / Math.PI,
    lon: (((λ2 * 180) / Math.PI + 540) % 360) - 180,
  }
}

function findCountry(lat: number, lon: number): Country | null {
  for (const c of COUNTRIES) {
    if (lat >= c.minLat && lat <= c.maxLat && lon >= c.minLon && lon <= c.maxLon) {
      return c
    }
  }
  return null
}

/** Returns the water body name at a given lat/lon */
function getWaterBody(lat: number, lon: number): LineFeature {
  const t = (name: string, type: LineFeature['type']): LineFeature => ({ name, type, distKm: 0 })

  // Inland / enclosed
  if (lat > 36 && lat < 48 && lon > 49 && lon < 55) return t('Caspian Sea', 'sea')
  if (lat > 40 && lat < 48 && lon > 27 && lon < 42) return t('Black Sea', 'sea')

  // Semi-enclosed seas
  if (lat > 53 && lat < 66 && lon > 9 && lon < 31) return t('Baltic Sea', 'sea')
  if (lat > 50 && lat < 62 && lon > -6 && lon < 10) return t('North Sea', 'sea')
  if (lat > 60 && lat < 78 && lon > -15 && lon < 35) return t('Norwegian Sea', 'sea')
  if (lat > 66 && lat < 80 && lon > -30 && lon < 20) return t('Greenland Sea', 'sea')
  if (lat > 30 && lat < 47 && lon > -6 && lon < 37) return t('Mediterranean Sea', 'sea')
  if (lat > 12 && lat < 30 && lon > 32 && lon < 44) return t('Red Sea', 'sea')
  if (lat > 22 && lat < 30 && lon > 48 && lon < 57) return t('Persian Gulf', 'gulf')
  if (lat > 11 && lat < 27 && lon > 56 && lon < 65) return t('Gulf of Oman', 'gulf')
  if (lat > 0 && lat < 26 && lon > 40 && lon < 60) return t('Arabian Sea', 'sea')
  if (lat > 0 && lat < 25 && lon > 99 && lon < 122) return t('South China Sea', 'sea')
  if (lat > 33 && lat < 52 && lon > 127 && lon < 142) return t('Sea of Japan', 'sea')
  if (lat > 25 && lat < 42 && lon > 119 && lon < 132) return t('East China Sea', 'sea')
  if (lat > 52 && lat < 66 && lon > 140 && lon < 165) return t('Sea of Okhotsk', 'sea')
  if (lat > 55 && lat < 67 && lon > -170 && lon < -155) return t('Bering Sea', 'sea')
  if (lat > 15 && lat < 30 && lon > -90 && lon < -60) return t('Caribbean Sea', 'sea')
  if (lat > 18 && lat < 31 && lon > -99 && lon < -80) return t('Gulf of Mexico', 'gulf')
  if (lat > 45 && lat < 56 && lon > -68 && lon < -52) return t('Gulf of St. Lawrence', 'gulf')
  if (lat > -30 && lat < 10 && lon > 30 && lon < 60) return t('Mozambique Channel', 'sea')

  // Polar
  if (lat > 66) return t('Arctic Ocean', 'ocean')
  if (lat < -60) return t('Southern Ocean', 'ocean')

  // Major oceans by lon/lat
  if (lon > 140 || lon < -75) {
    return lat > 0 ? t('North Pacific Ocean', 'ocean') : t('South Pacific Ocean', 'ocean')
  }
  if (lon > -76 && lon < 20) {
    return lat > 0 ? t('North Atlantic Ocean', 'ocean') : t('South Atlantic Ocean', 'ocean')
  }
  if (lat < 32 && lon > 20 && lon < 100) return t('Indian Ocean', 'ocean')

  return t('Ocean', 'ocean')
}

const OCEAN_ICON: Record<string, string> = {
  ocean: '🌊',
  sea: '〰️',
  gulf: '🌀',
  strait: '〰️',
}

export function getOceanIcon(type: LineFeature['type']) {
  return OCEAN_ICON[type] ?? '🌊'
}

export function getLineFeatures(
  userLat: number,
  userLon: number,
  bearing: number
): LineFeature[] {
  const features: LineFeature[] = []
  let lastName = ''

  // Sample every 300km up to ~19,000km (slightly past antipodal)
  for (let dist = 200; dist <= 19500; dist += 300) {
    const pt = destinationPoint(userLat, userLon, bearing, dist)
    const country = findCountry(pt.lat, pt.lon)

    let name: string
    let feature: LineFeature

    if (country) {
      name = country.name
      if (name !== lastName) {
        feature = {
          name: country.name,
          type: 'country',
          flag: country.flag,
          continent: country.continent,
          distKm: dist,
        }
      } else {
        continue
      }
    } else {
      const wb = getWaterBody(pt.lat, pt.lon)
      name = wb.name
      if (name !== lastName) {
        feature = { ...wb, distKm: dist }
      } else {
        continue
      }
    }

    features.push(feature)
    lastName = name
  }

  return features
}
