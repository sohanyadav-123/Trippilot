import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Configuration
const __dirname = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const localesDir = path.resolve(__dirname, '..', 'src', 'i18n', 'locales');
console.log('Locales directory resolved to:', localesDir);
const sourceLang = 'en';
const targetLangs = ['hi']; // exclude en
const apiUrl = 'https://libretranslate.com/translate';

// Helper to parse a locale file into a plain object
type LocaleDict = Record<string, string>;
function parseLocaleFile(content: string): LocaleDict {
  const obj: LocaleDict = {};
  // Match lines like 'key': 'value', possibly with comments before
  const regex = /\s*(['"])([^'"\\]+)\1\s*:\s*(['"])((?:\\.|[^'"\\])*)\3\s*,?/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const key = match[2];
    const value = match[4].replace(/\\'/g, "'");
    obj[key] = value;
  }
  return obj;
}

function serializeLocaleFile(dict: LocaleDict, exportName: string): string {
  const lines = Object.entries(dict).map(([k, v]) => `  '${k}': '${v.replace(/'/g, "\\'")}',`);
  return `import { TranslationDict } from '../translations';\n\nexport const ${exportName}: TranslationDict = {\n${lines.join('\n')}\n};\n`;
}

async function translateText(text: string, target: string): Promise<string> {
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source: sourceLang, target, format: 'text' })
  });
  const data = await res.json();
  return data.translatedText ?? text;
}

async function main() {
  const sourcePath = path.join(localesDir, `${sourceLang}.ts`);
  const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
  const sourceDict = parseLocaleFile(sourceContent);

  for (const lang of targetLangs) {
    const targetPath = path.join(localesDir, `${lang}.ts`);
    let targetDict: LocaleDict = {};
    if (fs.existsSync(targetPath)) {
      const targetContent = fs.readFileSync(targetPath, 'utf-8');
      targetDict = parseLocaleFile(targetContent);
    }
    // Merge keys: keep existing translations, translate missing ones
    for (const [key, value] of Object.entries(sourceDict)) {
      if (!targetDict[key] || targetDict[key] === '') {
        try {
          const translated = await translateText(value, lang);
          targetDict[key] = translated;
          console.log(`Translated ${key} to ${lang}`);
        } catch (e) {
          console.error(`Failed to translate ${key} to ${lang}:`, e);
          targetDict[key] = value; // fallback to English
        }
      }
    }
    // Write back file
    const fileContent = serializeLocaleFile(targetDict, lang);
    fs.writeFileSync(targetPath, fileContent, 'utf-8');
    console.log(`Updated ${lang}.ts`);
  }
}

main().catch(err => console.error('Translation script error:', err));
