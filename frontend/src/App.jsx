import { useState } from 'react'
import { WeddingProvider, useWedding, formatRupees } from './context/WeddingContext'
import Tab1Style from './pages/Tab1Style'
import Tab2Venue from './pages/Tab2Venue'
import Tab3Decor from './pages/Tab3Decor'
import Tab4Food from './pages/Tab4Food'
import Tab5Artists from './pages/Tab5Artists'
import { Tab6Sundries, Tab7Logistics } from './pages/Tab6and7'
import Tab8Budget from './pages/Tab8Budget'

const TABS = [
  { id: 0, label: '💒 Style',      short: 'Style' },
  { id: 1, label: '🏛️ Venue',      short: 'Venue' },
  { id: 2, label: '🎨 Decor AI',   short: 'Decor' },
  { id: 3, label: '🍽️ Food',       short: 'Food' },
  { id: 4, label: '🎤 Artists',    short: 'Artists' },
  { id: 5, label: '🧺 Sundries',   short: 'Sundries' },
  { id: 6, label: '🚐 Logistics',  short: 'Logistics' },
  { id: 7, label: '💰 Budget',     short: 'Budget' },
]

function BudgetStatusBar() {
  const { wedding } = useWedding()
  const est = (wedding.decor_total || 400000) + (wedding.artists_total || 350000) + (wedding.logistics_total || 120000) +
    (wedding.total_guests || 200) * 1100 * Math.max(1, (wedding.events || []).length)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 24px',
      background: 'linear-gradient(90deg,#6B1F2A,#8B6914)', color: 'white' }}>
      <div style={{ fontSize: 22 }}>💍</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>
          Shaadi.AI
        </div>
        <div style={{ fontSize: 11, opacity: 0.8 }}>AI Wedding Planner</div>
      </div>
      {wedding.wedding_type && (
        <div style={{ fontSize: 12, background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 20 }}>
          {wedding.wedding_type} Wedding
        </div>
      )}
      {wedding.wedding_city && (
        <div style={{ fontSize: 12, background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 20 }}>
          📍 {wedding.wedding_city}
        </div>
      )}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 11, opacity: 0.8 }}>Running Estimate</div>
        <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 20, fontWeight: 700, color: '#FFD700' }}>
          {formatRupees(est)}
        </div>
      </div>
    </div>
  )
}

function AppInner() {
  const [activeTab, setActiveTab] = useState(0)

  const pages = [
    <Tab1Style />, <Tab2Venue />, <Tab3Decor />, <Tab4Food />,
    <Tab5Artists />, <Tab6Sundries />, <Tab7Logistics />, <Tab8Budget />
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <BudgetStatusBar />

      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', padding: '24px 20px', flex: 1 }}>
        {/* Tab Navigation */}
        <div style={{ marginBottom: 28 }}>
          <div className="tab-nav">
            {TABS.map(tab => (
              <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 4, marginTop: 10, justifyContent: 'center' }}>
            {TABS.map(tab => (
              <div key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ width: activeTab === tab.id ? 24 : 8, height: 8, borderRadius: 4,
                  background: activeTab === tab.id ? '#C9A84C' : '#E8D5A3',
                  transition: 'all 0.3s', cursor: 'pointer' }} />
            ))}
          </div>
        </div>

        {/* Active page */}
        <div key={activeTab} style={{ animation: 'fadeIn 0.3s ease' }}>
          {pages[activeTab]}
        </div>

        {/* Next / Back */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20,
          borderTop: '1px solid #E8D5A3' }}>
          <button onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
            disabled={activeTab === 0}
            style={{ padding: '10px 24px', borderRadius: 12, border: '2px solid #E8D5A3',
              background: activeTab === 0 ? '#F5EDD8' : 'white', cursor: activeTab === 0 ? 'not-allowed' : 'pointer',
              color: '#8B6914', fontWeight: 700, fontSize: 14 }}>
            ← Back
          </button>
          <div style={{ fontSize: 13, color: '#9A9A9A', alignSelf: 'center' }}>
            Step {activeTab + 1} of {TABS.length}
          </div>
          {activeTab < TABS.length - 1 ? (
            <button onClick={() => setActiveTab(Math.min(TABS.length - 1, activeTab + 1))}
              className="btn-primary">
              Next →
            </button>
          ) : (
            <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#4CAF50,#2E7D32)' }}>
              ✅ Finalise
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  )
}

export default function App() {
  return (
    <WeddingProvider>
      <AppInner />
    </WeddingProvider>
  )
}
