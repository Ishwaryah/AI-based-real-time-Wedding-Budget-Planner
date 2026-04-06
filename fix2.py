import re

path_py = r"c:\Users\ishwa\Downloads\wedddingbudget.ai-RECENT\wedddingbudget.ai-main\backend\routers\budget.py"
with open(path_py, "r", encoding="utf-8") as f:
    text_py = f.read()

# Make sure Request is imported
if "from fastapi import Request" not in text_py:
    text_py = text_py.replace("from fastapi import APIRouter", "from fastapi import APIRouter, Request")
    
# We want to replace the functions:
# 1. calculate
cal_old = """@router.post("/calculate")
def calculate_budget(payload: ConfigPayload):
    return calculate_full_budget(payload.data)"""
cal_new = """@router.post("/calculate")
async def calculate_budget(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}
    data = body.get("data", body) if isinstance(body, dict) else {}
    return calculate_full_budget(data)"""

# 2. optimize
opt_old = """@router.post("/optimize")
def optimize_budget(payload: ConfigPayload):
    data = payload.data
    target = data.get("target_budget", 0)
    return run_pso_optimizer(data, target)"""
opt_new = """@router.post("/optimize")
async def optimize_budget(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}
    data = body.get("data", body) if isinstance(body, dict) else {}
    target = data.get("target_budget", 0) if isinstance(data, dict) else 0
    return run_pso_optimizer(data, target)"""

# 3. scenarios
scen_old = """@router.post("/scenarios")
def get_scenarios(payload: ConfigPayload):
    base       = calculate_full_budget(payload.data)
    base_total = base["total"]
    base_items = base["items"]

    configs = ["""
scen_new = """@router.post("/scenarios")
async def get_scenarios(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}
    data = body.get("data", body) if isinstance(body, dict) else {}
    base       = calculate_full_budget(data)
    base_total = base["total"]
    base_items = base["items"]

    configs = ["""
    
# 4. export-pdf
pdf_old = """@router.post("/export-pdf")
def export_pdf(payload: ConfigPayload):
    \"\"\"Generate a formatted PDF budget report.\"\"\"
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
        import io

        data = payload.data
        budget = calculate_full_budget(data)"""
pdf_new = """@router.post("/export-pdf")
async def export_pdf(request: Request):
    \"\"\"Generate a formatted PDF budget report.\"\"\"
    try:
        try:
            body = await request.json()
        except:
            body = {}
        data = body.get("data", body) if isinstance(body, dict) else {}
        
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
        import io

        budget = calculate_full_budget(data)"""

# In the except block of export-pdf:
pdf_old_fallback = """    except ImportError:
        # ReportLab not installed — return plain text fallback
        data2 = payload.data"""
pdf_new_fallback = """    except ImportError:
        # ReportLab not installed — return plain text fallback
        data2 = data"""

text_py = text_py.replace(cal_old, cal_new)
text_py = text_py.replace(opt_old, opt_new)
text_py = text_py.replace(scen_old, scen_new)
text_py = text_py.replace(pdf_old, pdf_new)
text_py = text_py.replace(pdf_old_fallback, pdf_new_fallback)

# It seems `data` is used in scenarios for `payload.data.get("venue_type")` etc. We must fix those!
# Let's use regex to replace payload.data with data globally.
# But `def optimize_budget` already had `payload.data` replaced? No, inside `configs` it's used.
text_py = text_py.replace("payload.data.get", "data.get")
text_py = text_py.replace("payload.data", "data")

with open(path_py, "w", encoding="utf-8") as f:
    f.write(text_py)

print("Backend payload fixed.")


path_js = r"c:\Users\ishwa\Downloads\wedddingbudget.ai-RECENT\wedddingbudget.ai-main\frontend\src\pages\Tab1Style.jsx"
with open(path_js, "r", encoding="utf-8") as f:
    text_js = f.read()

# Tab1Style.jsx duplicate key fix
js_old = """{EVENT_EMOJIS.map(em => (
                <button key={em} onClick={() => setNewEventEmoji(em)}"""
js_new = """{EVENT_EMOJIS.map((em, index) => (
                <button key={index} onClick={() => setNewEventEmoji(em)}"""

text_js = text_js.replace(js_old, js_new)

with open(path_js, "w", encoding="utf-8") as f:
    f.write(text_js)
print("Frontend JS fixed.")
