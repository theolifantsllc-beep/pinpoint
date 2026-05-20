export interface LayerItem {
  id: string
  name: string
  subtitle?: string
  detail?: string
  distKm?: number
  bearing?: number
  tags?: string[]
  meta?: Record<string, string>
}

export interface WorldLayer {
  id: string
  name: string
  icon: string
  color: string           // tailwind text color class
  borderColor: string     // tailwind border color class
  getItems(
    userLat: number,
    userLon: number,
    heading: number,
    threshold: number
  ): LayerItem[]
}
