import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TARGET = process.argv[2];

if (!TARGET) {
  console.error('Please specify a target (chrome, firefox, safari)');
  process.exit(1);
}

const distDir = path.resolve(__dirname, `../dist/${TARGET}`);
const date = new Date().toISOString().split('T')[0];
const zipName = `fuzzy-tab-switcher-${TARGET}-${date}.zip`;
const zipPath = path.resolve(__dirname, `../${zipName}`);

if (!fs.existsSync(distDir)) {
  console.error(`Build directory not found: ${distDir}`);
  console.error(`Please run "npm run build:${TARGET}" first.`);
  process.exit(1);
}

console.log(`Packaging ${TARGET} build...`);

try {
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  execSync(`cd "${distDir}" && zip -r "${zipPath}" .`, { stdio: 'inherit' });
  
  console.log(`\n✅ Package created successfully:`);
  console.log(`   ${zipName}`);
} catch (error) {
  console.error('❌ Failed to create package:', error);
  process.exit(1);
}
