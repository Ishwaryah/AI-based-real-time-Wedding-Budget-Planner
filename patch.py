import re

path = r"c:\Users\ishwa\Downloads\wedddingbudget.ai-RECENT\wedddingbudget.ai-main\frontend\src\pages\Tab8Budget.jsx"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update calculateBudget()
calc_old = """  const calculateBudget = async () => {
    setLoading(true); setScenLoading(true)
    try {
      const budRes = await fetch(`${API}/budget/calculate`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ data: wedding })
      })
      const budData = await budRes.json()
      setBudget(budData)
      // Fetch scenarios in parallel
      try {
        const scenRes = await fetch(`${API}/budget/scenarios`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ data: wedding })
        })
        setScenarios(await scenRes.json())
      } catch {
        setScenarios(null)
      }
    } catch {
      // Offline fallback"""

calc_new = """  const calculateBudget = async () => {
    setLoading(true); setScenLoading(true)
    try {
      const budRes = await fetch(`${API}/budget/calculate`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ data: wedding })
      })
      if (!budRes.ok) {
        throw new Error(`API returned status ${budRes.status}`)
      }
      const budData = await budRes.json()
      // Check expected fields
      if (!budData || !budData.total || typeof budData.total.mid === 'undefined') {
        throw new Error('API response missing expected fields (total.mid)')
      }
      setBudget(budData)
      // Fetch scenarios in parallel
      try {
        const scenRes = await fetch(`${API}/budget/scenarios`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ data: wedding })
        })
        setScenarios(await scenRes.json())
      } catch (err) {
        console.error('Scenarios API failed:', err)
        setScenarios(null)
      }
    } catch (err) {
      console.error('calculateBudget failed. Using offline estimate.', err)
      showToast('Backend unavailable, using offline estimate', 'error')
      // Offline fallback"""

text = text.replace(calc_old, calc_new)

# 2. Add null safety to budget render code
text = re.sub(r'budget\.items\|\|\{\}', r'(budget?.items || {})', text)
text = re.sub(r'budget\.items\?\.\[cat\]\?\.mid( \S\S 0)?', r'(budget?.items?.[cat]?.mid || 0)', text)
text = re.sub(r'budget\.items', r'(budget?.items || {})', text)
# Undo double replacements
text = text.replace(r'((budget?.items || {}) || {})', r'(budget?.items || {})')

text = re.sub(r'budget\.total\.mid', r'(budget?.total?.mid || 0)', text)
text = re.sub(r'budget\.total\.low', r'(budget?.total?.low || 0)', text)
text = re.sub(r'budget\.total\.high', r'(budget?.total?.high || 0)', text)
text = re.sub(r'budget\.confidence_score', r'(budget?.confidence_score || 0)', text)
text = re.sub(r'budget\.rl_active', r'(budget?.rl_active || false)', text)

# `formatRupees` handles number, but just to be sure we can make sure values passed are protected
text = re.sub(r'formatRupees\((\w+)\.low\)', r'formatRupees(\1?.low || 0)', text)
text = re.sub(r'formatRupees\((\w+)\.mid\)', r'formatRupees(\1?.mid || 0)', text)
text = re.sub(r'formatRupees\((\w+)\.high\)', r'formatRupees(\1?.high || 0)', text)

text = re.sub(r'formatRupees\((\w+)\.value\)', r'formatRupees(\1?.value || 0)', text)

# Re-fix `budget?.total` replacing inside things if needed:
# Object.keys((budget?.items || {}))

with open(path, "w", encoding="utf-8") as f:
    f.write(text)
    
print("Patched.")
