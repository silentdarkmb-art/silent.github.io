/**
 * ====================================================
 *  BLOXBURST — Auto Sitemap Generator
 *  Usage: node build-sitemap.js
 *  Output: sitemap.xml (sa root ng project mo)
 * ====================================================
 */

const fs   = require('fs');
const path = require('path');

const BASE_URL = 'https://bloxburst.com';

// ── Static pages (hindi nagbabago) ──────────────────
const staticPages = [
  { loc: '/',                                        changefreq: 'daily',   priority: '1.0' },
  { loc: '/gamecode',                           changefreq: 'daily',   priority: '0.9' },
  { loc: '/promo-latest-codes',                 changefreq: 'daily',   priority: '0.9' },
  { loc: '/wiki.html',                               changefreq: 'weekly',  priority: '0.8' },
  { loc: '/Terms-and-Condition/about',          changefreq: 'monthly', priority: '0.6' },
  { loc: '/Terms-and-Condition/faq',            changefreq: 'monthly', priority: '0.6' },
  { loc: '/Terms-and-Condition/contactus',      changefreq: 'monthly', priority: '0.5' },
  { loc: '/Terms-and-Condition/terms',          changefreq: 'monthly', priority: '0.5' },
  { loc: '/Terms-and-Condition/privacy',        changefreq: 'monthly', priority: '0.5' },
];

// ── Auto-scan ang roblox/ folder ────────────────────
const robloxFolder = path.join(__dirname, 'roblox');
let gamePages = [];

if (fs.existsSync(robloxFolder)) {
  const files = fs.readdirSync(robloxFolder)
    .filter(f => f.endsWith(''))
    .sort();

  gamePages = files.map(file => ({
    loc:        `/roblox/${file}`,
    changefreq: 'daily',
    priority:   '0.8',
  }));

  console.log(`✅ Found ${gamePages.length} game pages in /roblox/`);
} else {
  console.warn('⚠️  /roblox/ folder not found — skipping game pages.');
}

// ── Build XML ───────────────────────────────────────
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

function makeUrl(page) {
  return [
    '  <url>',
    `    <loc>${BASE_URL}${page.loc}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${page.changefreq}</changefreq>`,
    `    <priority>${page.priority}</priority>`,
    '  </url>',
  ].join('\n');
}

const allPages = [...staticPages, ...gamePages];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '',
  '  <!-- ═══ Static Pages ═══ -->',
  ...staticPages.map(makeUrl),
  '',
  '  <!-- ═══ Game Code Pages (auto-scanned from /roblox/) ═══ -->',
  ...gamePages.map(makeUrl),
  '',
  '</urlset>',
].join('\n');

// ── Write sitemap.xml ───────────────────────────────
const output = path.join(__dirname, 'sitemap.xml');
fs.writeFileSync(output, xml, 'utf-8');

console.log(`\n🗺️  sitemap.xml generated!`);
console.log(`📄 Total pages: ${allPages.length}`);
console.log(`   • Static pages : ${staticPages.length}`);
console.log(`   • Game pages   : ${gamePages.length}`);
console.log(`\n✔️  Done! I-upload mo ang sitemap.xml sa root ng bloxburst.com\n`);