import { bearingTo, distanceKm, absAngularDiff, formatDistance } from '../utils/geo'
import type { WorldLayer, LayerItem } from './types'

const MUSIC_SCENES = [
  { id: 'techno-berlin',   name: 'Berlin Techno',       genre: 'Electronic / Techno',     lat: 52.52, lon: 13.40,   desc: 'Birthplace of modern techno culture' },
  { id: 'house-chicago',   name: 'Chicago House',       genre: 'House Music',              lat: 41.88, lon: -87.63,  desc: 'Where house music was born' },
  { id: 'jazz-neworleans', name: 'New Orleans Jazz',    genre: 'Jazz / Blues',             lat: 29.95, lon: -90.07,  desc: 'The spiritual home of jazz' },
  { id: 'blues-mississip', name: 'Mississippi Blues',   genre: 'Blues',                    lat: 33.50, lon: -90.20,  desc: 'Heart of the Delta blues tradition' },
  { id: 'reggae-kingston', name: 'Kingston Reggae',     genre: 'Reggae / Dancehall',       lat: 17.97, lon: -76.79,  desc: 'Birthplace of reggae music' },
  { id: 'samba-rio',       name: 'Rio Samba',           genre: 'Samba / Bossa Nova',       lat: -22.9, lon: -43.17,  desc: 'The rhythm of Rio de Janeiro' },
  { id: 'tango-buenosaires', name: 'Buenos Aires Tango', genre: 'Tango',                  lat: -34.6, lon: -58.38,  desc: 'The sensual dance of the Río de la Plata' },
  { id: 'flamenco-seville', name: 'Seville Flamenco',  genre: 'Flamenco',                 lat: 37.39, lon: -5.99,   desc: 'Deep song of Andalusia' },
  { id: 'fado-lisbon',     name: 'Lisbon Fado',         genre: 'Fado',                     lat: 38.72, lon: -9.14,   desc: 'Portuguese soul — melancholic, beautiful' },
  { id: 'kpop-seoul',      name: 'Seoul K-Pop',         genre: 'K-Pop',                    lat: 37.57, lon: 126.98,  desc: 'Global epicenter of Korean pop' },
  { id: 'jpop-tokyo',      name: 'Tokyo City Pop',      genre: 'J-Pop / City Pop',         lat: 35.68, lon: 139.69,  desc: 'Silky urban sounds of 80s Tokyo' },
  { id: 'afrobeats-lagos', name: 'Lagos Afrobeats',     genre: 'Afrobeats',                lat: 6.52,  lon: 3.38,    desc: 'The global sound of West Africa' },
  { id: 'highlife-accra',  name: 'Accra Highlife',      genre: 'Highlife',                 lat: 5.60,  lon: -0.19,   desc: 'Brass-heavy dance music of Ghana' },
  { id: 'bollywood-mumbai',name: 'Mumbai Bollywood',    genre: 'Bollywood / Film Music',   lat: 19.08, lon: 72.88,   desc: 'The world\'s largest music film industry' },
  { id: 'classical-vienna',name: 'Vienna Classical',    genre: 'Classical',                lat: 48.21, lon: 16.37,   desc: 'Mozart, Beethoven, Schubert — all here' },
  { id: 'hiphop-nyc',      name: 'NYC Hip-Hop',         genre: 'Hip-Hop / Rap',            lat: 40.71, lon: -74.01,  desc: 'The birthplace of hip-hop culture' },
  { id: 'grunge-seattle',  name: 'Seattle Grunge',      genre: 'Grunge / Rock',            lat: 47.61, lon: -122.33, desc: 'Nirvana, Pearl Jam, Soundgarden' },
  { id: 'soul-detroit',    name: 'Detroit Soul',        genre: 'Motown / Soul',            lat: 42.33, lon: -83.05,  desc: 'Motown — the sound that changed America' },
  { id: 'country-nashville',name: 'Nashville Country', genre: 'Country / Americana',      lat: 36.17, lon: -86.78,  desc: 'Music City — the home of country' },
  { id: 'cumbia-colombia', name: 'Cali Cumbia',         genre: 'Cumbia / Salsa',           lat: 3.44,  lon: -76.52,  desc: 'The dance capital of Latin America' },
  { id: 'metal-gothenburg',name: 'Gothenburg Metal',   genre: 'Melodic Death Metal',      lat: 57.71, lon: 11.97,   desc: 'Melodic death metal — cold, precise, epic' },
  { id: 'ambient-iceland', name: 'Reykjavik Ambient',  genre: 'Ambient / Post-Rock',      lat: 64.13, lon: -21.82,  desc: 'Sigur Rós, Ólafur Arnalds — glacial soundscapes' },
  { id: 'rai-algeria',     name: 'Algerian Raï',        genre: 'Raï',                      lat: 35.69, lon: 0.64,    desc: 'The rebellious voice of North Africa' },
  { id: 'celtic-ireland',  name: 'Irish Celtic',        genre: 'Celtic / Folk',            lat: 53.35, lon: -6.26,   desc: 'Ancient melodies that never fade' },
  { id: 'bop-paris',       name: 'Paris Jazz',          genre: 'Jazz / Bebop',             lat: 48.86, lon: 2.35,    desc: 'Where American jazz found its European soul' },
]

export const musicLayer: WorldLayer = {
  id: 'music',
  name: 'Music Scenes',
  icon: '🎵',
  color: 'text-pink-400',
  borderColor: 'border-pink-900/50',

  getItems(userLat, userLon, heading, threshold) {
    return MUSIC_SCENES
      .map(s => ({
        bearing: bearingTo(userLat, userLon, s.lat, s.lon),
        dist: distanceKm(userLat, userLon, s.lat, s.lon),
        scene: s,
      }))
      .filter(r => r.dist > 20 && absAngularDiff(heading, r.bearing) <= threshold)
      .sort((a, b) => absAngularDiff(heading, a.bearing) - absAngularDiff(heading, b.bearing))
      .slice(0, 4)
      .map(r => ({
        id: r.scene.id,
        name: r.scene.name,
        subtitle: r.scene.genre,
        detail: formatDistance(r.dist),
        distKm: r.dist,
        bearing: r.bearing,
        tags: [r.scene.genre.split('/')[0].trim()],
        meta: { note: r.scene.desc },
      } satisfies LayerItem))
  },
}
