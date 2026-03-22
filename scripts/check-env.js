/**
 * Run this to diagnose why .env.dev isn't loading:
 * node scripts/check-env.js
 */
const path = require('path');
const fs   = require('fs');

console.log('\n── Paths ───────────────────────────────────────────────');
console.log('  process.cwd() :', process.cwd());
console.log('  __dirname     :', __dirname);

const candidates = [
  path.join(__dirname, '..', 'config', '.env.dev'),
  path.join(process.cwd(), 'config', '.env.dev'),
];

console.log('\n── Candidate .env.dev paths ────────────────────────────');
candidates.forEach(p => {
  const exists = fs.existsSync(p);
  console.log(`  ${exists ? '✓' : '✗'} ${p}`);
  if (exists) {
    const content = fs.readFileSync(p, 'utf-8');
    console.log(`    First line: ${content.split('\n').find(l => l.trim() && !l.startsWith('#'))}`);
  }
});

// Also list what IS in config/
const configDir = path.join(process.cwd(), 'config');
console.log(`\n── Files in ${configDir} ─────────────────────`);
if (fs.existsSync(configDir)) {
  fs.readdirSync(configDir).forEach(f => console.log(`  ${f}`));
} else {
  console.log('  (directory does not exist)');
}