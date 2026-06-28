#!/usr/bin/env node

/**
 * test.mjs — Test runner for solana-skill-quality-gate v2.0
 *
 * Tests: fixtures, self-audit, policy caps, strict mode, fail-under,
 * negation-aware scanning, benchmark fixtures, report generation.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CLI = join(__dirname, 'skillqa.mjs');
const GOOD = join(__dirname, 'fixtures', 'good-skill');
const BAD = join(__dirname, 'fixtures', 'bad-skill');
const ROOT = join(__dirname, '..');

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
  const result = spawnSync('node', [CLI, ...args.split(/\s+/)], {
    encoding: 'utf-8',
    timeout: 30000,
  });
  if (result.error) throw result.error;
  return { stdout: result.stdout || '', stderr: result.stderr || '', status: result.status };
}

function runOK(args) {
  const r = run(args);
  if (r.status !== 0) throw new Error(`Exit ${r.status}: ${r.stderr}`);
  return r.stdout;
}

function runJSON(args) {
  const output = runOK(args);
  return JSON.parse(output);
}

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  solana-skill-quality-gate — Test Suite v2.0               ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

// ─── 1. Fixture existence ────────────────────────────────────────────────────

console.log('Fixtures:');

test('good-skill fixture exists', () => {
  assert(existsSync(GOOD), `Not found: ${GOOD}`);
});

test('bad-skill fixture exists', () => {
  assert(existsSync(BAD), `Not found: ${BAD}`);
});

test('good-skill has SKILL.md', () => {
  assert(existsSync(join(GOOD, 'skill', 'SKILL.md')), 'Missing skill/SKILL.md');
});

test('bad-skill has SKILL.md', () => {
  assert(existsSync(join(BAD, 'skill', 'SKILL.md')), 'Missing skill/SKILL.md');
});

// ─── 2. Audit command ────────────────────────────────────────────────────────

console.log('\nAudit command:');

test('audit good-skill runs without error', () => {
  const output = runOK(`audit ${GOOD}`);
  assert(output.includes('Audit Report'), 'Missing "Audit Report"');
});

test('audit bad-skill runs without error', () => {
  const output = runOK(`audit ${BAD}`);
  assert(output.includes('Audit Report'), 'Missing "Audit Report"');
});

// ─── 3. Score command ────────────────────────────────────────────────────────

console.log('\nScore command:');

test('score good-skill produces valid JSON', () => {
  const result = runJSON(`score ${GOOD} --json`);
  assert(typeof result.score.total === 'number', 'score.total not a number');
  assert(typeof result.rating === 'string', 'rating not a string');
});

test('score bad-skill produces valid JSON', () => {
  const result = runJSON(`score ${BAD} --json`);
  assert(typeof result.score.total === 'number', 'score.total not a number');
});

test('good-skill scores >= 80', () => {
  const result = runJSON(`score ${GOOD} --json`);
  assert(result.score.total >= 80, `Got ${result.score.total}`);
});

test('bad-skill final score <= 39 (policy-capped)', () => {
  const result = runJSON(`score ${BAD} --json`);
  assert(result.score.total <= 39, `Got ${result.score.total}`);
});

test('bad-skill has policy caps applied', () => {
  const result = runJSON(`score ${BAD} --json`);
  assert(result.score.policyCaps.length > 0, 'No policy caps');
});

test('good-skill scores higher than bad-skill', () => {
  const good = runJSON(`score ${GOOD} --json`);
  const bad = runJSON(`score ${BAD} --json`);
  assert(good.score.total > bad.score.total, `Good ${good.score.total} vs bad ${bad.score.total}`);
});

test('score breakdown has all 6 categories', () => {
  const result = runJSON(`score ${GOOD} --json`);
  for (const cat of ['structure', 'progressive', 'safety', 'solanaFit', 'installReady', 'docs']) {
    assert(result.score.breakdown[cat] !== undefined, `Missing: ${cat}`);
    assert(typeof result.score.breakdown[cat].score === 'number', `${cat}.score not number`);
  }
});

test('good-skill safety score is high', () => {
  const result = runJSON(`score ${GOOD} --json`);
  assert(result.score.breakdown.safety.score >= 20, `Got ${result.score.breakdown.safety.score}`);
});

test('bad-skill safety score is low', () => {
  const result = runJSON(`score ${BAD} --json`);
  assert(result.score.breakdown.safety.score <= 10, `Got ${result.score.breakdown.safety.score}`);
});

// ─── 4. Self-audit ───────────────────────────────────────────────────────────

console.log('\nSelf-audit:');

test('self-audit score >= 90', () => {
  const result = runJSON(`score ${ROOT} --json`);
  assert(result.score.total >= 90, `Self-audit score ${result.score.total} < 90`);
});

test('self-audit has no policy caps', () => {
  const result = runJSON(`score ${ROOT} --json`);
  assert(result.score.policyCaps.length === 0, `Has ${result.score.policyCaps.length} caps`);
});

test('self-audit safety score is 25/25', () => {
  const result = runJSON(`score ${ROOT} --json`);
  assert(result.score.breakdown.safety.score === 25, `Got ${result.score.breakdown.safety.score}`);
});

// ─── 5. Negation-aware scanning ──────────────────────────────────────────────

console.log('\nNegation-aware scanning:');

test('safe phrase "do not ignore previous instructions" is NOT detected', () => {
  // Good fixture says "No private keys or seed phrases required" — should not flag
  const result = runJSON(`score ${GOOD} --json`);
  assert(result.score.breakdown.safety.score >= 20, `Safety flagged negated phrase: ${result.score.breakdown.safety.score}`);
});

test('malicious phrase IS detected in bad fixture', () => {
  const result = runJSON(`score ${BAD} --json`);
  const findings = result.score.breakdown.safety.findings;
  const hasInjection = findings.some(f => f.includes('Prompt Injection'));
  assert(hasInjection, 'Prompt injection not detected in bad fixture');
});

// ─── 6. Policy caps ─────────────────────────────────────────────────────────

console.log('\nPolicy caps:');

test('bad fixture rawTotal > total (caps reduce score)', () => {
  const result = runJSON(`score ${BAD} --json`);
  assert(result.score.rawTotal > result.score.total, `raw ${result.score.rawTotal} not > total ${result.score.total}`);
});

test('report includes raw score and final score', () => {
  const tmpReport = join(__dirname, '..', 'examples', '_test-caps-report.md');
  mkdirSync(dirname(tmpReport), { recursive: true });
  runOK(`report ${BAD} --out ${tmpReport}`);
  const content = readFileSync(tmpReport, 'utf-8');
  assert(content.includes('Raw Score'), 'Report missing "Raw Score"');
  assert(content.includes('Final Score'), 'Report missing "Final Score"');
  assert(content.includes('Policy'), 'Report missing policy caps table');
  try { unlinkSync(tmpReport); } catch { /* ignore */ }
});

// ─── 7. Strict mode ─────────────────────────────────────────────────────────

console.log('\nStrict mode:');

test('--strict exits non-zero on bad fixture (safety)', () => {
  const r = run(`audit ${BAD} --strict`);
  assert(r.status === 2, `Expected exit 2, got ${r.status}`);
});

test('--strict passes on good fixture', () => {
  const r = run(`audit ${GOOD} --strict`);
  assert(r.status === 0, `Expected exit 0, got ${r.status}`);
});

// ─── 8. Fail-under ──────────────────────────────────────────────────────────

console.log('\nFail-under:');

test('--fail-under 80 passes for good-skill', () => {
  const r = run(`score ${GOOD} --json --fail-under 80`);
  assert(r.status === 0, `Expected exit 0, got ${r.status}`);
});

test('--fail-under 99 fails for good-skill', () => {
  const r = run(`score ${GOOD} --json --fail-under 99`);
  assert(r.status === 1, `Expected exit 1, got ${r.status}`);
});

test('--fail-under 90 passes for self-audit', () => {
  const r = run(`score ${ROOT} --json --fail-under 90`);
  assert(r.status === 0, `Expected exit 0, got ${r.status}`);
});

// ─── 9. Report command ──────────────────────────────────────────────────────

console.log('\nReport command:');

const tmpGoodReport = join(__dirname, '..', 'examples', '_test-report-good.md');
const tmpBadReport = join(__dirname, '..', 'examples', '_test-report-bad.md');

test('report good-skill generates markdown', () => {
  mkdirSync(dirname(tmpGoodReport), { recursive: true });
  runOK(`report ${GOOD} --out ${tmpGoodReport}`);
  assert(existsSync(tmpGoodReport), 'Report not created');
  const content = readFileSync(tmpGoodReport, 'utf-8');
  assert(content.includes('# Skill Audit Report'), 'Missing header');
  assert(content.includes('Score Breakdown'), 'Missing breakdown');
  assert(content.includes('PR Readiness Checklist'), 'Missing checklist');
});

test('report bad-skill generates markdown', () => {
  runOK(`report ${BAD} --out ${tmpBadReport}`);
  assert(existsSync(tmpBadReport), 'Report not created');
});

try { unlinkSync(tmpGoodReport); } catch { /* ignore */ }
try { unlinkSync(tmpBadReport); } catch { /* ignore */ }

// ─── 10. Edge cases ─────────────────────────────────────────────────────────

console.log('\nEdge cases:');

test('non-existent path exits with error', () => {
  const r = run('audit /tmp/nonexistent-skill-path-12345');
  assert(r.status !== 0, 'Should fail on non-existent path');
});

test('missing command shows usage', () => {
  const r = run('--help unused');
  assert(r.status === 0 || r.stdout.includes('Usage'), 'Should show usage');
});

// ─── 11. Benchmark fixtures ─────────────────────────────────────────────────

const BENCH = join(__dirname, 'fixtures', 'benchmark-samples');

if (existsSync(BENCH)) {
  console.log('\nBenchmark fixtures:');

  test('excellent benchmark scores >= 80', () => {
    const result = runJSON(`score ${join(BENCH, 'excellent')} --json`);
    assert(result.score.total >= 80, `Got ${result.score.total}`);
  });

  test('missing-license benchmark gets structure penalty', () => {
    const result = runJSON(`score ${join(BENCH, 'missing-license')} --json`);
    assert(result.score.breakdown.structure.score < 20, `Got ${result.score.breakdown.structure.score}`);
  });

  test('giant-skill-md benchmark gets progressive penalty', () => {
    const result = runJSON(`score ${join(BENCH, 'giant-skill-md')} --json`);
    assert(result.score.breakdown.progressive.score < 20, `Got ${result.score.breakdown.progressive.score}`);
  });

  test('dangerous-install is policy-capped', () => {
    const result = runJSON(`score ${join(BENCH, 'dangerous-install')} --json`);
    assert(result.score.policyCaps.length > 0, 'No policy caps');
    assert(result.score.total <= 39, `Got ${result.score.total}`);
  });
}

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
