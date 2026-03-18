export function ImageCard({ item, selected, onClick, showCost = false }) {
  return (
    <div
      className={`image-card ${selected ? 'selected' : ''}`}
      onClick={() => onClick(item.id)}
      title={item.desc || item.label}
    >
      <div className="card-emoji">{item.emoji}</div>
      <div className="card-label">{item.label}</div>
      {showCost && item.cost && (
        <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700, textAlign: 'center', paddingBottom: 6 }}>
          {item.cost}
        </div>
      )}
      {item.desc && !showCost && (
        <div style={{ fontSize: 11, color: '#9A9A9A', textAlign: 'center', paddingBottom: 6 }}>
          {item.desc}
        </div>
      )}
      <span className="check-badge">✓</span>
    </div>
  )
}

export function MultiImageSelector({ items, selected = [], onChange, showCost = false }) {
  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter(x => x !== id))
    else onChange([...selected, id])
  }
  return (
    <div className="image-grid">
      {items.map(item => (
        <ImageCard key={item.id} item={item} selected={selected.includes(item.id)}
          onClick={toggle} showCost={showCost} />
      ))}
    </div>
  )
}

export function SingleImageSelector({ items, selected, onChange, showCost = false }) {
  return (
    <div className="image-grid">
      {items.map(item => (
        <ImageCard key={item.id} item={item} selected={selected === item.id}
          onClick={(id) => onChange(id === selected ? '' : id)} showCost={showCost} />
      ))}
    </div>
  )
}
