import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TARGET = process.argv[2] || 'chrome';
const PLATFORM_PREFIX = `__${TARGET}__`;

console.log(`Building manifest for target: ${TARGET}`);

const srcPath = path.resolve(__dirname, '../src/manifest.json');
const distPath = path.resolve(__dirname, `../dist/${TARGET}/manifest.json`);

fs.mkdirSync(path.dirname(distPath), { recursive: true });

const manifestSource = JSON.parse(fs.readFileSync(srcPath, 'utf-8'));

function processManifest(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => processManifest(item));
  }

  if (obj && typeof obj === 'object') {
    const result = {};
    const keys = Object.keys(obj);

    keys.forEach(key => {
      if (!key.startsWith('__')) {
        result[key] = processManifest(obj[key]);
      }
    });

    keys.forEach(key => {
      if (key.startsWith(PLATFORM_PREFIX)) {
        const cleanKey = key.replace(PLATFORM_PREFIX, '');
        result[cleanKey] = processManifest(obj[key]);
      }
    });

    return result;
  }

  return obj;
}

let finalManifest = processManifest(manifestSource);

if (TARGET === 'safari' && finalManifest.commands) {
  Object.keys(finalManifest.commands).forEach(commandKey => {
    const command = finalManifest.commands[commandKey];
    if (command.suggested_key && command.suggested_key.mac) {
      command.suggested_key.mac = command.suggested_key.mac.replace(/Alt\+/g, 'Command+');

      if (commandKey === 'quick-switch' && command.suggested_key.mac === 'Command+Q') {
        command.suggested_key.mac = 'Command+Shift+K';
      }
    }
  });
  console.log('Safari: Replaced Alt with Command in mac keybindings');
}

fs.writeFileSync(distPath, JSON.stringify(finalManifest, null, 2));
console.log(`Manifest written to ${distPath}`);
