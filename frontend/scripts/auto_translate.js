// auto_translate.js
// This script reads the English locale (en.ts) and auto‑generates translations for all other locale files.
// It overwrites existing entries with machine‑translated values (as requested).
// Uses the public LibreTranslate API (no API key required, rate‑limited). Adjust endpoint if needed.

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Paths (relative to project root)
const localesDir = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const enPath = path.join(localesDir, 'en.ts');

// Load English translations
const enFile = fs.readFileSync(enPath, 'utf-8');
const enObjectMatch = enFile.match(/export const en:.*?=\s*\{([\s\S]*?)\};/);
if (!enObjectMatch) {
  console.error('Could not parse en.ts');
  process.exit(1);
}
const enBody = enObjectMatch[1];
// Build a map of key -> English string
const enMap = {};
const lineRegex = /\s*(['"])([^'\"]+)\1\s*:\s*(['"])([^'\"]*)\3\s*,?/g;
let match;
while ((match = lineRegex.exec(enBody)) !== null) {
  const key = match[2];
  const value = match[4];
  enMap[key] = value;
}

// Languages to translate to (matching locale file names)
const languages = ['ar','bn','de','es','fr','gu','hi','kn','ml','mr','pa','ta','te']; // hi will be overwritten per user choice

// LibreTranslate endpoint (public instance)
const endpoint = 'https://libretranslate.de/translate';

async function translateText(text, targetLang) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source: 'en', target: targetLang, format: 'text' })
  });
  const data = await res.json();
  return data.translatedText;
}

async function translateAll() {
  for (const lang of languages) {
    console.log(`Translating to ${lang} ...`);
    const translations = {};
    for (const [key, val] of Object.entries(enMap)) {
      if (val.trim() === '') {
        translations[key] = '';
        continue;
      }
      try {
        const tl = await translateText(val, lang);
        translations[key] = tl.replace(/\\'/g, "'"); // cleanup escaped quotes
      } catch (e) {
        console.error(`Failed for key ${key}:`, e);
        translations[key] = val; // fallback to English
      }
    }
    // Write out the locale file
    const lines = [];
    lines.push("import { TranslationDict } from '../translations';");
    lines.push('');
    lines.push(`export const ${lang}: TranslationDict = {`);
    for (const [k, v] of Object.entries(translations)) {
      const safe = v.replace(/'/g, "\\'");
      lines.push(`  '${k}': '${safe}',`);
    }
    lines.push('};');
    const outPath = path.join(localesDir, `${lang}.ts`);
    fs.writeFileSync(outPath, lines.join('\n'));
    console.log(`Written ${outPath}`);
  }
}

translateAll().then(()=> console.log('All translations completed')).catch(err=> console.error(err));
