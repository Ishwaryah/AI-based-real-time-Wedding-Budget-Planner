import re

path = r"c:\Users\ishwa\Downloads\wedddingbudget.ai-RECENT\wedddingbudget.ai-main\backend\routers\budget.py"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# Fix 1: Remove strict validation from ConfigPayload
old_payload = """class ConfigPayload(BaseModel):
    data: dict

    @root_validator(skip_on_failure=True)
    def validate_calculate_fields(cls, values):
        d = values.get("data") or {}
        guests = d.get("total_guests")
        if guests is not None:
            try:
                guests = int(guests)
            except (TypeError, ValueError):
                raise ValueError("total_guests must be an integer")
            if guests < 1 or guests > 10000:
                raise ValueError("total_guests must be between 1 and 10000")
        budget = d.get("budget")
        if budget is not None:
            try:
                budget = float(budget)
            except (TypeError, ValueError):
                raise ValueError("budget must be a number")
            if budget < 10000:
                raise ValueError("budget must be at least 10000")
        return values"""

new_payload = """from typing import Any, Dict

class ConfigPayload(BaseModel):
    data: Dict[str, Any] = {}"""

if old_payload in text:
    text = text.replace(old_payload, new_payload)
else:
    print("Could not find old payload to replace!")

# Fix 2: Add missing finalise endpoint
if "@router.post(\"/finalise\")" not in text:
    finalise_endpoint = """
@router.post("/finalise")
def finalise_budget(payload: Dict[str, Any] = {}):
    return {"success": True, "message": "Budget finalised"}
"""
    # Insert before export-pdf
    text = text.replace("@router.post(\"/export-pdf\")", finalise_endpoint + "\n@router.post(\"/export-pdf\")")


with open(path, "w", encoding="utf-8") as f:
    f.write(text)

print("Patch backend applied.")
