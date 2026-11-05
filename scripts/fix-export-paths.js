#!/usr/bin/env node
// Post-processing for mint export: fix asset paths from relative to root
// mint export hardcodes '"primary":"."' for asset loading,
// which breaks when navigating to sub-pages. This script fixes it.

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, '..', 'dist');

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

// Process all HTML files in dist/
const htmlFiles = walk(DIST_DIR).filter(f => f.endsWith('.html'));
let changed = 0;

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  let fixed = content;

  // Fix inline script: "primary":"."  ->  "primary":"/_mintlify/assets/"
  // Handles minified form: ...})({"primary":"."},...)
  fixed = fixed.replace(/\{"primary":"\."\}/g, '{"primary":"/_mintlify/assets/"}');

  // Also fix the __mintAssets default in mint-entry script
  fixed = fixed.replace(/globalThis\.__mintAssets\|\|"\."/g, 'globalThis.__mintAssets||"/_mintlify/assets/"');

  // Rewrite lazy-chunk URLs that mint export points at the bundled localhost
  // cache (/_mintlify/custom/localhost/<hash>/dist/...). build.js deletes that
  // folder, so these URLs must be remapped to the real files, otherwise every
  // lazy chunk 404s and the server returns HTML -> "Unexpected token '<'".
  fixed = fixed.replace(/\/_mintlify\/custom\/localhost\/[0-9a-f]+\/dist\/_mintlify\/assets\//g, '/_mintlify/assets/');
  fixed = fixed.replace(/\/_mintlify\/custom\/localhost\/[0-9a-f]+\/(dist\/)?/g, '/');

  if (fixed !== content) {
    fs.writeFileSync(file, fixed, 'utf-8');
    changed++;
  }
}

console.log(`Fixed ${changed} of ${htmlFiles.length} HTML files.`);
