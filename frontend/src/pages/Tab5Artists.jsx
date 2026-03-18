import { useState } from 'react'
import { useWedding, ARTIST_TYPES, formatRupees } from '../context/WeddingContext'

const ARTIST_COST_MAP = {
  'Local DJ': [50000, 150000], 'Professional DJ': [200000, 500000],
  'Bollywood Singer A': [800000, 1200000], 'Bollywood Singer B': [500000, 900000],
  'Live Band (Local)': [100000, 300000], 'Live Band (National)': [500000, 1500000],
  'Folk Artist': [30000, 100000], 'Myra Entertainment': [200000, 600000],
  'Choreographer': [50000, 200000], 'Anchor / Emcee': [30000, 150000],
}

export default function Tab5Artists() {
  const { wedding, update } = useWedding()
  const [selected, setSelected] = useState([])

  const toggle = (artist) => {
    const exists = selected.find(s => s.id === artist.id)
    let next
    if (exists) next = selected.filter(s => s.id !== artist.id)
    else next = [...selected, artist]
    setSelected(next)
    const costs = next.map(a => {
      const [lo, hi] = ARTIST_COST_MAP[a.id] || [0, 0]
      return (lo + hi) / 2
    })
    update('artists_total', costs.reduce((a, b) => a + b, 0))
    update('selected_artists', next.map(a => a.id))
  }

  const total = selected.reduce((sum, a) => {
    const [lo, hi] = ARTIST_COST_MAP[a.id] || [0, 0]
    return sum + (lo + hi) / 2
  }, 0)

  return (
    <div>
      <div className="section-card">
        <div className="section-title">🎤 Artists & Entertainment</div>
        <div className="section-subtitle">Select performers — costs auto-added to budget</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 14 }}>
          {ARTIST_TYPES.map(artist => {
            const isSelected = !!selected.find(s => s.id === artist.id)
            const [lo, hi] = ARTIST_COST_MAP[artist.id] || [0, 0]
            return (
              <div key={artist.id} onClick={() => toggle(artist)}
                style={{ border: `2px solid ${isSelected ? '#C9A84C' : '#E8D5A3'}`,
                  borderRadius: 14, padding: '18px 14px', cursor: 'pointer',
                  background: isSelected ? 'linear-gradient(135deg,#FFF8E8,#FDF8F0)' : 'white',
                  boxShadow: isSelected ? '0 0 0 3px rgba(201,168,76,0.2)' : 'none',
                  transition: 'all 0.2s', textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: 38, marginBottom: 8 }}>{artist.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{artist.label}</div>
                <div style={{ fontSize: 12, color: '#C9A84C', fontWeight: 700 }}>
                  {formatRupees(lo)} – {formatRupees(hi)}
                </div>
                {isSelected && (
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22,
                    background: '#C9A84C', borderRadius: '50%', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold' }}>✓</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="section-card" style={{ background: 'linear-gradient(135deg,#FFF8E8,#FDF8F0)', border: '1.5px solid #C9A84C' }}>
          <div className="section-title" style={{ color: '#8B6914' }}>🎊 Entertainment Budget</div>
          {selected.map(a => {
            const [lo, hi] = ARTIST_COST_MAP[a.id] || [0, 0]
            return (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: '1px solid #F5EDD8', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 22 }}>{a.emoji}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{a.label}</span>
                </div>
                <div style={{ fontSize: 13, color: '#8B6914', fontWeight: 700 }}>
                  {formatRupees(lo)} – {formatRupees(hi)}
                </div>
              </div>
            )
          })}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '2px solid #C9A84C' }}>
            <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 20, fontWeight: 700 }}>Total Entertainment</span>
            <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 26, fontWeight: 700, color: '#C9A84C' }}>{formatRupees(total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
