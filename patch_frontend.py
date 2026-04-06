import re

path = r"c:\Users\ishwa\Downloads\wedddingbudget.ai-RECENT\wedddingbudget.ai-main\frontend\src\pages\Tab8Budget.jsx"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# Make sure we import Fragment
text = text.replace("import { useState, useEffect, useRef } from 'react'", "import React, { useState, useEffect, useRef } from 'react'")

# Replace `return (<>` with `return (<React.Fragment key={name}>` 
# Wait, it's safer to locate the EXACT string:
target = "return (<>"
if target in text:
    text = text.replace(target, "return (<React.Fragment key={name}>")
    text = text.replace("</>)", "</React.Fragment>)")

with open(path, "w", encoding="utf-8") as f:
    f.write(text)

print("Patch frontend applied.")
