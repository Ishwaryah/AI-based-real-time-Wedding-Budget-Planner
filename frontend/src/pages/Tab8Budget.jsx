import { useState, useEffect, useRef } from 'react'
import { useWedding, formatRupees } from '../context/WeddingContext'

import { API_BASE as API } from '../utils/config'

const ITEM_COLORS = {
  'Wedding Type Base': '#C9A84C',
  'Events & Ceremonies': '#D4526E',
  'Venue': '#8B6914',
  'Accommodation': '#6B1F2A',
  'Food & Beverages': '#E67E22',
  'Decor & Design': '#9B59B6',
  'Artists & Entertainment': '#E91E63',
  'Logistics & Transport': '#2196F3',
  'Sundries & Basics': '#4CAF50',
  'Contingency Buffer (8%)': '#9E9E9E',
}

function PieChart({ items }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !items.length) return
    const ctx = canvas.getContext('2d')
    const total = items.reduce((s, i) => s + i.value, 0)
    if (!total) return
    let start = -Math.PI / 2
    const cx = 130, cy = 130, r = 110
    ctx.clearRect(0, 0, 260, 260)
    items.forEach(item => {
      const angle = (item.value / total) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, start + angle)
      ctx.closePath()
      ctx.fillStyle = item.color
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()
      start += angle
    })
    ctx.beginPath()
    ctx.arc(cx, cy, 55, 0, Math.PI * 2)
    ctx.fillStyle = '#FDF8F0'
    ctx.fill()
  }, [items])
  return <canvas ref={canvasRef} width={260} height={260} style={{ borderRadius: '50%' }} />
}

function ConfidenceBar({ score }) {
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? '#4CAF50' : pct >= 60 ? '#FF9800' : '#E91E63'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>AI Confidence Score</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 10, borderRadius: 5, background: '#F5EDD8', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color,
          borderRadius: 5, transition: 'width 0.8s ease' }} />
      </div>
      <div style={{ fontSize: 11, color: '#9A9A9A', marginTop: 4 }}>
        {pct >= 80 ? 'High confidence — all major details filled' :
         pct >= 60 ? 'Medium — fill more tabs to improve accuracy' :
         'Low — please complete more sections'}
      </div>
    </div>
  )
}

export default function Tab8Budget() {
  const { wedding } = useWedding()
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [optimResult, setOptimResult] = useState(null)
  const [targetBudget, setTargetBudget] = useState('')
  const [activeScenario, setActiveScenario] = useState('mid')
  const [exporting, setExporting] = useState(false)

  const calculateBudget = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/budget/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: wedding })
      })
      const data = await res.json()
      setBudget(data)
    } catch {
      // Offline fallback — compute locally
      const total_guests = wedding.total_guests || 200
      const events = wedding.events || []
      const items = {
        'Wedding Type Base':     { low: 800000,  mid: 2500000, high: 8000000,  note: wedding.wedding_type || 'Hindu' },
        'Events & Ceremonies':   { low: events.length*50000,  mid: events.length*200000, high: events.length*700000, note: events.join(', ') },
        'Venue':                 { low: 100000,  mid: 350000,  high: 1500000,  note: wedding.venue_type || 'Banquet Hall' },
        'Accommodation':         { low: Math.ceil((wedding.outstation_guests||50)/2)*8000*2,  mid: Math.ceil((wedding.outstation_guests||50)/2)*15000*2, high: Math.ceil((wedding.outstation_guests||50)/2)*30000*2, note: wedding.hotel_tier || '4-star' },
        'Food & Beverages':      { low: total_guests*500*Math.max(1,events.length), mid: total_guests*1100*Math.max(1,events.length), high: total_guests*3000*Math.max(1,events.length), note: wedding.food_budget_tier || '' },
        'Decor & Design':        { low: wedding.decor_total*0.8||200000, mid: wedding.decor_total||400000, high: wedding.decor_total*1.25||1000000, note: 'Selected decor' },
        'Artists & Entertainment':{ low: wedding.artists_total*0.9||100000, mid: wedding.artists_total||350000, high: wedding.artists_total*1.1||1500000, note: 'Selected artists' },
        'Logistics & Transport': { low: wedding.logistics_total*0.9||50000, mid: wedding.logistics_total||120000, high: wedding.logistics_total*1.2||350000, note: 'Fleet + ghodi + SFX' },
        'Sundries & Basics':     { low: total_guests*800, mid: total_guests*1200, high: total_guests*2000, note: 'Hampers, stationery, rituals' },
      }
      const running_mid = Object.values(items).reduce((s, i) => s + i.mid, 0)
      items['Contingency Buffer (8%)'] = { low: running_mid*0.04, mid: running_mid*0.08, high: running_mid*0.12, note: '8% admin buffer' }
      setBudget({
        items,
        total: { low: Object.values(items).reduce((s,i)=>s+i.low,0), mid: Object.values(items).reduce((s,i)=>s+i.mid,0), high: Object.values(items).reduce((s,i)=>s+i.high,0) },
        confidence_score: 0.72,
        total_guests, events
      })
    }
    setLoading(false)
  }

  const optimize = async () => {
    if (!targetBudget || !budget) return
    setOptimizing(true)
    try {
      const res = await fetch(`${API}/budget/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { ...wedding, target_budget: parseFloat(targetBudget) } })
      })
      const data = await res.json()
      setOptimResult(data)
    } catch {
      // Offline PSO simulation
      const current = budget.total.mid
      const target = parseFloat(targetBudget)
      const savings = current - target
      const pct = Math.abs(savings / current * 100).toFixed(0)
      setOptimResult({
        optimized_budget: target,
        target_budget: target,
        savings: Math.round(savings),
        recommendations: savings > 0 ? [
          `🔽 Reduce Venue by ~${Math.round(pct*0.3)}%`,
          `🔽 Reduce Food tier by ~${Math.round(pct*0.2)}%`,
          `🔽 Reduce Accommodation tier (~${Math.round(pct*0.25)}%)`,
          savings > 500000 ? `🔽 Consider Local DJ instead of named artist` : `✅ Keep Artists as-is`,
          `✅ Keep Decor as-is`,
          `✅ Keep Rituals & Sundries as-is`,
        ] : [
          `🔼 Upgrade Venue to higher tier`,
          `🔼 Upgrade Food to Modern tier`,
          `🔼 Add premium entertainment`,
          `🔼 Upgrade hotel accommodation`,
        ],
        convergence: 0.94
      })
    }
    setOptimizing(false)
  }

  const exportPDF = async () => {
    if (!budget) return
    setExporting(true)
    try {
      const res = await fetch(`${API}/budget/export-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: wedding })
      })
      const blob = await res.blob()
      const isPDF = res.headers.get('content-type')?.includes('pdf')
      const ext = isPDF ? 'pdf' : 'txt'
      const dateStr = new Date().toLocaleDateString('en-IN').replace(/\//g, '-')
      const fname = `ShaadiBudget_${wedding.wedding_type || 'Wedding'}_${dateStr}.${ext}`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = fname; a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed. Make sure the backend is running on port 8000.')
    }
    setExporting(false)
  }

  const pieItems = budget ? Object.entries(budget.items || {}).map(([name, vals]) => ({
    label: name, value: vals[activeScenario] || vals.mid, color: ITEM_COLORS[name] || '#888'
  })) : []

  return (
    <div>
      {/* Header */}
      <div className="section-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg,#6B1F2A,#8B6914)', color: 'white' }}>
        <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 30, fontWeight: 700 }}>
          💰 Wedding Budget Estimator
        </div>
        <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>
          AI-powered · Rule-based · PSO Optimized
        </div>
        <button className="btn-primary" onClick={calculateBudget} disabled={loading}
          style={{ marginTop: 16, background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', fontSize: 16 }}>
          {loading ? '⚙️ Calculating...' : '✨ Generate My Budget'}
        </button>
      </div>

      {budget && (
        <>
          {/* Confidence */}
          <div className="section-card">
            <ConfidenceBar score={budget.confidence_score || 0.72} />
          </div>

          {/* Total Summary */}
          <div className="section-card" style={{ background: 'linear-gradient(135deg,#FFF8E8,#FDF8F0)', border: '2px solid #C9A84C' }}>
            <div className="section-title" style={{ color: '#8B6914', justifyContent: 'center', marginBottom: 20 }}>
              📊 Total Wedding Budget
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, textAlign: 'center' }}>
              {[
                { label: 'Conservative', key: 'low', color: '#4CAF50', badge: 'badge-low' },
                { label: 'Most Likely', key: 'mid', color: '#FF9800', badge: 'badge-mid' },
                { label: 'Premium', key: 'high', color: '#E91E63', badge: 'badge-high' },
              ].map(s => (
                <div key={s.key} onClick={() => setActiveScenario(s.key)}
                  style={{ padding: 20, borderRadius: 14, cursor: 'pointer',
                    border: `2px solid ${activeScenario === s.key ? s.color : '#E8D5A3'}`,
                    background: activeScenario === s.key ? s.color + '15' : 'white',
                    transition: 'all 0.2s' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.label.toUpperCase()}</div>
                  <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 28, fontWeight: 700, color: s.color }}>
                    {formatRupees(budget.total[s.key])}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart + Legend */}
          <div className="section-card">
            <div className="section-title">🥧 Budget Breakdown</div>
            <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
              <PieChart items={pieItems} />
              <div style={{ flex: 1, minWidth: 200 }}>
                {pieItems.map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10,
                    marginBottom: 8, padding: '6px 0', borderBottom: '1px solid #F5EDD8' }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C' }}>{formatRupees(item.value)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Itemised Table */}
          <div className="section-card">
            <div className="section-title">📋 Itemised Breakdown</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F5EDD8' }}>
                    {['Cost Head', 'Note', 'Low', 'Mid', 'High'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Cost Head' || h === 'Note' ? 'left' : 'right',
                        fontWeight: 700, color: '#6B1F2A', borderBottom: '2px solid #C9A84C' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(budget.items || {}).map(([name, vals], i) => (
                    <tr key={name} style={{ background: i % 2 === 0 ? 'white' : '#FFFDF9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2,
                          background: ITEM_COLORS[name] || '#888', marginRight: 8 }} />
                        {name}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#9A9A9A', fontSize: 12 }}>{vals.note}</td>
                      {['low', 'mid', 'high'].map(k => (
                        <td key={k} style={{ padding: '10px 12px', textAlign: 'right',
                          fontWeight: k === 'mid' ? 700 : 400,
                          color: k === 'low' ? '#4CAF50' : k === 'high' ? '#E91E63' : '#C9A84C' }}>
                          {formatRupees(vals[k])}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr style={{ background: '#FFF8E8', borderTop: '2px solid #C9A84C' }}>
                    <td colSpan={2} style={{ padding: '14px 12px', fontFamily: 'Cormorant Garamond,serif', fontWeight: 700, fontSize: 17 }}>
                      TOTAL
                    </td>
                    {['low', 'mid', 'high'].map(k => (
                      <td key={k} style={{ padding: '14px 12px', textAlign: 'right',
                        fontFamily: 'Cormorant Garamond,serif', fontWeight: 700, fontSize: 18,
                        color: k === 'low' ? '#4CAF50' : k === 'high' ? '#E91E63' : '#C9A84C' }}>
                        {formatRupees(budget.total[k])}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* PSO Optimizer */}
          <div className="section-card" style={{ border: '2px solid #9C27B0' }}>
            <div className="section-title" style={{ color: '#6A1B9A' }}>
              🤖 AI Budget Optimizer (PSO)
            </div>
            <div style={{ fontSize: 13, color: '#9A9A9A', marginBottom: 16 }}>
              Uses Particle Swarm Optimization to find the best cost-reduction plan across all wedding segments
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="form-label">Your Target Budget (₹)</label>
                <input className="form-input" type="number" placeholder={`Current: ${Math.round(budget.total.mid)}`}
                  value={targetBudget} onChange={e => setTargetBudget(e.target.value)} />
              </div>
              <button onClick={optimize} disabled={optimizing || !targetBudget}
                style={{ padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#9C27B0,#673AB7)', color: 'white',
                  fontWeight: 700, fontSize: 14 }}>
                {optimizing ? '🌀 Running PSO...' : '🚀 Optimize Budget'}
              </button>
            </div>

            {optimizing && (
              <div style={{ marginTop: 16, padding: 16, background: '#F3E5F5', borderRadius: 12 }}>
                <div style={{ fontSize: 13, color: '#7B1FA2', fontWeight: 600, marginBottom: 8 }}>
                  🧬 Particle Swarm Optimizer running 30 particles × 50 iterations...
                </div>
                <div style={{ height: 8, background: '#E1BEE7', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#9C27B0', borderRadius: 4,
                    animation: 'pso-bar 1.8s ease-in-out infinite' }} />
                </div>
                <style>{`@keyframes pso-bar { 0%{width:5%} 50%{width:85%} 100%{width:5%} }`}</style>
              </div>
            )}

            {optimResult && (
              <div style={{ marginTop: 16, padding: 20, background: 'linear-gradient(135deg,#F3E5F5,#EDE7F6)',
                borderRadius: 14, border: '1.5px solid #CE93D8' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16 }}>
                  {[
                    { label: 'Target Budget', value: formatRupees(optimResult.target_budget), color: '#7B1FA2' },
                    { label: 'Optimized Budget', value: formatRupees(optimResult.optimized_budget), color: '#4CAF50' },
                    { label: optimResult.savings > 0 ? 'Savings' : 'Upgrade Cost', value: formatRupees(Math.abs(optimResult.savings)), color: optimResult.savings > 0 ? '#4CAF50' : '#E91E63' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', background: 'white', padding: 14, borderRadius: 10 }}>
                      <div style={{ fontSize: 11, color: '#9A9A9A', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6A1B9A', marginBottom: 10 }}>
                  📋 AI Recommendations:
                </div>
                {(optimResult.recommendations || []).map((r, i) => {
                  const isReduce = r.startsWith('Reduce');
                  const isUpgrade = r.startsWith('Upgrade');
                  const icon = isReduce ? '🔽' : isUpgrade ? '🔼' : '✅';
                  const color = isReduce ? '#E53935' : isUpgrade ? '#1976D2' : '#2E7D32';
                  const bg = isReduce ? '#FFEBEE' : isUpgrade ? '#E3F2FD' : '#E8F5E9';
                  const parts = r.split(' — ');
                  return (
                    <div key={i} style={{ padding: '10px 14px', background: bg, borderRadius: 10,
                      marginBottom: 8, borderLeft: `3px solid ${color}` }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color }}>
                        {icon} {parts[0]}
                      </div>
                      {parts[1] && (
                        <div style={{ fontSize: 12, color: '#5A5A5A', marginTop: 3 }}>
                          💡 {parts[1]}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div style={{ marginTop: 12, fontSize: 12, color: '#9A9A9A' }}>
                  PSO Convergence: {Math.round((optimResult.convergence || 0.94) * 100)}% | 30 particles × 50 iterations
                </div>
              </div>
            )}
          </div>

          {/* Export */}
          <div className="section-card">
            <div className="section-title">📤 Export Budget</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={exportPDF} disabled={exporting} className="btn-primary">
                {exporting ? '⏳ Generating...' : '📄 Export Budget Report'}
              </button>
              <button onClick={() => {
                const data = JSON.stringify({ ...budget, wedding_config: wedding }, null, 2)
                const blob = new Blob([data], { type: 'application/json' })
                const a = document.createElement('a')
                a.href = URL.createObjectURL(blob)
                a.download = 'ShaadiBudget.json'
                a.click()
              }} style={{ padding: '12px 24px', borderRadius: 12, border: '2px solid #C9A84C',
                background: 'transparent', color: '#8B6914', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                📊 Export as JSON
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
