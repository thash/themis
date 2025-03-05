#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if a version argument is provided
if (process.argv.length < 3) {
  console.error('Please provide a version number (e.g., node update-version.js 0.1.2)');
  process.exit(1);
}

const newVersion = process.argv[2];

// Validate version format (simple check for x.y.z format)
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Version should be in the format x.y.z (e.g., 0.1.2)');
  process.exit(1);
}

// Update package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log(`Updated package.json to version ${newVersion}`);

// Update Cargo.toml
const cargoTomlPath = path.join(__dirname, 'src-tauri', 'Cargo.toml');
let cargoToml = fs.readFileSync(cargoTomlPath, 'utf8');
cargoToml = cargoToml.replace(/^version = ".*?"/m, `version = "${newVersion}"`);
fs.writeFileSync(cargoTomlPath, cargoToml);
console.log(`Updated Cargo.toml to version ${newVersion}`);

// Update tauri.conf.json
const tauriConfPath = path.join(__dirname, 'src-tauri', 'tauri.conf.json');
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
tauriConf.package.version = newVersion;
fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
console.log(`Updated tauri.conf.json to version ${newVersion}`);

console.log(`\nAll files updated to version ${newVersion}`);
console.log(`\nThe GitHub Actions workflow will automatically use this version for the artifact name.`);
console.log(`\nTo use this script, run: npm run update-version x.y.z`);
