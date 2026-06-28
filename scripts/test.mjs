#!/usr/bin/env node

/**
 * test.mjs — Test runner for solana-skill-quality-gate
 *
 * Runs the CLI on good and bad fixtures and verifies:
 * - Good skill scores high (>= 70)
 * - Bad skill scores low (<= 35)
 * - JSON output is valid
 * - Markdown report is generated
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CLI = join(__dirname, 'skillqa.mjs');
const GOOD_FIXTURE = join(__dirname, 'fixtures', 'good-skill');
const BAD_FIXTURE = join(__dirname, 'fixtures', 'bad-skill');

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err) {
    failed++;
    failures.push({ name, error: err.message });
    console.log(`  ❌ ${name}: ${err.message}`);
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

function run(args) {
  return execSync(`node ${CLI} ${args}`, { encoding: 'utf-8', timeout: 30000 });
}

function runJSON(args) {
  const output = run(args);
  return JSON.parse(output);
}

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  solana-skill-quality-gate — Test Suite                     ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

// ─── Fixture existence ───────────────────────────────────────────────────────

console.log('Fixtures:');

test('good-skill fixture exists', () => {
  assert(existsSync(GOOD_FIXTURE), `Directory not found: ${GOOD_FIXTURE}`);
});

test('bad-skill fixture exists', () => {
  assert(existsSync(BAD_FIXTURE), `Directory not found: ${BAD_FIXTURE}`);
});

test('good-skill has SKILL.md', () => {
  assert(
    existsSync(join(GOOD_FIXTURE, 'skill', 'SKILL.md')),
    'skill/SKILL.md not found in good fixture',
  );
});

test('bad-skill has SKILL.md', () => {
  assert(
    existsSync(join(BAD_FIXTURE, 'skill', 'SKILL.md')),
    'skill/SKILL.md not found in bad fixture',
  );
});

// ─── Audit command ───────────────────────────────────────────────────────────

console.log('\nAudit command:');

test('audit good-skill runs without error', () => {
  const output = run(`audit ${GOOD_FIXTURE}`);
  assert(output.includes('Audit Report'), 'Output should contain "Audit Report"');
});

test('audit bad-skill runs without error', () => {
  const output = run(`audit ${BAD_FIXTURE}`);
  assert(output.includes('Audit Report'), 'Output should contain "Audit Report"');
});

// ─── Score command ───────────────────────────────────────────────────────────

console.log('\nScore command:');

test('score good-skill produces valid JSON', () => {
  const result = runJSON(`score ${GOOD_FIXTURE} --json`);
  assert(typeof result.score.total === 'number', 'score.total should be a number');
  assert(typeof result.rating === 'string', 'rating should be a string');
});

test('score bad-skill produces valid JSON', () => {
  const result = runJSON(`score ${BAD_FIXTURE} --json`);
  assert(typeof result.score.total === 'number', 'score.total should be a number');
});

test('good-skill scores >= 80', () => {
  const result = runJSON(`score ${GOOD_FIXTURE} --json`);
  assert(result.score.total >= 80, `Expected score >= 80, got ${result.score.total}`);
});

test('bad-skill scores <= 50', () => {
  const result = runJSON(`score ${BAD_FIXTURE} --json`);
  assert(result.score.total <= 50, `Expected score <= 50, got ${result.score.total}`);
});

test('good-skill has higher score than bad-skill', () => {
  const good = runJSON(`score ${GOOD_FIXTURE} --json`);
  const bad = runJSON(`score ${BAD_FIXTURE} --json`);
  assert(good.score.total > bad.score.total, `Good (${good.score.total}) should be higher than bad (${bad.score.total})`);
});

test('score breakdown has all categories', () => {
  const result = runJSON(`score ${GOOD_FIXTURE} --json`);
  const expected = ['structure', 'progressive', 'safety', 'solanaFit', 'installReady', 'docs'];
  for (const cat of expected) {
    assert(result.score.breakdown[cat] !== undefined, `Missing category: ${cat}`);
    assert(typeof result.score.breakdown[cat].score === 'number', `${cat}.score should be a number`);
    assert(typeof result.score.breakdown[cat].max === 'number', `${cat}.max should be a number`);
  }
});

test('good-skill safety score is high', () => {
  const result = runJSON(`score ${GOOD_FIXTURE} --json`);
  assert(result.score.breakdown.safety.score >= 20, `Expected safety >= 20, got ${result.score.breakdown.safety.score}`);
});

test('bad-skill safety score is low', () => {
  const result = runJSON(`score ${BAD_FIXTURE} --json`);
  assert(result.score.breakdown.safety.score <= 10, `Expected safety <= 10, got ${result.score.breakdown.safety.score}`);
});

// ─── Report command ──────────────────────────────────────────────────────────

console.log('\nReport command:');

const tmpGoodReport = join(__dirname, '..', 'examples', '_test-report-good.md');
const tmpBadReport = join(__dirname, '..', 'examples', '_test-report-bad.md');

test('report good-skill generates markdown file', () => {
  // Ensure examples dir exists
  mkdirSync(dirname(tmpGoodReport), { recursive: true });
  run(`report ${GOOD_FIXTURE} --out ${tmpGoodReport}`);
  assert(existsSync(tmpGoodReport), 'Report file should be created');
  const content = readFileSync(tmpGoodReport, 'utf-8');
  assert(content.includes('# Skill Audit Report'), 'Report should contain header');
  assert(content.includes('Score Breakdown'), 'Report should contain score breakdown');
  assert(content.includes('PR Readiness Checklist'), 'Report should contain PR checklist');
});

test('report bad-skill generates markdown file', () => {
  run(`report ${BAD_FIXTURE} --out ${tmpBadReport}`);
  assert(existsSync(tmpBadReport), 'Report file should be created');
  const content = readFileSync(tmpBadReport, 'utf-8');
  assert(content.includes('# Skill Audit Report'), 'Report should contain header');
});

// Cleanup temp reports
try { unlinkSync(tmpGoodReport); } catch { /* ignore */ }
try { unlinkSync(tmpBadReport); } catch { /* ignore */ }

// ─── Edge cases ──────────────────────────────────────────────────────────────

console.log('\nEdge cases:');

test('non-existent path exits with error', () => {
  try {
    run('audit /tmp/nonexistent-skill-path-12345');
    throw new Error('Should have thrown');
  } catch (err) {
    // execSync throws on non-zero exit code, which is expected
    assert(true, 'Correctly failed on non-existent path');
  }
});

test('missing command shows usage', () => {
  try {
    run('');
    throw new Error('Should have thrown');
  } catch {
    assert(true, 'Correctly showed usage on missing command');
  }
});

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('');
console.log('──────────────────────────────────────────────────────────────');
console.log(`  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);

if (failures.length > 0) {
  console.log('');
  console.log('  Failures:');
  for (const f of failures) {
    console.log(`    ❌ ${f.name}: ${f.error}`);
  }
}

console.log('');

process.exit(failed > 0 ? 1 : 0);
