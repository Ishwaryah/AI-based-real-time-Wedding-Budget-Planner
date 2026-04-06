import os
import re

# Comprehensive regex to match emojis
EMOJI_REGEX = re.compile(
    r'['
    r'\U0001F600-\U0001F64F'  # Emoticons
    r'\U0001F300-\U0001F5FF'  # Misc Symbols and Pictographs
    r'\U0001F680-\U0001F6FF'  # Transport and Map
    r'\U0001F1E6-\U0001F1FF'  # Regional country flags
    r'\U00002600-\U000026FF'  # Misc symbols
    r'\U00002700-\U000027BF'  # Dingbats
    r'\U0000FE0F'             # Variation Selector-16
    r'\U0001F900-\U0001F9FF'  # Supplemental Symbols and Pictographs
    r'\U0001FA70-\U0001FAFF'  # Symbols and Pictographs Extended-A
    r'\U0001F018-\U0001F270'  # Various asian characters and enclosed alphanumeric
    r'\U00002300-\U000023FF'  # Misc Technical
    r'\u200d'                 # Zero Width Joiner
    r']+'
)

def remove_emoji_and_space(s):
    # Additional manual replacement for specific emojis noted by the user
    emojis_to_replace = [
        "🚐", "💒", "👰", "✈️", "🚆", "🚗", "🚌", "📍", "🤵", "🐎", "🥁", "✨", "🌸", 
        "🚗", "🧺", "👑", "🌿", "📋", "🎁", "📨", "🪔", "📸", "💄", "⚡", "⭐", "🎤", 
        "🥗", "🍽️", "🍸", "🎪", "⚙️", "🖼️", "✨", "🪔", "🏛️", "🤖", "📸", "🖼️", 
        "🏛️", "📍", "👥", "🌿", "🛏️", "🏠", "👰", "🤵", "📅", "💒", "💎", "🎉", "🌸",
        "⚙", "✅", "✓", "💯", "🍾", "🥂", "🎈", "🎊", "💰", "💸", "💳", "🪷", "📝", 
        "💡", "🧠", "⬇", "🖨", "🔗", "⭐", "🔐", "⚠", "📈", "📉", "📊", "🔥", "💕", "🤍"
    ]
    
    for e in emojis_to_replace:
        s = s.replace(e + " ", "")
        s = s.replace(e, "")
        
    # Regex generic match
    matches = reversed(list(EMOJI_REGEX.finditer(s)))
    new_s = s
    for m in matches:
        start, end = m.span()
        # Look if there's a space after it
        if end < len(new_s) and new_s[end] == ' ':
            new_s = new_s[:start] + new_s[end+1:]
        else:
            new_s = new_s[:start] + new_s[end:]
    return new_s

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    new_lines = []
    
    in_whatsapp_block = False
    in_decor_library = False
    
    for i, line in enumerate(lines):
        # State tracking for exclusions
        if 'const msg = `🪷 *WeddingBudget' in line:
             in_whatsapp_block = True
        if in_whatsapp_block and 'window.open' in line and 'wa.me' in line:
             in_whatsapp_block = False
             
        if 'export const DECOR_LIBRARY' in line or 'const DECOR_LIBRARY' in line:
             in_decor_library = True
        if in_decor_library and ']' in line and not '{' in line:
             if i > 100:
                in_decor_library = False
        
        # We can just ignore lines matching 'emoji:' for decor cards
        is_decor_emoji = ("emoji:" in line or "emoji :" in line) and '{' in line
        # Toast messages exclusion
        is_toast = "toast" in line.lower() or "showToast" in line or "toast(" in line or "toast." in line or 'msg = `🪷' in line or 'toast.type' in line or 'showToast(' in line
        # Whatsapp block
        is_whatsapp = in_whatsapp_block or "Share on WhatsApp" in line or "wa.me" in line
        
        if is_whatsapp or is_toast or is_decor_emoji:
            new_lines.append(line)
        else:
            cleaned = remove_emoji_and_space(line)
            # Clean empty spans
            cleaned = cleaned.replace('<span style={{ fontSize: 24 }}></span>', '')
            cleaned = cleaned.replace('<span style={{ fontSize: 22 }}></span>', '')
            cleaned = cleaned.replace('<span style={{ fontSize: 17, lineHeight: 1 }}></span>', '')
            cleaned = cleaned.replace('<div style={{ fontSize: 34 }}></div>', '')
            cleaned = cleaned.replace('<div style={{ fontSize: 48, marginBottom: 10 }}></div>', '')
            cleaned = cleaned.replace('<span style={{ fontSize: 28, lineHeight: 1 }}></span>', '')
            cleaned = cleaned.replace('<span style={{ fontSize: 20 }}></span>', '')
            cleaned = cleaned.replace('<span style={{ fontSize: 18, marginBottom: 4 }}></span>', '')
            cleaned = cleaned.replace("<div className=\"sel-card-icon\" style={{ fontSize: 40, textAlign: 'center', padding: '20px 0 14px', background: `linear-gradient(135deg, ${C.light}, #FBE8EF)` }}></div>", "")
            cleaned = cleaned.replace("<div className=\"sel-card-icon\" style={{ fontSize: 40, textAlign: 'center', padding: '20px 0 14px',\n          background: `linear-gradient(135deg, ${C.light}, #FBE8EF)` }}>\n          \n        </div>", "")
            # If the line became just an empty button except its text that is also empty
            new_lines.append(cleaned)
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))

if __name__ == "__main__":
    files = [
        'frontend/src/App.jsx',
        'frontend/src/pages/LandingPage.jsx',
        'frontend/src/pages/AdminPage.jsx',
        'frontend/src/pages/Tab1Style.jsx',
        'frontend/src/pages/Tab2Venue.jsx',
        'frontend/src/pages/Tab3Decor.jsx',
        'frontend/src/pages/Tab4Food.jsx',
        'frontend/src/pages/Tab5Artists.jsx',
        'frontend/src/pages/Tab6and7.jsx',
        'frontend/src/pages/Tab8Budget.jsx',
    ]
    for file in files:
        if os.path.exists(file):
            print(f"Cleaning {file}...")
            clean_file(file)
    print("Done")
