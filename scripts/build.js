#!/usr/bin/env node
// Full build script: mint export → unzip to dist/ → fix paths
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const ZIP_PATH = path.join(ROOT_DIR, 'export.zip');

// 1. Run mint export
console.log('1/3  Generating static files...');
execSync('npx mint export', { cwd: ROOT_DIR, stdio: 'inherit' });

// 2. Extract zip to dist/
console.log('2/3  Extracting to dist/...');
execSync(`powershell -ExecutionPolicy Bypass -Command "Expand-Archive -Path '${ZIP_PATH.replace(/\\/g, '\\\\')}' -DestinationPath '${DIST_DIR.replace(/\\/g, '\\\\')}' -Force"`, { cwd: ROOT_DIR, stdio: 'inherit' });
fs.unlinkSync(ZIP_PATH);
console.log('   Extracted to dist/');

// 3. Clean up non-build files (keep pages, assets, and files referenced by the site)
console.log('3/3  Cleaning up...');
const shouldDelete = [
  '.gitignore', 'README.md', 'serve.js',
  'Start Docs.bat', 'Start Docs.command',
  'export.zip', 'docs.json', 'package.json', 'pnpm-lock.yaml', 'info.mdx',
  'scripts', 'dist' // 'dist' removes the stale nested build output bundled into the zip
];
for (const item of shouldDelete) {
  const itemPath = path.join(DIST_DIR, item);
  if (fs.existsSync(itemPath)) {
    fs.rmSync(itemPath, { recursive: true, force: true });
  }
}
// Remove mint's localhost cache bundled into the export
const customCache = path.join(DIST_DIR, '_mintlify', 'custom');
if (fs.existsSync(customCache)) {
  fs.rmSync(customCache, { recursive: true, force: true });
}

// 4. Fix asset paths
console.log('4/4  Fixing asset paths...');
const fixScript = path.join(__dirname, 'fix-export-paths.js');
if (fs.existsSync(fixScript)) {
  require(fixScript);
}

console.log('Build complete!');
