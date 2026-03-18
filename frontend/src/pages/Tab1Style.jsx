import { useWedding, WEDDING_TYPES, ALL_EVENTS } from '../context/WeddingContext'
import { MultiImageSelector, SingleImageSelector } from '../components/ImageCard'

export default function Tab1Style() {
  const { wedding, update } = useWedding()

  const handleDateChange = (e) => {
    const date = e.target.value
    const d = new Date(date)
    const dow = d.getDay()
    update('wedding_date', date)
    update('is_weekend', dow === 0 || dow === 6)
  }

  return (
    <div>
      {/* Date */}
      <div className="section-card">
        <div className="section-title">📅 Wedding Date</div>
        <div className="section-subtitle">Weekend dates incur a 15% venue surcharge</div>
        <input
          type="date"
          className="form-input"
          style={{ maxWidth: 280 }}
          value={wedding.wedding_date}
          onChange={handleDateChange}
        />
        {wedding.wedding_date && (
          <div style={{ marginTop: 10, padding: '8px 14px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 8,
            background: wedding.is_weekend ? '#FFF3E0' : '#E8F5E9',
            color: wedding.is_weekend ? '#E65100' : '#2E7D32', fontSize: 13, fontWeight: 700 }}>
            {wedding.is_weekend ? '⚠️ Weekend — +15% surcharge applies' : '✅ Weekday — Regular pricing'}
          </div>
        )}
      </div>

      {/* Wedding Type */}
      <div className="section-card">
        <div className="section-title">🪔 Wedding Type</div>
        <div className="section-subtitle">Select the primary ceremony tradition</div>
        <SingleImageSelector items={WEDDING_TYPES} selected={wedding.wedding_type}
          onChange={(v) => update('wedding_type', v)} />
      </div>

      {/* Budget Tier */}
      <div className="section-card">
        <div className="section-title">💰 Wedding Budget Style</div>
        <div className="section-subtitle">Sets the overall estimation scale</div>
        <SingleImageSelector
          items={[
            { id: "Luxury",     emoji: "👑", label: "Luxury",     desc: "No compromises" },
            { id: "Modest",     emoji: "🌸", label: "Modest",     desc: "Balanced & beautiful" },
            { id: "Minimalist", emoji: "🌿", label: "Minimalist", desc: "Intimate & elegant" },
          ]}
          selected={wedding.budget_tier}
          onChange={(v) => update('budget_tier', v)}
        />
      </div>

      {/* Events */}
      <div className="section-card">
        <div className="section-title">🎉 Wedding Events</div>
        <div className="section-subtitle">Select all events you want to celebrate</div>
        <MultiImageSelector items={ALL_EVENTS} selected={wedding.events}
          onChange={(v) => update('events', v)} />
        {wedding.events.length > 0 && (
          <div style={{ marginTop: 14, padding: '10px 16px', background: '#FFF8E8',
            borderRadius: 10, fontSize: 13, color: '#8B6914' }}>
            🎊 <strong>{wedding.events.length} events</strong> selected —
            {' ' + wedding.events.join(', ')}
          </div>
        )}
      </div>
    </div>
  )
}
