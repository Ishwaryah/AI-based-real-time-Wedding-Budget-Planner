const fs = require('fs');
const path = require('path');

const files = [
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
    'frontend/src/context/WeddingContext.jsx'
];

function cleanFile(filepath) {
    if (!fs.existsSync(filepath)) {
        console.log('File not found:', filepath);
        return;
    }
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    let inWhatsapp = false;
    let inDecor = false;
    
    // STRICT emoji regex
    const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;
    const explicitlyRemove = /[🚐💒👰✈🚆🚗🚌📍🤵🐎🥁✨🌸🧺👑🌿📋🎁📨🪔📸💄⚡⭐🎤🥗🍽🍸🎪⚙🖼✨🪔🏛🤖📸🖼🏛📍👥🌿🛏🏠👰🤵📅💒💎🎉🌸✓✅👑💕🤍🔥♡♥️💰]/gu;

    const newLines = lines.map((line, i) => {
        // Safe exclusions
        if (line.includes('const msg = `🪷 *WeddingBudget')) inWhatsapp = true;
        if (inWhatsapp && line.includes('window.open') && line.includes('wa.me')) inWhatsapp = false;
        
        if (line.includes('export const DECOR_LIBRARY') || line.includes('const DECOR_LIBRARY')) inDecor = true;
        if (inDecor && line.includes(']') && !line.includes('{')) {
            if (i > 100) inDecor = false;
        }

        const isDecorEmoji = (line.includes('emoji:') || line.includes('emoji :')) && line.includes('{') && inDecor;
        const isToast = line.toLowerCase().includes('toast') || line.includes('showToast');
        const isWhatsapp = inWhatsapp || line.includes('Share on WhatsApp') || line.includes('wa.me') || line.includes('🪷');
        
        if (isWhatsapp || isToast || isDecorEmoji) {
            return line;
        }

        // Only remove actual emojis!
        let cleaned = line;
        cleaned = cleaned.replace(emojiRegex, '').replace(explicitlyRemove, '');
        
        return cleaned;
    });
    
    fs.writeFileSync(filepath, newLines.join('\n'));
}

files.forEach(f => {
    console.log('Cleaning', f);
    cleanFile(f);
});
console.log('Done');
