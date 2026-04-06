import { useState } from 'react'

export function ImageCard({ item, selected, onClick, showCost = false, hasAnySelected = false }) {
  const [imgError, setImgError] = useState(false)
  const fallbackBg = item.fallbackColor || '#4A5568'
  const cardStyle = {
    minHeight: 120,
    borderRadius: 12,
    cursor: 'pointer',
    border: selected ? '2px solid #C9A84C' : '2px solid transparent',
    transition: 'all 0.2s ease',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '14px 12px 12px',
    boxShadow: selected ? '0 0 0 3px rgba(201,168,76,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
    backgroundColor: fallbackBg,
    backgroundImage: !imgError && item.imageUrl
      ? `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url(${item.imageUrl})`
      : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    overflow: 'hidden',
  }

  return (
    <div
      className={`image-card sel-card ${selected ? 'selected' : ''} ${hasAnySelected && !selected ? 'dimmed' : ''}`}
      onClick={() => onClick(item.id)}
      title={item.label}
      style={cardStyle}
    >
      {item.imageUrl && !imgError && (
        <img
          src={item.imageUrl}
          alt=""
          onError={() => setImgError(true)}
          style={{ display: 'none' }}
        />
      )}
      {!item.imageUrl || imgError ? (
        <div className="card-emoji sel-card-icon" style={{ fontSize: 28, marginBottom: 8 }}>
          {item.emoji || '•'}
        </div>
      ) : null}
      <div className="card-label" style={{
        overflow: 'hidden',
        maxWidth: '100%',
        fontWeight: 700,
        fontSize: 16,
        color: '#fff',
        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
      }}>
        {item.label}
      </div>
      {showCost && item.cost && (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600, textAlign: 'center', paddingTop: 4 }}>
          {item.cost}
        </div>
      )}
      {showCost && item.desc && !item.cost && (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600, textAlign: 'center', paddingTop: 4 }}>
          {item.desc}
        </div>
      )}
      {/* Rose checkmark badge — springs in via CSS when .selected */}
      <span
        className="check-badge-rose"
        style={{
          position: 'absolute', top: 7, right: 7,
          width: 22, height: 22, borderRadius: '50%',
          background: '#C9A84C', color: '#111',
          fontSize: 12, fontWeight: 800,
          alignItems: 'center', justifyContent: 'center',
          display: selected ? 'flex' : 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          animation: selected ? 'checkSpring 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none'
        }}
      >✓</span>
    </div>
  )
}

export function MultiImageSelector({ items, selected = [], onChange, showCost = false }) {
  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter(x => x !== id))
    else onChange([...selected, id])
  }
  const hasAny = selected.length > 0
  return (
    <div className="image-grid">
      {items.map(item => (
        <ImageCard
          key={item.id} item={item}
          selected={selected.includes(item.id)}
          hasAnySelected={hasAny && !selected.includes(item.id)}
          onClick={toggle} showCost={showCost}
        />
      ))}
    </div>
  )
}

export function SingleImageSelector({ items, selected, onChange, showCost = false }) {
  const hasAny = !!selected
  return (
    <div className="image-grid">
      {items.map(item => (
        <ImageCard
          key={item.id} item={item}
          selected={selected === item.id}
          hasAnySelected={hasAny && selected !== item.id}
          onClick={(id) => onChange(id === selected ? '' : id)}
          showCost={showCost}
        />
      ))}
    </div>
  )
}
