import { useWedding, SFX_ITEMS, formatRupees } from '../context/WeddingContext'
import { MultiImageSelector } from '../components/ImageCard'

export function Tab6Sundries() {
  const { wedding, update } = useWedding()
  const guests = wedding.total_guests || 200

  const basketCost = { luxury: 2500, standard: 800, minimal: 300 }[wedding.room_basket_budget || 'standard']
  const rooms = Math.ceil((wedding.outstation_guests || 50) / 2)
  const ritualCost = (wedding.events || []).reduce((s, e) => {
    if (e === 'Haldi') return s + 8000
    if (e === 'Mehendi') return s + 15000
    if (e === 'Wedding Day Ceremony') return s + 20000
    return s
  }, 0)
  const hamperCost = { luxury: 3000, standard: 1000, minimal: 500 }[wedding.room_basket_budget || 'standard'] * guests
  const stationery = guests * 200
  const contingency = Math.round((rooms * basketCost + ritualCost + hamperCost + stationery) * 0.08)
  const sundryTotal = rooms * basketCost + ritualCost + hamperCost + stationery + contingency

  return (
    <div>
      <div className="section-card">
        <div className="section-title">🧺 Room Baskets</div>
        <div className="section-subtitle">Welcome hampers placed in each guest room</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[{ id: 'luxury', emoji: '👑', label: 'Luxury', desc: '₹2,500/room' },
            { id: 'standard', emoji: '🌸', label: 'Standard', desc: '₹800/room' },
            { id: 'minimal', emoji: '🌿', label: 'Minimal', desc: '₹300/room' }].map(opt => (
            <div key={opt.id} onClick={() => update('room_basket_budget', opt.id)}
              style={{ border: `2px solid ${wedding.room_basket_budget === opt.id ? '#C9A84C' : '#E8D5A3'}`,
                borderRadius: 14, padding: 18, textAlign: 'center', cursor: 'pointer',
                background: wedding.room_basket_budget === opt.id ? '#FFF8E8' : 'white' }}>
              <div style={{ fontSize: 34 }}>{opt.emoji}</div>
              <div style={{ fontWeight: 700, marginTop: 6 }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: '#C9A84C', fontWeight: 700 }}>{opt.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card">
        <div className="section-title">📋 Sundries Summary (Auto-Calculated)</div>
        <div style={{ background: '#FFF8E8', borderRadius: 12, padding: 18 }}>
          {[
            { label: `Room baskets (${rooms} rooms × ₹${basketCost})`, value: rooms * basketCost },
            { label: `Gift hampers (${guests} guests)`, value: hamperCost },
            { label: 'Ritual materials', value: ritualCost },
            { label: `Stationery & invites (${guests} guests)`, value: stationery },
            { label: 'Contingency buffer (8%)', value: contingency },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid #F5EDD8', fontSize: 14 }}>
              <span style={{ color: '#6B4C1E' }}>{row.label}</span>
              <span style={{ fontWeight: 700, color: '#C9A84C' }}>{formatRupees(row.value)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12,
            borderTop: '2px solid #C9A84C' }}>
            <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 18, fontWeight: 700 }}>Total Sundries</span>
            <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 24, fontWeight: 700, color: '#C9A84C' }}>{formatRupees(sundryTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Tab7Logistics() {
  const { wedding, update } = useWedding()

  const outstationGuests = wedding.outstation_guests || 0
  const fleetSize = Math.ceil(outstationGuests / 3)
  const transferCost = fleetSize * 4 * 3500

  const ghodiCost = wedding.ghodi ? ({ Chennai: 15000, Mumbai: 25000, Delhi: 20000,
    Hyderabad: 15000, default: 12000 }[wedding.wedding_city] || 12000) : 0
  const dholiCost = (wedding.dholi_count || 0) * (wedding.dholi_hours || 2) * 5000
  const sfxCost = (wedding.sfx_items || []).reduce((s, item) => s + ({ 'Cold Pyro': 15000,
    'Confetti Cannon': 8000, 'Smoke Machine': 5000, 'Laser Show': 25000 }[item] || 0), 0)
  const logisticsTotal = transferCost + ghodiCost + dholiCost + sfxCost
  if (wedding.logistics_total !== logisticsTotal) update('logistics_total', logisticsTotal)

  return (
    <div>
      {outstationGuests > 0 && (
        <div className="section-card">
          <div className="section-title">🚐 Airport / Station Transfers</div>
          <div style={{ padding: '14px 18px', background: '#E8F5E9', borderRadius: 12, border: '1.5px solid #A5D6A7', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: '#2E7D32', marginBottom: 6 }}>🏳️ Outstation Flag — Active</div>
            <div style={{ fontSize: 13, color: '#388E3C' }}>{outstationGuests} outstation guests detected</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {[
              { label: 'Fleet size (1 Innova per 3 guests)', value: `${fleetSize} vehicles` },
              { label: 'Estimated trips', value: `${fleetSize * 4} trips` },
              { label: 'Transfer cost estimate', value: formatRupees(transferCost) },
            ].map(s => (
              <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: 16, textAlign: 'center', border: '1px solid #E8D5A3' }}>
                <div style={{ fontSize: 11, color: '#9A9A9A', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 20, fontWeight: 700, color: '#C9A84C' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section-card">
        <div className="section-title">🐎 Baraat — Ghodi</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <div onClick={() => update('ghodi', !wedding.ghodi)}
            style={{ width: 52, height: 28, borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
              background: wedding.ghodi ? '#C9A84C' : '#E8D5A3', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 3, left: wedding.ghodi ? 26 : 3,
              width: 22, height: 22, borderRadius: '50%', background: 'white',
              transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </div>
          <span style={{ fontWeight: 600 }}>{wedding.ghodi ? '✅ Ghodi booked' : 'Book a Ghodi for baraat'}</span>
          {wedding.ghodi && <span style={{ color: '#C9A84C', fontWeight: 700 }}>≈ {formatRupees(ghodiCost)}</span>}
        </div>
      </div>

      <div className="section-card">
        <div className="section-title">🥁 Dholi</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="form-label">Number of Dholis</label>
            <input type="number" className="form-input" min={0} max={20}
              value={wedding.dholi_count || 0}
              onChange={e => update('dholi_count', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label className="form-label">Hours per event</label>
            <input type="number" className="form-input" min={1} max={12}
              value={wedding.dholi_hours || 2}
              onChange={e => update('dholi_hours', parseInt(e.target.value) || 2)} />
          </div>
        </div>
        {(wedding.dholi_count || 0) > 0 && (
          <div style={{ marginTop: 10, color: '#C9A84C', fontWeight: 700, fontSize: 14 }}>
            Dholi cost: {formatRupees(dholiCost)} ({wedding.dholi_count} × {wedding.dholi_hours}hr × ₹5K/hr)
          </div>
        )}
      </div>

      <div className="section-card">
        <div className="section-title">✨ SFX — Special Effects</div>
        <MultiImageSelector items={SFX_ITEMS} selected={wedding.sfx_items || []}
          onChange={v => update('sfx_items', v)} showCost />
      </div>

      <div className="section-card" style={{ background: 'linear-gradient(135deg,#FFF8E8,#FDF8F0)', border: '1.5px solid #C9A84C' }}>
        <div className="section-title" style={{ color: '#8B6914' }}>🚗 Total Logistics Cost</div>
        <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 36, fontWeight: 700, color: '#C9A84C', textAlign: 'center', marginTop: 8 }}>
          {formatRupees(logisticsTotal)}
        </div>
      </div>
    </div>
  )
}
