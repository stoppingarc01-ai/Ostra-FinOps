import assert from 'node:assert';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.resolve(__dirname, '../bin/cli.js');

console.log('[Check] Testing Sentinel Daemon CLI Authentication & Options...');

// Test 1: --help exits 0 and mentions --id, --secret, --port
const helpOutput = execSync(`node "${cliPath}" --help`, { encoding: 'utf-8' });
assert(helpOutput.includes('--id'), 'Should document --id');
assert(helpOutput.includes('--secret'), 'Should document --secret');
assert(helpOutput.includes('--port'), 'Should document --port');
assert(helpOutput.includes('Sentinel Local Daemon'), 'Should include Sentinel banner');

console.log('✓ Test 1: --help output verified.');
console.log('✅ Sentinel Daemon Authentication CLI tests passed successfully.');
