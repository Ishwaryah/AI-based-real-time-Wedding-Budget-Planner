import { useState } from 'react'
import { useWedding, VENUE_TYPES, HOTEL_TIERS, INDIAN_CITIES, ALL_EVENTS } from '../context/WeddingContext'
import { MultiImageSelector, SingleImageSelector } from '../components/ImageCard'
import { useMemo } from 'react'

export default function Tab2Venue() {
  const { wedding, update } = useWedding()

  const roomsNeeded = useMemo(() => {
    const tier = HOTEL_TIERS.find(t => t.id === wedding.hotel_tier)
    const ppr = tier ? tier.ppr : 2
    return Math.ceil(wedding.outstation_guests / ppr)
  }, [wedding.outstation_guests, wedding.hotel_tier])

  const outstationFlag = wedding.outstation_guests > 0 && wedding.hotel_tier

  return (
    <div>
      {/* Venue Type */}
      <div className="section-card">
        <div className="section-title">🏛️ Venue Type</div>
        <div className="section-subtitle">Click to select your preferred venue style</div>
        <SingleImageSelector items={VENUE_TYPES} selected={wedding.venue_type}
          onChange={(v) => update('venue_type', v)} />
      </div>

      {/* City */}
      <div className="section-card">
        <div className="section-title">📍 Wedding City</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="form-label">Select City</label>
            <select className="form-select" value={wedding.wedding_city}
              onChange={e => update('wedding_city', e.target.value)}>
              <option value="">-- Choose City --</option>
              {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="other">Other (specify below)</option>
            </select>
          </div>
          {wedding.wedding_city === 'other' && (
            <div>
              <label className="form-label">Specify City</label>
              <input className="form-input" placeholder="Enter city name"
                onChange={e => update('wedding_city', e.target.value)} />
            </div>
          )}
        </div>
      </div>

      {/* Seating & Guests */}
      <div className="section-card">
        <div className="section-title">👥 Guests & Capacity</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label className="form-label">Seating Capacity Needed</label>
            <input type="number" className="form-input" value={wedding.seating_capacity}
              min={10} max={5000}
              onChange={e => update('seating_capacity', parseInt(e.target.value))} />
          </div>
          <div>
            <label className="form-label">Total Guests (all events)</label>
            <input type="number" className="form-input" value={wedding.total_guests}
              min={10} max={5000}
              onChange={e => update('total_guests', parseInt(e.target.value))} />
          </div>
          <div>
            <label className="form-label">Outstation Guests</label>
            <input type="number" className="form-input" value={wedding.outstation_guests}
              min={0} max={wedding.total_guests}
              onChange={e => update('outstation_guests', parseInt(e.target.value))} />
          </div>
        </div>

        {/* Per-event guest counts */}
        {wedding.events.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div className="form-label" style={{ marginBottom: 12 }}>Guests per Event</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {wedding.events.map(ev => {
                const evObj = ALL_EVENTS.find(e => e.id === ev)
                return (
                  <div key={ev} style={{ background: '#FFF8E8', borderRadius: 10, padding: '10px 14px',
                    border: '1.5px solid #E8D5A3' }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{evObj?.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{ev}</div>
                    <input type="number" className="form-input" style={{ padding: '6px 10px', fontSize: 13 }}
                      placeholder={`~${wedding.total_guests}`}
                      value={wedding.guest_counts_by_event?.[ev] || ''}
                      onChange={e => update('guest_counts_by_event', {
                        ...wedding.guest_counts_by_event, [ev]: parseInt(e.target.value)
                      })} />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Accommodation */}
      <div className="section-card">
        <div className="section-title">🛏️ Accommodation</div>
        <div className="section-subtitle">For outstation guests requiring hotel stay</div>
        <SingleImageSelector items={HOTEL_TIERS} selected={wedding.hotel_tier}
          onChange={(v) => update('hotel_tier', v)} />

        {outstationFlag && (
          <div style={{ marginTop: 16, padding: '14px 18px', background: '#E8F5E9',
            borderRadius: 12, border: '1.5px solid #A5D6A7' }}>
            <div style={{ fontWeight: 700, color: '#2E7D32', fontSize: 14, marginBottom: 4 }}>
              🏨 Auto-calculated Rooms
            </div>
            <div style={{ fontSize: 13, color: '#388E3C' }}>
              {wedding.outstation_guests} outstation guests ÷{' '}
              {HOTEL_TIERS.find(t => t.id === wedding.hotel_tier)?.ppr || 2} per room ={' '}
              <strong>{roomsNeeded} rooms needed</strong>
            </div>
            <div style={{ fontSize: 12, color: '#66BB6A', marginTop: 4 }}>
              ✅ Outstation flag activated — logistics & transfers will be pre-filled in Tab 7
            </div>
          </div>
        )}
      </div>

      {/* Hometowns */}
      <div className="section-card">
        <div className="section-title">🏠 Bride & Groom Hometowns</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="form-label">Bride's Hometown</label>
            <select className="form-select" value={wedding.bride_hometown}
              onChange={e => update('bride_hometown', e.target.value)}>
              <option value="">-- Select City --</option>
              {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Groom's Hometown</label>
            <select className="form-select" value={wedding.groom_hometown}
              onChange={e => update('groom_hometown', e.target.value)}>
              <option value="">-- Select City --</option>
              {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
