import { useState, useMemo } from 'react'
import { ALL_LAYERS } from '../layers/registry'
import type { WorldLayer, LayerItem } from '../layers/types'
import ManualHeadingControl from './ManualHeadingControl'
import { bearingLabel } from '../utils/geo'

interface Props {
  userLat: number
  userLon: number
  heading: number
  manualHeading: boolean
  onManualChange: (h: number) => void
  onBack: () => void
}

const THRESHOLD = 12 // degrees cone half-width

export default function WorldLayersMode({ userLat, userLon, heading, manualHeading, onManualChange, onBack }: Props) {
  const [activeLayerIds, setActiveLayerIds] = useState<Set<string>>(
    new Set(ALL_LAYERS.map(l => l.id))
  )
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(
    new Set(ALL_LAYERS.map(l => l.id))
  )

  const toggleLayer = (id: string) => {
    setActiveLayerIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleExpand = (id: string) => {
    setExpandedLayers(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const layerResults = useMemo(() => {
    return ALL_LAYERS
      .filter(l => activeLayerIds.has(l.id))
      .map(layer => ({
        layer,
        items: layer.getItems(userLat, userLon, heading, THRESHOLD),
      }))
      .filter(r => r.items.length > 0)
  }, [userLat, userLon, heading, activeLayerIds])

  const totalItems = layerResults.reduce((sum, r) => sum + r.items.length, 0)
  const dirLabel = bearingLabel(heading)

  return (
    <div className="flex flex-col h-screen bg-radar-bg overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe-top pt-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-800/60 flex items-center justify-center text-slate-400 active:scale-95 transition-transform"
          >
            ←
          </button>
          <div>
            <h1 className="font-mono font-bold text-radar-accent text-base tracking-widest">WORLD LAYERS</h1>
            <p className="font-mono text-xs text-slate-500">
              {Math.round(heading)}° {dirLabel} — {totalItems} signals
            </p>
          </div>
        </div>
        {/* Heading ring indicator */}
        <div className="flex items-center gap-1">
          <div className="w-10 h-10 relative">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <circle cx="20" cy="20" r="18" fill="none" stroke="#0d3a4f" strokeWidth="2" />
              <circle cx="20" cy="20" r="14" fill="none" stroke="#071520" strokeWidth="2" />
              {/* heading needle */}
              <line
                x1="20" y1="20"
                x2={20 + 13 * Math.sin(heading * Math.PI / 180)}
                y2={20 - 13 * Math.cos(heading * Math.PI / 180)}
                stroke="#00e5ff" strokeWidth="2" strokeLinecap="round"
              />
              <circle cx="20" cy="20" r="2" fill="#00e5ff" />
            </svg>
          </div>
        </div>
      </div>

      {/* Layer toggle pills */}
      <div className="px-4 py-2 flex gap-1.5 flex-wrap border-b border-slate-800/60">
        {ALL_LAYERS.map(layer => {
          const active = activeLayerIds.has(layer.id)
          const count = layerResults.find(r => r.layer.id === layer.id)?.items.length ?? 0
          return (
            <button
              key={layer.id}
              onClick={() => toggleLayer(layer.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono border transition-all active:scale-95 ${
                active
                  ? `${layer.color} ${layer.borderColor} bg-slate-800/80`
                  : 'text-slate-600 border-slate-800 bg-transparent'
              }`}
            >
              <span>{layer.icon}</span>
              <span className="hidden sm:inline">{layer.name}</span>
              {active && count > 0 && (
                <span className="bg-slate-700 rounded-full px-1 text-slate-300">{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Manual slider */}
      {manualHeading && (
        <div className="px-4 py-2 border-b border-slate-800/60">
          <ManualHeadingControl heading={heading} onChange={onManualChange} />
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-safe-bottom pb-4">
        {layerResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-16 h-16 rounded-full border border-slate-700 flex items-center justify-center mb-4 opacity-40">
              <span className="text-3xl">🌐</span>
            </div>
            <p className="font-mono text-slate-500 text-sm">No signals in this direction</p>
            <p className="font-mono text-slate-600 text-xs mt-1">±{THRESHOLD}° cone — try rotating</p>
          </div>
        ) : (
          layerResults.map(({ layer, items }) => (
            <LayerSection
              key={layer.id}
              layer={layer}
              items={items}
              expanded={expandedLayers.has(layer.id)}
              onToggleExpand={() => toggleExpand(layer.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function LayerSection({
  layer,
  items,
  expanded,
  onToggleExpand,
}: {
  layer: WorldLayer
  items: LayerItem[]
  expanded: boolean
  onToggleExpand: () => void
}) {
  return (
    <div className={`rounded-xl border ${layer.borderColor} bg-radar-panel overflow-hidden`}>
      {/* Section header */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between px-3 py-2.5 active:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{layer.icon}</span>
          <span className={`font-mono text-xs font-bold tracking-widest uppercase ${layer.color}`}>
            {layer.name}
          </span>
          <span className="font-mono text-xs text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        <span className="text-slate-600 text-xs">{expanded ? '▾' : '▸'}</span>
      </button>

      {/* Items */}
      {expanded && (
        <div className="border-t border-slate-800/60 divide-y divide-slate-800/40">
          {items.map((item, i) => (
            <LayerItemRow key={item.id} item={item} isTop={i === 0} color={layer.color} />
          ))}
        </div>
      )}
    </div>
  )
}

function LayerItemRow({ item, isTop, color }: { item: LayerItem; isTop: boolean; color: string }) {
  return (
    <div className={`px-3 py-2.5 ${isTop ? 'bg-slate-800/30' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`font-mono text-sm font-semibold ${isTop ? color : 'text-white'} truncate`}>
              {item.name}
            </span>
            {item.tags?.map(tag => (
              <span key={tag} className="font-mono text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
          {item.subtitle && (
            <p className="font-mono text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
          )}
          {item.meta?.note && (
            <p className="font-mono text-xs text-slate-600 mt-1 italic leading-snug">{item.meta.note}</p>
          )}
          {/* Meta pills (excluding note) */}
          {item.meta && Object.keys(item.meta).filter(k => k !== 'note').length > 0 && (
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {Object.entries(item.meta)
                .filter(([k]) => k !== 'note')
                .map(([k, v]) => (
                  <span key={k} className="font-mono text-xs text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                    {v}
                  </span>
                ))}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className={`font-mono text-sm font-bold ${isTop ? color : 'text-slate-300'}`}>
            {item.detail}
          </div>
          {item.bearing !== undefined && (
            <div className="font-mono text-xs text-slate-600 mt-0.5">
              {Math.round(item.bearing)}°
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
