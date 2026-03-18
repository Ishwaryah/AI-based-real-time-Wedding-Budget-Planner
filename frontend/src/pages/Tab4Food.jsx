import { useWedding, FOOD_CATEGORIES, FOOD_TIERS, BAR_TYPES, SPECIALTY_COUNTERS, ALL_EVENTS, formatRupees } from '../context/WeddingContext'
import { MultiImageSelector, SingleImageSelector } from '../components/ImageCard'

export default function Tab4Food() {
  const { wedding, update } = useWedding()

  const estimatedFoodCost = () => {
    const tier = { Extravaganza: 375, High: 1100, Modern: 3000 }[wedding.food_budget_tier] || 500
    const bar = { 'Dry Event': 0, 'Beer-Wine': 300, 'Full Bar': 800 }[wedding.bar_type] || 0
    const specialty = (wedding.specialty_counters?.length || 0) * 20000
    const events = wedding.events?.length || 1
    return (tier + bar) * (wedding.total_guests || 200) * events + specialty
  }

  return (
    <div>
      <div className="section-card">
        <div className="section-title">🥗 Food Category</div>
        <div className="section-subtitle">Select all cuisine types to be served</div>
        <MultiImageSelector items={FOOD_CATEGORIES} selected={wedding.food_categories || []}
          onChange={v => update('food_categories', v)} />
      </div>

      <div className="section-card">
        <div className="section-title">🍽️ Food Budget Tier</div>
        <div className="section-subtitle">Sets per-plate cost for all events</div>
        <SingleImageSelector items={FOOD_TIERS} selected={wedding.food_budget_tier}
          onChange={v => update('food_budget_tier', v)} showCost />
      </div>

      <div className="section-card">
        <div className="section-title">🍸 Bar Type</div>
        <SingleImageSelector items={BAR_TYPES} selected={wedding.bar_type}
          onChange={v => update('bar_type', v)}
          showCost />
      </div>

      <div className="section-card">
        <div className="section-title">🎪 Specialty Counters</div>
        <div className="section-subtitle">Add-on counters across all events</div>
        <MultiImageSelector items={SPECIALTY_COUNTERS} selected={wedding.specialty_counters || []}
          onChange={v => update('specialty_counters', v)} />
      </div>

      {wedding.food_budget_tier && (
        <div className="section-card" style={{ background: 'linear-gradient(135deg,#FFF8E8,#FDF8F0)', border: '1.5px solid #C9A84C' }}>
          <div className="section-title" style={{ color: '#8B6914' }}>💰 Live Food Cost Estimate</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginTop: 12 }}>
            {[
              { label: 'Per-head food', value: formatRupees({ Extravaganza: 375, High: 1100, Modern: 3000 }[wedding.food_budget_tier] || 500) },
              { label: 'Bar per head', value: formatRupees({ 'Dry Event': 0, 'Beer-Wine': 300, 'Full Bar': 800 }[wedding.bar_type] || 0) },
              { label: 'Specialty counters', value: formatRupees((wedding.specialty_counters?.length || 0) * 20000) },
            ].map(item => (
              <div key={item.label} style={{ background: 'white', borderRadius: 12, padding: 16, textAlign: 'center', border: '1px solid #E8D5A3' }}>
                <div style={{ fontSize: 12, color: '#9A9A9A', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, fontWeight: 700, color: '#C9A84C' }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#8B6914' }}>Estimated Total Food & Beverage</div>
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 34, fontWeight: 700, color: '#6B1F2A' }}>
              {formatRupees(estimatedFoodCost())}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
