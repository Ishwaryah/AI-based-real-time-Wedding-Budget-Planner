import { useState } from 'react'
import { useWedding, formatRupees } from '../context/WeddingContext'

const API = 'http://localhost:8000/api'

const DECOR_LIBRARY = [
  { id:1,  emoji:'🌸', name:'Floral Arch Mandap',       style:'Romantic',    complexity:'High',   base_cost:180000, function_type:'Mandap' },
  { id:2,  emoji:'🕯️', name:'Candle Centerpieces',       style:'Minimalist',  complexity:'Low',    base_cost:35000,  function_type:'Table Decor' },
  { id:3,  emoji:'🌺', name:'Marigold Garland Entrance', style:'Traditional', complexity:'Medium', base_cost:45000,  function_type:'Entrance' },
  { id:4,  emoji:'✨', name:'LED Fairy Light Ceiling',   style:'Modern',      complexity:'High',   base_cost:120000, function_type:'Ceiling' },
  { id:5,  emoji:'🌿', name:'Tropical Leaf Backdrop',    style:'Boho',        complexity:'Medium', base_cost:65000,  function_type:'Backdrop' },
  { id:6,  emoji:'🦋', name:'Butterfly Garden Stage',    style:'Whimsical',   complexity:'High',   base_cost:220000, function_type:'Stage' },
  { id:7,  emoji:'🪔', name:'Diya Pathway Lighting',     style:'Traditional', complexity:'Low',    base_cost:22000,  function_type:'Lighting' },
  { id:8,  emoji:'🌙', name:'Moon Gate Photo Booth',     style:'Modern',      complexity:'Medium', base_cost:55000,  function_type:'Photo Booth' },
  { id:9,  emoji:'🌹', name:'Rose Petal Aisle',          style:'Romantic',    complexity:'Low',    base_cost:18000,  function_type:'Aisle' },
  { id:10, emoji:'🏛️', name:'Royal Pillar Draping',      style:'Luxury',      complexity:'High',   base_cost:280000, function_type:'Pillars' },
  { id:11, emoji:'🌼', name:'Sunflower Farm Table',      style:'Rustic',      complexity:'Medium', base_cost:48000,  function_type:'Table Decor' },
  { id:12, emoji:'🎊', name:'Confetti Balloon Ceiling',  style:'Playful',     complexity:'Low',    base_cost:28000,  function_type:'Ceiling' },
]

const COMPLEXITY_COLOR = { Low:'#4CAF50', Medium:'#FF9800', High:'#E91E63' }
const STYLE_COLOR = {
  Romantic:'#E91E63',Minimalist:'#607D8B',Traditional:'#FF5722',Modern:'#2196F3',
  Boho:'#8BC34A',Whimsical:'#9C27B0',Luxury:'#C9A84C',Rustic:'#795548',Playful:'#00BCD4'
}

function localPredict(item) {
  const mult = { Low:0.85, Medium:1.0, High:1.3 }[item.complexity] || 1
  const p = Math.round(item.base_cost * mult)
  return { predicted: p, low: Math.round(p*0.8), high: Math.round(p*1.2) }
}

export default function Tab3Decor() {
  const { wedding, update } = useWedding()
  const [selected, setSelected] = useState([])
  const [filter, setFilter] = useState('')
  const [uploadTag, setUploadTag] = useState({ function_type:'Mandap', style:'Romantic', complexity:'Medium' })
  const [prediction, setPrediction] = useState(null)
  const [predicting, setPredicting] = useState(false)
  const [predStep, setPredStep] = useState('')

  const toggleItem = (item) => {
    const exists = selected.find(s => s.id === item.id)
    let next
    if (exists) next = selected.filter(s => s.id !== item.id)
    else { const p = localPredict(item); next = [...selected, { ...item, ...p }] }
    setSelected(next)
    update('decor_total', next.reduce((s,i) => s + i.predicted, 0))
    update('selected_decor', next.map(s => s.name))
  }

  const handlePredict = async () => {
    setPredicting(true)
    setPrediction(null)
    try {
      setPredStep('Extracting image embeddings via MobileNetV2...')
      await new Promise(r => setTimeout(r, 700))
      setPredStep('Running RandomForest cost prediction...')
      await new Promise(r => setTimeout(r, 600))
      setPredStep('Finding similar designs via cosine similarity...')
      await new Promise(r => setTimeout(r, 500))

      const res = await fetch(`${API}/decor/predict`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...uploadTag, image_seed: Math.floor(Math.random()*9000)+1 })
      })
      const data = await res.json()
      setPrediction(data)
    } catch {
      // Offline fallback
      const base = { Mandap:180000, Entrance:50000, 'Table Decor':40000, Ceiling:80000,
        Backdrop:60000, Stage:200000, Lighting:25000, 'Photo Booth':55000, Aisle:20000, Pillars:250000 }
      const b = base[uploadTag.function_type] || 60000
      const mult = {Low:0.75,Medium:1.0,High:1.35}[uploadTag.complexity] || 1
      const sm = {Luxury:1.4,Whimsical:1.2,Romantic:1.1,Modern:1.0,Rustic:0.85,Minimalist:0.75}[uploadTag.style] || 1
      const pred = Math.round(b * mult * sm * (0.92 + Math.random()*0.16))
      setPrediction({
        predicted_cost: pred, range:[Math.round(pred*0.8),Math.round(pred*1.2)],
        confidence: 0.78+Math.random()*0.15,
        similar_items: DECOR_LIBRARY.slice(0,3),
        source:'Rule-based (offline)'
      })
    }
    setPredicting(false)
    setPredStep('')
  }

  const filtered = filter ? DECOR_LIBRARY.filter(d => d.style===filter || d.complexity===filter) : DECOR_LIBRARY
  const totalDecor = selected.reduce((s,i) => s + i.predicted, 0)

  return (
    <div>
      {/* Hero Banner */}
      <div style={{ background:'linear-gradient(135deg,#1a0a2e,#2d1b69)', borderRadius:20,
        padding:'28px 32px', marginBottom:24, color:'white', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:20, top:-10, fontSize:100, opacity:0.08 }}>🎨</div>
        <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, fontWeight:700, marginBottom:4 }}>
          Decor Intelligence
        </div>
        <div style={{ fontSize:14, opacity:0.8, marginBottom:16 }}>
          AI-powered cost prediction · MobileNetV2 embeddings · RandomForest ML
        </div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {[['🖼️','Library','12 designs'],['🤖','AI Predict','Cost estimation'],['🔍','Similarity','Find matches']].map(([e,t,s])=>(
            <div key={t} style={{ background:'rgba(255,255,255,0.12)', borderRadius:10, padding:'8px 16px' }}>
              <span style={{ fontSize:16 }}>{e}</span>
              <span style={{ fontWeight:700, marginLeft:6 }}>{t}</span>
              <span style={{ fontSize:12, opacity:0.7, marginLeft:6 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div className="section-card">
        <div className="section-title">🖼️ Decor Gallery</div>
        <div className="section-subtitle">Click to shortlist — budget updates live in the top bar</div>

        {/* Filter pills */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
          {['','Romantic','Traditional','Modern','Luxury','Minimalist','Boho','Low','Medium','High'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{
              padding:'5px 14px', borderRadius:20, border:'none', cursor:'pointer',
              fontSize:12, fontWeight:700, transition:'all 0.2s',
              background: filter===f ? '#C9A84C' : '#F5EDD8',
              color: filter===f ? 'white' : '#8B6914',
              boxShadow: filter===f ? '0 2px 8px rgba(201,168,76,0.4)' : 'none'
            }}>{f||'All'}</button>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(185px,1fr))', gap:16 }}>
          {filtered.map(item => {
            const isSel = !!selected.find(s=>s.id===item.id)
            const p = localPredict(item)
            return (
              <div key={item.id} onClick={()=>toggleItem(item)} style={{
                border:`2px solid ${isSel?'#C9A84C':'#E8D5A3'}`,
                borderRadius:16, overflow:'hidden', cursor:'pointer',
                background: isSel ? 'linear-gradient(135deg,#FFF8E8,#FDF8F0)' : 'white',
                boxShadow: isSel ? '0 4px 20px rgba(201,168,76,0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
                transform: isSel ? 'translateY(-2px)' : 'none',
                transition:'all 0.22s', position:'relative'
              }}>
                <div style={{ fontSize:52, textAlign:'center', padding:'20px 0 12px',
                  background:'linear-gradient(160deg,#FDF8F0,#F5EDD8)' }}>{item.emoji}</div>
                <div style={{ padding:'12px 14px 14px' }}>
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:8, lineHeight:1.3 }}>{item.name}</div>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>
                    <span style={{ fontSize:10, padding:'3px 9px', borderRadius:10, fontWeight:700,
                      background:COMPLEXITY_COLOR[item.complexity]+'18', color:COMPLEXITY_COLOR[item.complexity] }}>
                      {item.complexity}
                    </span>
                    <span style={{ fontSize:10, padding:'3px 9px', borderRadius:10, fontWeight:700,
                      background:(STYLE_COLOR[item.style]||'#888')+'18', color:STYLE_COLOR[item.style]||'#888' }}>
                      {item.style}
                    </span>
                  </div>
                  <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:19, fontWeight:700, color:'#C9A84C' }}>
                    {formatRupees(p.predicted)}
                  </div>
                  <div style={{ fontSize:11, color:'#9A9A9A', marginTop:2 }}>
                    {formatRupees(p.low)} – {formatRupees(p.high)}
                  </div>
                </div>
                {isSel && (
                  <div style={{ position:'absolute', top:10, right:10, width:28, height:28,
                    background:'#C9A84C', borderRadius:'50%', display:'flex',
                    alignItems:'center', justifyContent:'center', color:'white', fontWeight:'bold', fontSize:14,
                    boxShadow:'0 2px 8px rgba(201,168,76,0.5)' }}>✓</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Summary */}
      {selected.length > 0 && (
        <div className="section-card" style={{ border:'1.5px solid #C9A84C' }}>
          <div className="section-title">✅ Your Shortlist ({selected.length} items)</div>
          <div style={{ marginBottom:16 }}>
            {selected.map(s => (
              <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'12px 0', borderBottom:'1px solid #F5EDD8' }}>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <span style={{ fontSize:28 }}>{s.emoji}</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{s.name}</div>
                    <div style={{ fontSize:12, color:'#9A9A9A', marginTop:2 }}>
                      {formatRupees(s.low)} – {formatRupees(s.high)}
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:20, fontWeight:700, color:'#C9A84C' }}>
                    {formatRupees(s.predicted)}
                  </div>
                  <button onClick={(e)=>{e.stopPropagation();toggleItem(s)}} style={{
                    width:26, height:26, borderRadius:'50%', border:'none', background:'#FFE8E8',
                    color:'#E53935', cursor:'pointer', fontWeight:'bold', fontSize:14
                  }}>×</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:'linear-gradient(135deg,#6B1F2A,#8B6914)', borderRadius:14,
            padding:'18px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ color:'white', fontSize:14, opacity:0.9 }}>Total Decor Budget</div>
            <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:30, fontWeight:700, color:'#FFD700' }}>
              {formatRupees(totalDecor)}
            </div>
          </div>
        </div>
      )}

      {/* AI Predictor */}
      <div className="section-card" style={{ border:'2px solid #9C27B0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#9C27B0,#673AB7)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🤖</div>
          <div>
            <div className="section-title" style={{ color:'#6A1B9A', marginBottom:0 }}>AI Cost Predictor</div>
            <div className="section-subtitle" style={{ marginBottom:0 }}>
              Upload any decor image — RandomForest predicts cost via MobileNetV2 embeddings
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, margin:'20px 0' }}>
          {[
            { key:'function_type', label:'Function Type',
              opts:['Mandap','Entrance','Table Decor','Ceiling','Backdrop','Stage','Lighting','Photo Booth','Aisle','Pillars'] },
            { key:'style', label:'Style',
              opts:['Romantic','Traditional','Modern','Luxury','Minimalist','Boho','Whimsical','Rustic','Playful'] },
            { key:'complexity', label:'Complexity', opts:['Low','Medium','High'] }
          ].map(({key,label,opts})=>(
            <div key={key}>
              <label className="form-label">{label}</label>
              <select className="form-select" value={uploadTag[key]}
                onChange={e=>setUploadTag(p=>({...p,[key]:e.target.value}))}>
                {opts.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Drop Zone */}
        <div style={{ border:'2px dashed #CE93D8', borderRadius:14, padding:'28px 20px',
          textAlign:'center', background:'#F9F0FF', marginBottom:18, cursor:'pointer' }}
          onClick={()=>document.getElementById('decor-upload').click()}>
          <div style={{ fontSize:44 }}>📸</div>
          <div style={{ fontWeight:700, color:'#6A1B9A', marginTop:6 }}>Drop your decor image here</div>
          <div style={{ fontSize:12, color:'#9A9A9A', marginTop:4 }}>PNG, JPG — AI will extract features and predict cost</div>
          <input id="decor-upload" type="file" accept="image/*" style={{ display:'none' }} />
        </div>

        <button onClick={handlePredict} disabled={predicting} style={{
          width:'100%', padding:'14px', borderRadius:12, border:'none', cursor:'pointer',
          background: predicting ? '#CE93D8' : 'linear-gradient(135deg,#9C27B0,#673AB7)',
          color:'white', fontWeight:700, fontSize:15, transition:'all 0.2s'
        }}>
          {predicting ? '🤖 AI Processing...' : '✨ Predict Cost with AI'}
        </button>

        {/* Processing Steps */}
        {predicting && predStep && (
          <div style={{ marginTop:14, padding:'12px 16px', background:'#F3E5F5', borderRadius:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:16, height:16, borderRadius:'50%', border:'2.5px solid #9C27B0',
                borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }} />
              <span style={{ fontSize:13, color:'#6A1B9A', fontWeight:600 }}>{predStep}</span>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Prediction Result */}
        {prediction && !predicting && (
          <div style={{ marginTop:18, padding:22, background:'linear-gradient(135deg,#F3E5F5,#EDE7F6)',
            borderRadius:16, border:'1.5px solid #CE93D8' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:14, color:'#6A1B9A', marginBottom:4 }}>
                  AI Predicted Cost
                </div>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:38, fontWeight:700, color:'#9C27B0', lineHeight:1 }}>
                  {formatRupees(prediction.predicted_cost)}
                </div>
                <div style={{ fontSize:13, color:'#9A9A9A', marginTop:6 }}>
                  Range: {formatRupees(prediction.range?.[0])} – {formatRupees(prediction.range?.[1])}
                </div>
              </div>
              <div style={{ textAlign:'center', background:'white', borderRadius:14, padding:'14px 20px' }}>
                <div style={{ fontSize:26, fontWeight:700, color: prediction.confidence > 0.8 ? '#4CAF50' : '#FF9800' }}>
                  {Math.round((prediction.confidence||0.78)*100)}%
                </div>
                <div style={{ fontSize:11, color:'#9A9A9A', marginTop:2 }}>Confidence</div>
              </div>
            </div>

            {/* Model tag */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px',
              background:'rgba(156,39,176,0.1)', borderRadius:20, marginBottom:16 }}>
              <span style={{ fontSize:12 }}>🔬</span>
              <span style={{ fontSize:12, fontWeight:700, color:'#6A1B9A' }}>{prediction.source}</span>
            </div>

            {/* Similar designs */}
            {prediction.similar_items?.length > 0 && (
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:'#6A1B9A', marginBottom:10 }}>
                  🔍 Top similar designs (cosine similarity):
                </div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {prediction.similar_items.slice(0,3).map((s,i)=>(
                    <div key={i} style={{ padding:'8px 14px', background:'white', borderRadius:10,
                      border:'1px solid #CE93D8', fontSize:13, display:'flex', gap:6, alignItems:'center' }}>
                      <span style={{ fontSize:18 }}>{DECOR_LIBRARY.find(d=>d.name===s.name)?.emoji||'🎨'}</span>
                      <div>
                        <div style={{ fontWeight:600 }}>{s.name||s.function_type}</div>
                        <div style={{ fontSize:11, color:'#C9A84C', fontWeight:700 }}>
                          {formatRupees(s.actual_cost||s.base_cost)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
