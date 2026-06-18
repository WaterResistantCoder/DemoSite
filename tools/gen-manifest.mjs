#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
//  SpellSpun Threads — manifest generator
//  Scans res/crochet/ and writes res/crochet/manifest.json
//  so the gallery loads with zero API calls (100% reliable on
//  GitHub Pages and offline). Run before pushing new photos:
//
//      node tools/gen-manifest.mjs
// ═══════════════════════════════════════════════════════════
import { readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CROCHET_DIR = join(ROOT, 'res', 'crochet');
const OUT = join(CROCHET_DIR, 'manifest.json');

const IMG_EXT = new Set(['jpg','jpeg','png','webp','gif','avif','bmp','heic','heif','svg','tiff','tif','phn']);
const isImage = f => IMG_EXT.has((f.split('.').pop() || '').toLowerCase());
const leadNum = s => { const m = String(s).match(/^\s*(\d+)/); return m ? parseInt(m[1], 10) : Infinity; };
const titleCase = s => s.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
  .replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

async function scan() {
  let entries;
  try { entries = await readdir(CROCHET_DIR, { withFileTypes: true }); }
  catch { console.error(`✗ Folder not found: ${CROCHET_DIR}`); process.exit(1); }

  const collections = [];
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const m = ent.name.match(/^(\d+)_(.*)$/);
    if (!m) {
      console.warn(`  ⚠ skipping "${ent.name}" (does not match <number>_<title>)`);
      continue;
    }
    const order = parseInt(m[1], 10);
    const title = titleCase(m[2]) || ent.name;
    const sub = join(CROCHET_DIR, ent.name);
    const files = (await readdir(sub, { withFileTypes: true }))
      .filter(f => f.isFile() && isImage(f.name))
      .map(f => f.name)
      .sort((a, b) => (leadNum(a) - leadNum(b)) || a.localeCompare(b));

    if (!files.length) { console.warn(`  ⚠ "${ent.name}" has no images — skipped`); continue; }
    collections.push({ dir: ent.name, order, title, images: files });
  }

  collections.sort((a, b) => a.order - b.order || a.dir.localeCompare(b.dir));
  return collections;
}

const data = await scan();
await writeFile(OUT, JSON.stringify(data, null, 2) + '\n', 'utf8');

const photos = data.reduce((n, c) => n + c.images.length, 0);
console.log(`✓ Wrote ${OUT}`);
console.log(`  ${data.length} collection${data.length === 1 ? '' : 's'}, ${photos} photo${photos === 1 ? '' : 's'}`);
data.forEach(c => console.log(`    ${String(c.order).padStart(2,'0')}  ${c.title.padEnd(18)} ${c.images.length} photo(s)`));
if (!data.length) console.log('  (empty — add folders like res/crochet/1_star/ with photos inside)');
