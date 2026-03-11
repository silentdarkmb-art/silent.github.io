/**
 * BLOXBURST — build.js
 * =====================================================
 * Auto-counts active codes mula sa bawat game HTML page
 * at ina-update ang games.json na may tamang activeCodes.
 *
 * PAANO GAMITIN:
 *   1. I-install ang Node.js (https://nodejs.org)
 *   2. I-install ang dependency:  npm install node-html-parser
 *   3. I-run:  node build.js
 *
 * Dapat nasa ROOT folder mo ito (kasama ng games.json, style.css, etc.)
 * at dapat may "roblox" folder na naglalaman ng mga game HTML files.
 * =====================================================
 */

const fs   = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');

const GAMES_JSON = path.join(__dirname, 'games.json');

// ── Basahin ang games.json ──────────────────────────
let games;
try {
  games = JSON.parse(fs.readFileSync(GAMES_JSON, 'utf-8'));
} catch (e) {
  console.error('❌ Hindi ma-read ang games.json:', e.message);
  process.exit(1);
}

let updated = 0;
let notFound = 0;

console.log(`\n🔍 Bibilangin ang active codes para sa ${games.length} games...\n`);

games.forEach(game => {
  // Ang url sa games.json ay "roblox/GameName.html"
  const filePath = path.join(__dirname, game.url);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${game.url}`);
    game.activeCodes = game.activeCodes || 0;
    notFound++;
    return;
  }

  const html = fs.readFileSync(filePath, 'utf-8');
  const root = parse(html);

  // Bilang ang lahat ng .code-card na WALANG .expired class
  const allCards     = root.querySelectorAll('.code-card');
  const activeCodes  = allCards.filter(card => !card.classNames.includes('expired')).length;

  const old = game.activeCodes ?? '?';
  game.activeCodes = activeCodes;

  const status = old !== activeCodes ? `${old} → ${activeCodes} ✅` : `${activeCodes} (no change)`;
  console.log(`  ${game.name.padEnd(40)} ${status}`);
  updated++;
});

// ── I-save ang updated games.json ──────────────────
fs.writeFileSync(GAMES_JSON, JSON.stringify(games, null, 2), 'utf-8');

console.log(`\n✅ Done! ${updated} games na-update, ${notFound} files not found.`);
console.log(`📁 Saved: games.json\n`);