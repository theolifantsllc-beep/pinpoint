import { citiesLayer } from './citiesLayer'
import { countriesLayer } from './countriesLayer'
import { flightsLayer } from './flightsLayer'
import { mountainsLayer } from './mountainsLayer'
import { musicLayer } from './musicLayer'
import { historyLayer } from './historyLayer'
import { weatherLayer } from './weatherLayer'
import type { WorldLayer } from './types'

export const ALL_LAYERS: WorldLayer[] = [
  citiesLayer,
  countriesLayer,
  flightsLayer,
  mountainsLayer,
  musicLayer,
  historyLayer,
  weatherLayer,
]
