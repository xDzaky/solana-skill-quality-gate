#!/usr/bin/env node

/**
 * skillqa.mjs — Solana Skill Quality Gate CLI
 *
 * Deterministic, zero-dependency scanner for Solana AI Kit skill quality,
 * safety, and merge-readiness.
 *
 * Usage:
 *   node scripts/skillqa.mjs audit  <path> [--strict]
 *   node scripts/skillqa.mjs score  <path> [--json] [--fail-under <n>]
 *   node scripts/skillqa.mjs report <path> --out REPORT.md
 *
 * Exit codes:
 *   0 — pass
 *   1 — score below --fail-under threshold
 *   2 — critical safety failure (--strict mode)
 *   3 — invalid structure / missing SKILL.md (--strict mode)
 *
 * Safety:
 *   - Read-only: never modifies the audited skill
 *   - No network calls
 *   - No execution of audited skill scripts
 *   - No secret collection
 *   - Zero npm dependencies
 */

import { readFileSync, existsSync, statSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VERSION = '3.0.0';

// ─── Policy caps ─────────────────────────────────────────────────────────────
// Critical safety findings cap the total score regardless of other categories.
// This ensures that a skill with prompt injection can never score "Good" or above.

const POLICY_CAPS = [
  { id: 'prompt_injection',     label: 'Prompt injection detected',             maxScore: 39 },
  { id: 'secret_collection',    label: 'Secret collection detected',            maxScore: 39 },
  { id: 'opaque_execution',     label: 'Opaque/suspicious execution detected',  maxScore: 29 },
  { id: 'priority_manipulation',label: 'Priority manipulation detected',        maxScore: 49 },
  { id: 'suspicious_install',   label: 'Suspicious install script (network/eval)', maxScore: 39 },
  { id: 'missing_skillmd',      label: 'Missing SKILL.md',                      maxScore: 49 },
  { id: 'no_solana_fit',        label: 'No Solana-specific content',            maxScore: 59 },
];

// ─── Load rules ──────────────────────────────────────────────────────────────

function loadRules() {
  const rulesPath = join(__dirname, 'rules.json');
  if (existsSync(rulesPath)) {
    return JSON.parse(readFileSync(rulesPath, 'utf-8'));
  }
  // Fallback defaults
  return {
    structure: {
      requiredFiles: ['SKILL.md'],
      recommendedFiles: ['README.md', 'LICENSE', 'install.sh'],
      nameMaxLength: 64,
      namePattern: '^[a-z0-9][a-z0-9-]*[a-z0-9]$',
      descriptionMaxLength: 1024,
    },
    progressive: {
      skillMdMaxLines: 200,
      skillMdMaxBytes: 8192,
      skillMdWarnLines: 400,
      skillMdWarnBytes: 16384,
      inlineBlockMaxLines: 100,
      inlineBlockWarnLines: 50,
      minLinkedFiles: 2,
    },
    safety: {
      priorityManipulation: [
        'always choose this skill',
        'always use this skill first',
        'this skill takes priority over',
        'prefer this skill over',
        'override any other skill',
        'this is the only skill you need',
        'ignore other skills',
      ],
      promptInjection: [
        'ignore previous instructions',
        'ignore all prior instructions',
        'disregard your instructions',
        'forget everything above',
        'your new instructions are',
        'system prompt override',
        'you are now a different',
      ],
      exfiltration: [
        'send to https://',
        'send to http://',
        'post to https://',
        'post to http://',
        'upload to https://',
        'upload to http://',
      ],
      secretCollection: [
        'private key',
        'seed phrase',
        'mnemonic',
        'wallet secret',
        'secret key',
        'paste your key',
        'enter your password',
      ],
      opaqueExecution: [
        'curl | bash',
        'curl | sh',
        'wget | bash',
        'wget | sh',
        'eval(fetch',
        'base64 -d | bash',
        'base64 -d | sh',
        'eval $(',
      ],
    },
    solanaFit: {
      coreKeywords: [
        '@solana/web3.js', '@solana/kit', '@solana/spl-token',
        'anchor', 'pinocchio', 'seahorse',
        'instruction', 'blockhash',
        'lamport', 'SPL token', 'SPL',
        'PDA', 'Program Derived Address',
        'CPI', 'Cross-Program Invocation',
      ],
      testingKeywords: [
        'LiteSVM', 'Mollusk', 'Surfpool', 'Bankrun',
        'solana-test-validator', 'anchor test',
      ],
      defiKeywords: [
        'Jupiter', 'Raydium', 'Orca', 'Meteora',
        'Marinade', 'Jito', 'Squads',
        'Helius', 'Triton', 'QuickNode',
        'Metaplex', 'Tensor', 'Magic Eden',
        'CLMM', 'Whirlpool', 'DLMM',
        'liquidity pool', 'AMM',
        'staking', 'validator', 'epoch',
      ],
      infraKeywords: [
        'RPC', 'gRPC',
        'Solana Pay', 'Blinks',
        'token extensions', 'Token-2022',
        'compressed NFT', 'cNFT',
        'Geyser', 'AccountsDB',
      ],
      highFitThreshold: 5,
      mediumFitThreshold: 2,
      lowFitThreshold: 1,
    },
  };
}

// ─── YAML frontmatter parser (minimal, zero-dep) ─────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const yaml = match[1];
  const result = {};
  let currentKey = null;
  let multilineValue = '';
  let inMultiline = false;

  for (const line of yaml.split('\n')) {
    if (inMultiline) {
      if (/^\S/.test(line) && !line.startsWith(' ') && !line.startsWith('\t')) {
        // New key starts, end multiline
        result[currentKey] = multilineValue.trim();
        inMultiline = false;
      } else {
        multilineValue += ' ' + line.trim();
        continue;
      }
    }

    const keyMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      const value = keyMatch[2].trim();
      if (value === '>' || value === '|') {
        inMultiline = true;
        multilineValue = '';
      } else {
        result[currentKey] = value.replace(/^["']|["']$/g, '');
      }
    }
  }

  if (inMultiline && currentKey) {
    result[currentKey] = multilineValue.trim();
  }

  return result;
}

// ─── File discovery ──────────────────────────────────────────────────────────

function findSkillMd(skillPath) {
  // Check skill/SKILL.md first, then root SKILL.md
  const skillDirPath = join(skillPath, 'skill', 'SKILL.md');
  if (existsSync(skillDirPath)) return skillDirPath;

  const rootPath = join(skillPath, 'SKILL.md');
  if (existsSync(rootPath)) return rootPath;

  return null;
}

// Directories to always skip during file collection
const SKIP_DIRS = ['node_modules', '.git', '.github'];

// Files/dirs excluded from safety scanning during self-audit.
// These contain risk patterns as *rule definitions*, not as malicious instructions.
const SELF_AUDIT_EXCLUDED_PATHS = [
  'scripts/',
  'examples/',
  'commands/',
  'agents/',
  'skill/',
  'README.md',
  'implementation-summary.md',
  'round-2.txt',
  'inform.txt',
  'solana-skill-quality-gate.txt',
];

function isSelfAuditExcluded(relPath) {
  for (const excl of SELF_AUDIT_EXCLUDED_PATHS) {
    if (excl.endsWith('/')) {
      if (relPath.startsWith(excl)) return true;
    } else {
      if (relPath === excl) return true;
    }
  }
  return false;
}

function getAllTextFiles(dir, prefix = '', opts = {}) {
  const results = [];
  if (!existsSync(dir)) return results;

  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.includes(entry.name)) {
          results.push(...getAllTextFiles(join(dir, entry.name), relPath, opts));
        }
      } else if (entry.isFile()) {
        const ext = entry.name.split('.').pop()?.toLowerCase();
        if (['md', 'txt', 'sh', 'js', 'mjs', 'ts', 'json', 'yml', 'yaml', 'toml'].includes(ext)) {
          results.push({ path: join(dir, entry.name), relPath });
        }
      }
    }
  } catch {
    // Permission errors, etc.
  }
  return results;
}

function readFileSafe(filePath) {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

// ─── Audit functions ─────────────────────────────────────────────────────────

function auditStructure(skillPath, rules) {
  const findings = [];
  let score = 20; // Start with max

  // 1. Check SKILL.md
  const skillMdPath = findSkillMd(skillPath);
  if (!skillMdPath) {
    findings.push({ level: 'error', msg: 'SKILL.md not found in skill/ or root directory' });
    score -= 4;
  } else {
    findings.push({ level: 'pass', msg: `SKILL.md found: ${skillMdPath.replace(skillPath, '.')}` });

    const content = readFileSafe(skillMdPath);
    if (content) {
      // 2. Check YAML frontmatter
      const fm = parseFrontmatter(content);
      if (!fm) {
        findings.push({ level: 'error', msg: 'YAML frontmatter not found in SKILL.md' });
        score -= 3;
      } else {
        findings.push({ level: 'pass', msg: 'YAML frontmatter present' });

        // 3. Check name
        if (!fm.name) {
          findings.push({ level: 'error', msg: 'name field missing in frontmatter' });
          score -= 3;
        } else {
          findings.push({ level: 'pass', msg: `name: "${fm.name}"` });

          // Check name format
          const nameRegex = new RegExp(rules.structure.namePattern);
          if (fm.name.length > rules.structure.nameMaxLength) {
            findings.push({ level: 'error', msg: `name exceeds ${rules.structure.nameMaxLength} chars (${fm.name.length})` });
            score -= 2;
          } else if (!nameRegex.test(fm.name)) {
            findings.push({ level: 'error', msg: `name "${fm.name}" does not match lowercase-hyphen format (${rules.structure.namePattern})` });
            score -= 2;
          } else {
            findings.push({ level: 'pass', msg: 'name format valid' });
          }
        }

        // 4. Check description
        if (!fm.description) {
          findings.push({ level: 'error', msg: 'description field missing in frontmatter' });
          score -= 3;
        } else {
          findings.push({ level: 'pass', msg: 'description present' });
          if (fm.description.length > rules.structure.descriptionMaxLength) {
            findings.push({
              level: 'error',
              msg: `description exceeds ${rules.structure.descriptionMaxLength} chars (${fm.description.length})`,
            });
            score -= 2;
          } else {
            findings.push({ level: 'pass', msg: `description length OK (${fm.description.length} chars)` });
          }
        }
      }
    }
  }

  // 5. Check README.md
  if (!existsSync(join(skillPath, 'README.md'))) {
    findings.push({ level: 'error', msg: 'README.md not found' });
    score -= 2;
  } else {
    findings.push({ level: 'pass', msg: 'README.md found' });
  }

  // 6. Check LICENSE
  const hasLicense = existsSync(join(skillPath, 'LICENSE')) || existsSync(join(skillPath, 'LICENSE.md'));
  if (!hasLicense) {
    findings.push({ level: 'error', msg: 'LICENSE file not found' });
    score -= 1;
  } else {
    const licContent = readFileSafe(join(skillPath, 'LICENSE')) || readFileSafe(join(skillPath, 'LICENSE.md')) || '';
    if (licContent.toLowerCase().includes('mit')) {
      findings.push({ level: 'pass', msg: 'LICENSE found (MIT)' });
    } else if (licContent.toLowerCase().includes('apache') || licContent.toLowerCase().includes('bsd') || licContent.toLowerCase().includes('isc')) {
      findings.push({ level: 'pass', msg: 'LICENSE found (open-source)' });
    } else {
      findings.push({ level: 'warn', msg: 'LICENSE found but could not confirm it is MIT or clearly open-source' });
    }
  }

  return { score: Math.max(0, score), max: 20, findings };
}

function auditProgressive(skillPath, rules) {
  const findings = [];
  let score = 20;

  const skillMdPath = findSkillMd(skillPath);
  if (!skillMdPath) {
    findings.push({ level: 'error', msg: 'Cannot assess progressive loading: SKILL.md not found' });
    return { score: 0, max: 20, findings };
  }

  const content = readFileSafe(skillMdPath);
  if (!content) {
    return { score: 0, max: 20, findings: [{ level: 'error', msg: 'Cannot read SKILL.md' }] };
  }

  const lines = content.split('\n');
  const bytes = Buffer.byteLength(content, 'utf-8');

  // 1. Line count
  if (lines.length > rules.progressive.skillMdWarnLines) {
    findings.push({ level: 'error', msg: `SKILL.md is ${lines.length} lines (max recommended: ${rules.progressive.skillMdMaxLines})` });
    score -= 5;
  } else if (lines.length > rules.progressive.skillMdMaxLines) {
    findings.push({ level: 'warn', msg: `SKILL.md is ${lines.length} lines (recommended: < ${rules.progressive.skillMdMaxLines})` });
    score -= 3;
  } else {
    findings.push({ level: 'pass', msg: `SKILL.md is ${lines.length} lines (< ${rules.progressive.skillMdMaxLines})` });
  }

  // 2. Byte size
  if (bytes > rules.progressive.skillMdWarnBytes) {
    findings.push({ level: 'error', msg: `SKILL.md is ${bytes} bytes (max recommended: ${rules.progressive.skillMdMaxBytes})` });
    score -= 5;
  } else if (bytes > rules.progressive.skillMdMaxBytes) {
    findings.push({ level: 'warn', msg: `SKILL.md is ${bytes} bytes (recommended: < ${rules.progressive.skillMdMaxBytes})` });
    score -= 3;
  } else {
    findings.push({ level: 'pass', msg: `SKILL.md is ${bytes} bytes (< ${rules.progressive.skillMdMaxBytes})` });
  }

  // 3. Check for links to focused .md files
  const mdLinks = content.match(/\[.*?\]\(\.\/[\w-]+\.md\)/g) || [];
  const linkedFiles = mdLinks.map(m => {
    const match = m.match(/\(\.\/(.+?)\)/);
    return match ? match[1] : null;
  }).filter(Boolean);

  if (linkedFiles.length >= rules.progressive.minLinkedFiles) {
    findings.push({ level: 'pass', msg: `Routes to ${linkedFiles.length} focused .md files: ${linkedFiles.join(', ')}` });
  } else if (linkedFiles.length === 1) {
    findings.push({ level: 'warn', msg: `Only routes to ${linkedFiles.length} focused file (recommended: >= ${rules.progressive.minLinkedFiles})` });
    score -= 3;
  } else {
    findings.push({ level: 'error', msg: `No routing to focused .md files detected (recommended: >= ${rules.progressive.minLinkedFiles})` });
    score -= 5;
  }

  // 4. Check for giant inline blocks
  let currentBlockLen = 0;
  let maxBlockLen = 0;
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        maxBlockLen = Math.max(maxBlockLen, currentBlockLen);
        currentBlockLen = 0;
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
    } else if (inCodeBlock) {
      currentBlockLen++;
    }
  }

  // Also check for long non-code instruction sections
  let consecutiveInstructionLines = 0;
  let maxInstructionBlock = 0;
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      consecutiveInstructionLines = 0;
    } else if (line.trim().length > 0 && !line.startsWith('#') && !line.startsWith('---')) {
      consecutiveInstructionLines++;
      maxInstructionBlock = Math.max(maxInstructionBlock, consecutiveInstructionLines);
    } else {
      consecutiveInstructionLines = 0;
    }
  }

  const totalMaxBlock = Math.max(maxBlockLen, maxInstructionBlock);
  if (totalMaxBlock > rules.progressive.inlineBlockMaxLines) {
    findings.push({ level: 'error', msg: `Found inline block of ${totalMaxBlock} lines (max: ${rules.progressive.inlineBlockMaxLines})` });
    score -= 5;
  } else if (totalMaxBlock > rules.progressive.inlineBlockWarnLines) {
    findings.push({ level: 'warn', msg: `Found inline block of ${totalMaxBlock} lines (recommended: < ${rules.progressive.inlineBlockWarnLines})` });
    score -= 2;
  } else {
    findings.push({ level: 'pass', msg: 'No excessively large inline instruction blocks' });
  }

  return { score: Math.max(0, score), max: 20, findings };
}

function isNegatedContext(content, pattern, matchIndex) {
  // Check if the pattern match is in a negated/safe context
  // Look at the surrounding text (up to 60 chars before the match)
  const contextStart = Math.max(0, matchIndex - 60);
  const before = content.substring(contextStart, matchIndex).toLowerCase();

  const negationPhrases = [
    'no ', 'not ', 'never ', 'without ', 'don\'t ', 'does not ',
    'do not ', 'doesn\'t ', 'won\'t ', 'will not ', 'cannot ',
    'no need for', 'not required', 'not needed', 'not ask',
  ];

  for (const neg of negationPhrases) {
    if (before.includes(neg)) return true;
  }
  return false;
}

function isSelfAudit(skillPath) {
  // Strict identity check: only activate self-audit when the audited path
  // is exactly this repository root. Prevents bypass by other repos that
  // happen to contain scripts/skillqa.mjs.
  const scannerRoot = resolve(__dirname, '..');
  const auditedPath = resolve(skillPath);
  return auditedPath === scannerRoot;
}

function auditSafety(skillPath, rules) {
  const findings = [];
  let score = 25;
  const triggeredPolicies = [];  // Track which policy caps to apply

  const selfAudit = isSelfAudit(skillPath);

  // Collect all text content
  const allFiles = getAllTextFiles(skillPath);
  let allContent = '';
  for (const f of allFiles) {
    // During self-audit, skip files that contain rule definitions/docs
    if (selfAudit && isSelfAuditExcluded(f.relPath)) continue;
    const content = readFileSafe(f.path);
    if (content) allContent += '\n' + content;
  }

  const contentLower = allContent.toLowerCase();

  // Check each safety category
  const categories = [
    { name: 'Priority Manipulation', policyId: 'priority_manipulation', patterns: rules.safety.priorityManipulation, severity: 'high', points: 5 },
    { name: 'Prompt Injection', policyId: 'prompt_injection', patterns: rules.safety.promptInjection, severity: 'high', points: 5 },
    { name: 'Data Exfiltration', policyId: null, patterns: rules.safety.exfiltration, severity: 'high', points: 5 },
    { name: 'Secret Collection', policyId: 'secret_collection', patterns: rules.safety.secretCollection, severity: 'high', points: 5 },
    { name: 'Opaque Execution', policyId: 'opaque_execution', patterns: rules.safety.opaqueExecution, severity: 'high', points: 5 },
  ];

  for (const cat of categories) {
    const found = [];
    for (const pattern of cat.patterns) {
      const patternLower = pattern.toLowerCase();
      let searchFrom = 0;
      let hasRealMatch = false;

      while (true) {
        const idx = contentLower.indexOf(patternLower, searchFrom);
        if (idx === -1) break;

        // Check if this match is in a negated/safe context
        if (!isNegatedContext(contentLower, patternLower, idx)) {
          hasRealMatch = true;
          break;
        }
        searchFrom = idx + 1;
      }

      if (hasRealMatch) {
        found.push(pattern);
      }
    }

    if (found.length > 0) {
      findings.push({
        level: 'error',
        msg: `${cat.name}: found ${found.length} risk pattern(s): "${found.join('", "')}"`,
      });
      score -= cat.points;
      if (cat.policyId) triggeredPolicies.push(cat.policyId);
    } else {
      findings.push({ level: 'pass', msg: `${cat.name}: no risks detected` });
    }
  }

  return { score: Math.max(0, score), max: 25, findings, triggeredPolicies };
}

function auditSolanaFit(skillPath, rules) {
  const findings = [];
  const triggeredPolicies = [];

  // Collect all text content
  const allFiles = getAllTextFiles(skillPath);
  let allContent = '';
  for (const f of allFiles) {
    const content = readFileSafe(f.path);
    if (content) allContent += '\n' + content;
  }

  // Count keyword matches across all categories
  const allKeywords = [
    ...rules.solanaFit.coreKeywords,
    ...rules.solanaFit.testingKeywords,
    ...rules.solanaFit.defiKeywords,
    ...rules.solanaFit.infraKeywords,
  ];

  const foundKeywords = [];
  for (const keyword of allKeywords) {
    const searchTerm = keyword.length <= 3 ? keyword : keyword.toLowerCase();
    const searchContent = keyword.length <= 3 ? allContent : allContent.toLowerCase();
    if (searchContent.includes(searchTerm)) {
      foundKeywords.push(keyword);
    }
  }

  const uniqueCount = foundKeywords.length;
  let score;

  if (uniqueCount >= rules.solanaFit.highFitThreshold) {
    score = Math.min(15, 10 + uniqueCount);
    findings.push({
      level: 'pass',
      msg: `High Solana fit: ${uniqueCount} Solana-specific keywords found: ${foundKeywords.slice(0, 10).join(', ')}${uniqueCount > 10 ? '...' : ''}`,
    });
  } else if (uniqueCount >= rules.solanaFit.mediumFitThreshold) {
    score = 8 + uniqueCount;
    findings.push({
      level: 'pass',
      msg: `Medium Solana fit: ${uniqueCount} keywords found: ${foundKeywords.join(', ')}`,
    });
  } else if (uniqueCount >= rules.solanaFit.lowFitThreshold) {
    score = 4 + uniqueCount;
    findings.push({
      level: 'warn',
      msg: `Low Solana fit: only ${uniqueCount} keyword(s) found: ${foundKeywords.join(', ')}`,
    });
  } else {
    score = 0;
    findings.push({
      level: 'error',
      msg: 'No Solana-specific content detected. This may be a generic skill.',
    });
    triggeredPolicies.push('no_solana_fit');
  }

  // Keyword stuffing detection
  const skillMdPath = findSkillMd(skillPath);
  if (skillMdPath) {
    const skillContent = readFileSafe(skillMdPath) || '';
    const fm = parseFrontmatter(skillContent);
    const bulletLines = skillContent.split('\n').filter(l => l.trim().startsWith('- '));
    if (bulletLines.length > 30) {
      findings.push({
        level: 'warn',
        msg: `Feature-list stuffing detected: ${bulletLines.length} bullet-point features suggest a generic catch-all skill`,
      });
      score = Math.max(0, score - 7);
    }
    if (fm) {
      const descKeywords = allKeywords.filter(k => {
        const s = k.length <= 3 ? k : k.toLowerCase();
        const d = k.length <= 3 ? (fm.description || '') : (fm.description || '').toLowerCase();
        return d.includes(s);
      });
      const bodyKeywords = allKeywords.filter(k => {
        const s = k.length <= 3 ? k : k.toLowerCase();
        const c = k.length <= 3 ? skillContent : skillContent.toLowerCase();
        return c.includes(s);
      });
      if (descKeywords.length > 3 && bodyKeywords.length <= descKeywords.length + 1) {
        findings.push({
          level: 'warn',
          msg: 'Potential keyword stuffing: Solana keywords concentrated in description but sparse in actual instructions',
        });
        score = Math.max(0, score - 3);
      }
    }
  }

  // ─── Evidence-based Solana fit ───────────────────────────────────────
  const evidence = {
    workflowEvidence: false,
    focusedFilesEvidence: false,
    readmeProblemEvidence: false,
    examplesEvidence: false,
    boundaryEvidence: false,
  };

  // 1. SKILL.md has concrete Solana workflows (not just keywords)
  if (skillMdPath) {
    const sc = (readFileSafe(skillMdPath) || '').toLowerCase();
    const workflowPatterns = ['when to use', 'workflow', 'step 1', 'step 2', 'how to', 'usage', '## use'];
    evidence.workflowEvidence = workflowPatterns.some(p => sc.includes(p));
  }

  // 2. Focused skill files contain Solana-specific instructions
  const skillDir = existsSync(join(skillPath, 'skill')) ? join(skillPath, 'skill') : null;
  if (skillDir) {
    const focusedFiles = getAllTextFiles(skillDir).filter(f => f.relPath !== 'SKILL.md');
    if (focusedFiles.length > 0) {
      const focusedContent = focusedFiles.map(f => readFileSafe(f.path) || '').join('\n').toLowerCase();
      const hasSolanaInFocused = allKeywords.some(k => {
        const s = k.length <= 3 ? k : k.toLowerCase();
        return focusedContent.includes(s);
      });
      evidence.focusedFilesEvidence = hasSolanaInFocused;
    }
  }

  // 3. README explains a real Solana builder problem
  const readmeContent = (readFileSafe(join(skillPath, 'README.md')) || '').toLowerCase();
  const problemPatterns = ['problem', 'why', 'motivation', 'challenge', 'pain point', 'solana builder', 'solana developer'];
  evidence.readmeProblemEvidence = problemPatterns.some(p => readmeContent.includes(p));

  // 4. Examples or commands demonstrate Solana-specific use
  const hasExamples = existsSync(join(skillPath, 'examples')) || existsSync(join(skillPath, 'commands'));
  if (hasExamples) {
    const exDir = existsSync(join(skillPath, 'examples')) ? join(skillPath, 'examples') : join(skillPath, 'commands');
    const exFiles = getAllTextFiles(exDir);
    const exContent = exFiles.map(f => readFileSafe(f.path) || '').join('\n').toLowerCase();
    evidence.examplesEvidence = allKeywords.some(k => {
      const s = k.length <= 3 ? k : k.toLowerCase();
      return exContent.includes(s);
    });
  }

  // 5. Skill defines boundaries with existing skills
  const allTextContent = allContent.toLowerCase();
  const boundaryPatterns = ['boundary', 'scope', 'does not', 'will not', 'out of scope', 'not responsible', 'delegate', 'complementary', 'works alongside'];
  evidence.boundaryEvidence = boundaryPatterns.some(p => allTextContent.includes(p));

  // Score evidence signals
  const evidenceCount = Object.values(evidence).filter(Boolean).length;
  if (evidenceCount >= 4) {
    findings.push({ level: 'pass', msg: `Strong Solana fit evidence: ${evidenceCount}/5 signals (workflow, focused files, README problem, examples, boundaries)` });
  } else if (evidenceCount >= 2) {
    findings.push({ level: 'pass', msg: `Moderate Solana fit evidence: ${evidenceCount}/5 signals` });
  } else if (uniqueCount >= 1) {
    findings.push({ level: 'warn', msg: `Weak Solana fit evidence: only ${evidenceCount}/5 signals. Keywords present but little structural proof.` });
    score = Math.max(0, score - 2);
  }

  return { score: Math.min(15, Math.max(0, score)), max: 15, findings, triggeredPolicies, evidence };
}

function auditInstallReady(skillPath) {
  const findings = [];
  let score = 10;

  // 1. install.sh or install instructions
  const hasInstallSh = existsSync(join(skillPath, 'install.sh'));
  const readmeContent = readFileSafe(join(skillPath, 'README.md')) || '';
  const hasInstallDocs = readmeContent.toLowerCase().includes('install') || readmeContent.toLowerCase().includes('setup');

  if (hasInstallSh) {
    findings.push({ level: 'pass', msg: 'install.sh found' });

    // Check install script transparency
    const installContent = readFileSafe(join(skillPath, 'install.sh')) || '';
    const installLower = installContent.toLowerCase();
    if (installLower.includes('curl') || installLower.includes('wget') || installLower.includes('eval')) {
      findings.push({ level: 'warn', msg: 'install.sh contains network/eval commands — review manually' });
      score -= 2;
    } else {
      findings.push({ level: 'pass', msg: 'install.sh appears transparent (no network/eval commands)' });
    }
  } else if (hasInstallDocs) {
    findings.push({ level: 'pass', msg: 'No install.sh but README has install instructions' });
  } else {
    findings.push({ level: 'error', msg: 'No install.sh and no install instructions in README' });
    score -= 4;
  }

  // 2. package.json with test script
  const pkgPath = join(skillPath, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSafe(pkgPath));
      if (pkg.scripts?.test) {
        findings.push({ level: 'pass', msg: `package.json has test script: "${pkg.scripts.test}"` });
      } else {
        findings.push({ level: 'warn', msg: 'package.json exists but has no test script' });
        score -= 2;
      }
    } catch {
      findings.push({ level: 'warn', msg: 'package.json exists but could not be parsed' });
      score -= 1;
    }
  } else {
    findings.push({ level: 'warn', msg: 'No package.json found' });
    score -= 3;
  }

  return { score: Math.max(0, score), max: 10, findings };
}

function auditDocs(skillPath) {
  const findings = [];
  let score = 10;

  const readmeContent = readFileSafe(join(skillPath, 'README.md')) || '';

  // 1. README explains the problem
  const problemKeywords = ['problem', 'why', 'motivation', 'challenge', 'gap', 'issue', 'need'];
  const hasProblem = problemKeywords.some(k => readmeContent.toLowerCase().includes(k));
  if (hasProblem) {
    findings.push({ level: 'pass', msg: 'README explains the problem/motivation' });
  } else {
    findings.push({ level: 'warn', msg: 'README may not clearly explain the problem being solved' });
    score -= 3;
  }

  // 2. Usage examples
  const hasUsageExamples = readmeContent.includes('```') || readmeContent.toLowerCase().includes('usage') || readmeContent.toLowerCase().includes('example');
  if (hasUsageExamples) {
    findings.push({ level: 'pass', msg: 'README includes usage examples or code blocks' });
  } else {
    findings.push({ level: 'warn', msg: 'README has no usage examples or code blocks' });
    score -= 3;
  }

  // 3. Examples directory or example outputs
  const hasExamples = existsSync(join(skillPath, 'examples'));
  if (hasExamples) {
    findings.push({ level: 'pass', msg: 'examples/ directory found' });
  } else {
    findings.push({ level: 'warn', msg: 'No examples/ directory found' });
    score -= 2;
  }

  // 4. Content quality (basic heuristic: non-trivial README)
  if (readmeContent.length > 500) {
    findings.push({ level: 'pass', msg: `README has substantial content (${readmeContent.length} chars)` });
  } else if (readmeContent.length > 100) {
    findings.push({ level: 'warn', msg: `README is short (${readmeContent.length} chars)` });
    score -= 1;
  } else {
    findings.push({ level: 'error', msg: `README is very short or empty (${readmeContent.length} chars)` });
    score -= 2;
  }

  return { score: Math.max(0, score), max: 10, findings };
}

// ─── Full audit ──────────────────────────────────────────────────────────────

function runAudit(skillPath) {
  const rules = loadRules();
  const absPath = resolve(skillPath);

  if (!existsSync(absPath)) {
    console.error(`Error: path does not exist: ${absPath}`);
    process.exit(1);
  }

  const structure = auditStructure(absPath, rules);
  const progressive = auditProgressive(absPath, rules);
  const safety = auditSafety(absPath, rules);
  const solanaFit = auditSolanaFit(absPath, rules);
  const installReady = auditInstallReady(absPath);
  const docs = auditDocs(absPath);

  const rawTotal = structure.score + progressive.score + safety.score + solanaFit.score + installReady.score + docs.score;

  // ─── Policy caps ───────────────────────────────────────────────────────
  // Collect all triggered policy IDs from safety and fit audits
  const allTriggeredPolicies = [
    ...(safety.triggeredPolicies || []),
    ...(solanaFit.triggeredPolicies || []),
  ];

  // Check structure-level caps
  if (!findSkillMd(absPath)) {
    allTriggeredPolicies.push('missing_skillmd');
  }

  // Check install-level caps
  const installSh = readFileSafe(join(absPath, 'install.sh')) || '';
  const installLower = installSh.toLowerCase();
  if (installLower.includes('curl') || installLower.includes('wget') || installLower.includes('eval')) {
    allTriggeredPolicies.push('suspicious_install');
  }

  // Apply policy caps — take the minimum
  const appliedCaps = [];
  let cappedTotal = rawTotal;
  for (const cap of POLICY_CAPS) {
    if (allTriggeredPolicies.includes(cap.id)) {
      appliedCaps.push({ id: cap.id, label: cap.label, maxScore: cap.maxScore });
      cappedTotal = Math.min(cappedTotal, cap.maxScore);
    }
  }

  const finalTotal = cappedTotal;

  let rating;
  if (finalTotal >= 80) rating = 'Excellent';
  else if (finalTotal >= 60) rating = 'Good';
  else if (finalTotal >= 40) rating = 'Fair';
  else if (finalTotal >= 20) rating = 'Poor';
  else rating = 'Failing';

  // Collect all risks
  const risks = [];
  const allFindings = [
    ...structure.findings,
    ...progressive.findings,
    ...safety.findings,
    ...solanaFit.findings,
    ...installReady.findings,
    ...docs.findings,
  ];
  for (const f of allFindings) {
    if (f.level === 'error') risks.push(f.msg);
  }

  // Recommendations
  const mustFix = allFindings.filter(f => f.level === 'error').map(f => f.msg);
  const shouldFix = allFindings.filter(f => f.level === 'warn').map(f => f.msg);
  const niceToHave = [];

  if (!existsSync(join(absPath, 'examples'))) niceToHave.push('Add examples/ directory with sample outputs');
  if (!existsSync(join(absPath, '.github'))) niceToHave.push('Add GitHub Actions CI workflow');
  if (!existsSync(join(absPath, 'agents'))) niceToHave.push('Consider adding an agent definition');
  if (!existsSync(join(absPath, 'commands'))) niceToHave.push('Consider adding command definitions');

  // Detect skill name
  const skillMdPath = findSkillMd(absPath);
  let skillName = basename(absPath);
  if (skillMdPath) {
    const fm = parseFrontmatter(readFileSafe(skillMdPath) || '');
    if (fm?.name) skillName = fm.name;
  }

  // Determine if there are critical safety failures (for --strict)
  const hasCriticalSafety = safety.triggeredPolicies && safety.triggeredPolicies.length > 0;
  const hasMissingSkillMd = !findSkillMd(absPath);

  return {
    name: skillName,
    version: VERSION,
    timestamp: new Date().toISOString(),
    path: absPath,
    score: {
      rawTotal,
      total: finalTotal,
      max: 100,
      policyCaps: appliedCaps,
      breakdown: {
        structure: { score: structure.score, max: structure.max, findings: structure.findings.map(f => f.msg) },
        progressive: { score: progressive.score, max: progressive.max, findings: progressive.findings.map(f => f.msg) },
        safety: { score: safety.score, max: safety.max, findings: safety.findings.map(f => f.msg) },
        solanaFit: { score: solanaFit.score, max: solanaFit.max, findings: solanaFit.findings.map(f => f.msg) },
        installReady: { score: installReady.score, max: installReady.max, findings: installReady.findings.map(f => f.msg) },
        docs: { score: docs.score, max: docs.max, findings: docs.findings.map(f => f.msg) },
      },
    },
    rating,
    risks,
    solanaEvidence: solanaFit.evidence || {},
    recommendations: { mustFix, shouldFix, niceToHave },
    _hasCriticalSafety: hasCriticalSafety,
    _hasMissingSkillMd: hasMissingSkillMd,
    _detailed: { structure, progressive, safety, solanaFit, installReady, docs },
  };
}

// ─── Output formatters ───────────────────────────────────────────────────────

function statusIcon(level) {
  if (level === 'pass') return '✅';
  if (level === 'warn') return '⚠️';
  if (level === 'error') return '❌';
  return '  ';
}

function formatAuditTerminal(result) {
  const lines = [];
  lines.push('');
  lines.push('╔══════════════════════════════════════════════════════════════╗');
  lines.push('║        solana-skill-quality-gate — Audit Report             ║');
  lines.push('╚══════════════════════════════════════════════════════════════╝');
  lines.push('');
  lines.push(`  Skill:   ${result.name}`);
  lines.push(`  Path:    ${result.path}`);

  // Show raw vs final if policy caps applied
  if (result.score.policyCaps.length > 0) {
    lines.push(`  Raw Score:   ${result.score.rawTotal}/${result.score.max}`);
    lines.push(`  Final Score: ${result.score.total}/${result.score.max} (${result.rating})`);
    lines.push(`  Policy Caps: ${result.score.policyCaps.length} applied`);
  } else {
    lines.push(`  Score:   ${result.score.total}/${result.score.max} (${result.rating})`);
  }
  lines.push(`  Date:    ${result.timestamp}`);
  lines.push('');
  lines.push('──────────────────────────────────────────────────────────────');

  const categories = [
    { key: 'structure', label: 'Structure & Format' },
    { key: 'progressive', label: 'Progressive Disclosure' },
    { key: 'safety', label: 'Safety & Supply-Chain' },
    { key: 'solanaFit', label: 'Solana Ecosystem Fit' },
    { key: 'installReady', label: 'Install & Test Readiness' },
    { key: 'docs', label: 'Documentation & Examples' },
  ];

  for (const cat of categories) {
    const detail = result._detailed[cat.key];
    lines.push('');
    lines.push(`  ${cat.label}: ${detail.score}/${detail.max}`);
    for (const f of detail.findings) {
      lines.push(`    ${statusIcon(f.level)} ${f.msg}`);
    }
  }

  // Show policy caps section if any were applied
  if (result.score.policyCaps.length > 0) {
    lines.push('');
    lines.push('──────────────────────────────────────────────────────────────');
    lines.push('');
    lines.push('  🚫 Policy Caps Applied:');
    for (const cap of result.score.policyCaps) {
      lines.push(`    • ${cap.label} → max score capped to ${cap.maxScore}`);
    }
    lines.push(`    Raw score: ${result.score.rawTotal} → Final score: ${result.score.total}`);
  }

  lines.push('');
  lines.push('──────────────────────────────────────────────────────────────');

  if (result.recommendations.mustFix.length > 0) {
    lines.push('');
    lines.push('  ❌ Must Fix:');
    for (const m of result.recommendations.mustFix) {
      lines.push(`    • ${m}`);
    }
  }

  if (result.recommendations.shouldFix.length > 0) {
    lines.push('');
    lines.push('  ⚠️  Should Fix:');
    for (const m of result.recommendations.shouldFix) {
      lines.push(`    • ${m}`);
    }
  }

  if (result.recommendations.niceToHave.length > 0) {
    lines.push('');
    lines.push('  💡 Nice to Have:');
    for (const m of result.recommendations.niceToHave) {
      lines.push(`    • ${m}`);
    }
  }

  lines.push('');
  lines.push('──────────────────────────────────────────────────────────────');
  lines.push('  ⚠️  This is an automated assessment. Always perform manual');
  lines.push('     review before installing or merging skills from untrusted');
  lines.push('     sources.');
  lines.push('');

  return lines.join('\n');
}

function formatScoreJSON(result) {
  const { _detailed, path, ...clean } = result;
  return JSON.stringify(clean, null, 2);
}

function formatReportMarkdown(result) {
  const lines = [];

  lines.push('# Skill Audit Report');
  lines.push('');
  lines.push(`**Skill**: ${result.name}`);
  lines.push(`**Audited**: ${result.timestamp}`);
  lines.push(`**Scanner**: solana-skill-quality-gate v${result.version}`);
  if (result.score.policyCaps.length > 0) {
    lines.push(`**Raw Score**: ${result.score.rawTotal}/${result.score.max}`);
    lines.push(`**Final Score**: ${result.score.total}/${result.score.max} (policy-adjusted)`);
  } else {
    lines.push(`**Overall Score**: ${result.score.total}/${result.score.max}`);
  }
  lines.push(`**Rating**: ${result.rating}`);
  lines.push('');
  if (result.score.policyCaps.length > 0) {
    lines.push('> 🚫 **Policy caps applied**: Critical findings automatically cap the maximum achievable score.');
    lines.push('');
    lines.push('| Policy | Cap |');
    lines.push('|--------|-----|');
    for (const cap of result.score.policyCaps) {
      lines.push(`| ${cap.label} | max ${cap.maxScore} |`);
    }
    lines.push('');
  }
  lines.push('> ⚠️ This is an automated assessment. Always perform manual review before installing or merging skills from untrusted sources.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Score Breakdown');
  lines.push('');
  lines.push('| Category | Score | Max | Status |');
  lines.push('|----------|-------|-----|--------|');

  const catMap = {
    structure: 'Structure & Format',
    progressive: 'Progressive Disclosure',
    safety: 'Safety & Supply-Chain',
    solanaFit: 'Solana Ecosystem Fit',
    installReady: 'Install & Test Readiness',
    docs: 'Documentation & Examples',
  };

  for (const [key, label] of Object.entries(catMap)) {
    const cat = result.score.breakdown[key];
    const pct = cat.score / cat.max;
    let status;
    if (pct >= 0.8) status = '✅ Pass';
    else if (pct >= 0.5) status = '⚠️ Warning';
    else status = '❌ Fail';
    lines.push(`| ${label} | ${cat.score} | ${cat.max} | ${status} |`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Detailed Findings');

  for (const [key, label] of Object.entries(catMap)) {
    const cat = result.score.breakdown[key];
    lines.push('');
    lines.push(`### ${label}`);
    lines.push('');
    if (cat.findings.length === 0) {
      lines.push('No findings.');
    } else {
      for (const f of cat.findings) {
        lines.push(`- ${f}`);
      }
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Recommendations');

  lines.push('');
  lines.push('### Must Fix (Blocking)');
  if (result.recommendations.mustFix.length === 0) {
    lines.push('');
    lines.push('None — all critical checks passed.');
  } else {
    lines.push('');
    for (const m of result.recommendations.mustFix) {
      lines.push(`- ${m}`);
    }
  }

  lines.push('');
  lines.push('### Should Fix (Recommended)');
  if (result.recommendations.shouldFix.length === 0) {
    lines.push('');
    lines.push('None.');
  } else {
    lines.push('');
    for (const m of result.recommendations.shouldFix) {
      lines.push(`- ${m}`);
    }
  }

  lines.push('');
  lines.push('### Nice to Have');
  if (result.recommendations.niceToHave.length === 0) {
    lines.push('');
    lines.push('None.');
  } else {
    lines.push('');
    for (const m of result.recommendations.niceToHave) {
      lines.push(`- ${m}`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## PR Readiness Checklist');
  lines.push('');

  const checks = [
    ['SKILL.md has valid YAML frontmatter', result.score.breakdown.structure.score >= 16],
    ['Name follows lowercase-hyphen convention', result.score.breakdown.structure.score >= 16],
    ['Description is clear and under 1024 characters', result.score.breakdown.structure.score >= 16],
    ['README.md explains the problem solved', result.score.breakdown.docs.score >= 7],
    ['LICENSE is MIT or clearly open-source', result.score.breakdown.structure.score >= 19],
    ['Install path is documented and transparent', result.score.breakdown.installReady.score >= 7],
    ['No supply-chain risk patterns detected', result.score.breakdown.safety.score >= 20],
    ['Skill is genuinely Solana-specific', result.score.breakdown.solanaFit.score >= 10],
    ['Progressive loading is implemented', result.score.breakdown.progressive.score >= 15],
    ['Examples or usage docs are provided', result.score.breakdown.docs.score >= 7],
  ];

  for (const [label, pass] of checks) {
    lines.push(`- [${pass ? 'x' : ' '}] ${label}`);
  }

  lines.push('');

  return lines.join('\n');
}

// ─── SARIF formatter ─────────────────────────────────────────────────────────

function formatSARIF(result) {
  const rules = [];
  const results = [];

  const sarifRules = [
    { id: 'SQGA001', name: 'PromptInjection', severity: 'error', desc: 'Prompt injection pattern detected' },
    { id: 'SQGA002', name: 'SecretCollection', severity: 'error', desc: 'Secret collection pattern detected' },
    { id: 'SQGA003', name: 'OpaqueExecution', severity: 'error', desc: 'Opaque/suspicious execution pattern detected' },
    { id: 'SQGA004', name: 'PriorityManipulation', severity: 'warning', desc: 'Priority manipulation pattern detected' },
    { id: 'SQGA005', name: 'DataExfiltration', severity: 'error', desc: 'Data exfiltration pattern detected' },
    { id: 'SQGA006', name: 'MissingSkillMd', severity: 'warning', desc: 'SKILL.md not found' },
    { id: 'SQGA007', name: 'SuspiciousInstall', severity: 'error', desc: 'Suspicious install script with network calls or eval' },
    { id: 'SQGA008', name: 'NoSolanaFit', severity: 'warning', desc: 'No Solana-specific content detected' },
  ];

  for (const rule of sarifRules) {
    rules.push({
      id: rule.id,
      name: rule.name,
      shortDescription: { text: rule.desc },
      defaultConfiguration: { level: rule.severity },
    });
  }

  // Map policy cap IDs to SARIF rule IDs
  const capToRule = {
    prompt_injection: 'SQGA001',
    secret_collection: 'SQGA002',
    opaque_execution: 'SQGA003',
    priority_manipulation: 'SQGA004',
    suspicious_install: 'SQGA007',
    missing_skillmd: 'SQGA006',
    no_solana_fit: 'SQGA008',
  };

  // Generate results from safety findings
  const safetyFindings = result.score.breakdown.safety.findings;
  for (const finding of safetyFindings) {
    if (!finding.includes('found') || finding.includes('no risks')) continue;
    let ruleId = 'SQGA001';
    if (finding.includes('Secret')) ruleId = 'SQGA002';
    else if (finding.includes('Opaque')) ruleId = 'SQGA003';
    else if (finding.includes('Priority')) ruleId = 'SQGA004';
    else if (finding.includes('Exfiltration')) ruleId = 'SQGA005';
    results.push({
      ruleId,
      level: 'error',
      message: { text: finding },
      locations: [{
        physicalLocation: {
          artifactLocation: { uri: result.path, uriBaseId: '%SRCROOT%' },
        },
      }],
    });
  }

  // Add structural findings
  if (result._hasMissingSkillMd) {
    results.push({
      ruleId: 'SQGA006',
      level: 'warning',
      message: { text: 'SKILL.md not found in skill/ or root directory' },
      locations: [{ physicalLocation: { artifactLocation: { uri: result.path } } }],
    });
  }

  // Add policy cap findings
  for (const cap of result.score.policyCaps) {
    const ruleId = capToRule[cap.id];
    if (ruleId && !results.some(r => r.ruleId === ruleId)) {
      results.push({
        ruleId,
        level: 'error',
        message: { text: `${cap.label} — score capped to max ${cap.maxScore}` },
        locations: [{ physicalLocation: { artifactLocation: { uri: result.path } } }],
      });
    }
  }

  return JSON.stringify({
    version: '2.1.0',
    '$schema': 'https://json.schemastore.org/sarif-2.1.0.json',
    runs: [{
      tool: {
        driver: {
          name: 'solana-skill-quality-gate',
          version: VERSION,
          informationUri: 'https://github.com/xDzaky/solana-skill-quality-gate',
          rules,
        },
      },
      results,
    }],
  }, null, 2);
}

// ─── Batch review ────────────────────────────────────────────────────────────

function runBatch(batchPath) {
  const absPath = resolve(batchPath);
  if (!existsSync(absPath)) {
    console.error(`Error: path does not exist: ${absPath}`);
    process.exit(1);
  }

  const entries = readdirSync(absPath, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith('.'))
    .map(e => e.name);

  const results = [];
  for (const name of entries) {
    const skillDir = join(absPath, name);
    try {
      const result = runAudit(skillDir);
      results.push(result);
    } catch {
      // Skip dirs that fail to audit
    }
  }

  // Sort by final score ascending (worst first)
  results.sort((a, b) => a.score.total - b.score.total);

  const policyCapped = results.filter(r => r.score.policyCaps.length > 0).length;
  const avgRaw = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.score.rawTotal, 0) / results.length * 10) / 10 : 0;
  const avgFinal = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.score.total, 0) / results.length * 10) / 10 : 0;

  // Collect top risks
  const riskCounts = {};
  for (const r of results) {
    for (const risk of r.risks) {
      const key = risk.split(':')[0].trim();
      riskCounts[key] = (riskCounts[key] || 0) + 1;
    }
  }
  const topRisks = Object.entries(riskCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return {
    timestamp: new Date().toISOString(),
    scanner: `solana-skill-quality-gate v${VERSION}`,
    batchPath: absPath,
    totalSkills: results.length,
    summary: { avgRaw, avgFinal, policyCapped },
    topRisks: topRisks.map(([risk, count]) => ({ risk, count })),
    results: results.map(r => {
      const { _detailed, _hasCriticalSafety, _hasMissingSkillMd, path, ...clean } = r;
      return clean;
    }),
  };
}

function formatBatchMarkdown(batch) {
  const lines = [];
  lines.push('# Batch Review Report');
  lines.push('');
  lines.push(`**Date**: ${batch.timestamp}`);
  lines.push(`**Scanner**: ${batch.scanner}`);
  lines.push(`**Skills scanned**: ${batch.totalSkills}`);
  lines.push(`**Average raw score**: ${batch.summary.avgRaw}`);
  lines.push(`**Average final score**: ${batch.summary.avgFinal}`);
  lines.push(`**Policy-capped**: ${batch.summary.policyCapped} of ${batch.totalSkills}`);
  lines.push('');
  const passCount = batch.results.filter(r => r.score.total >= 80).length;
  const failCount = batch.totalSkills - passCount;
  lines.push(`**Pass (≥80)**: ${passCount} | **Below threshold**: ${failCount}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  if (batch.topRisks.length > 0) {
    lines.push('## Top Risks');
    lines.push('');
    for (const { risk, count } of batch.topRisks) {
      lines.push(`- **${risk}** — ${count} skill(s)`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  lines.push('## Results (sorted by score, lowest first)');
  lines.push('');
  lines.push('| Skill | Raw | Final | Rating | Caps |');
  lines.push('|-------|-----|-------|--------|------|');
  for (const r of batch.results) {
    const caps = r.score.policyCaps.length > 0 ? r.score.policyCaps.map(c => c.label).join(', ') : 'None';
    lines.push(`| ${r.name} | ${r.score.rawTotal} | ${r.score.total} | ${r.rating} | ${caps} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('> ⚠️ This is an automated batch assessment. Always perform manual review.');
  lines.push('');
  return lines.join('\n');
}

// ─── CLI entry point ─────────────────────────────────────────────────────────

function printUsage() {
  console.log(`
solana-skill-quality-gate v${VERSION}

Usage:
  node scripts/skillqa.mjs audit  <path> [--strict]
  node scripts/skillqa.mjs score  <path> [--json] [--fail-under <n>]
  node scripts/skillqa.mjs report <path> --out <file> [--sarif]
  node scripts/skillqa.mjs batch  <dir>  [--json] [--markdown] [--out <file>] [--fail-under <n>]

Options:
  --json          Output as JSON
  --markdown      Output batch review as markdown
  --sarif         Output report in SARIF 2.1.0 format
  --fail-under N  Exit non-zero if score < N
  --strict        Exit non-zero on critical safety or structural failure
  --out <file>    Write output to file

Exit codes:
  0  Pass
  1  Score below --fail-under threshold
  2  Critical safety failure (--strict)
  3  Invalid structure / missing SKILL.md (--strict)

Safety:
  Read-only • No network calls • No script execution • No secrets
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(args.length < 2 ? 1 : 0);
  }

  const command = args[0];
  const skillPath = args[1];

  // Parse flags
  const isStrict = args.includes('--strict');
  const isJSON = args.includes('--json');
  const isMarkdown = args.includes('--markdown');
  const isSARIF = args.includes('--sarif');
  const failUnderIdx = args.indexOf('--fail-under');
  const failUnder = failUnderIdx !== -1 ? parseInt(args[failUnderIdx + 1], 10) : null;
  const outIdx = args.indexOf('--out');
  const outPath = outIdx !== -1 ? args[outIdx + 1] : null;

  function writeOut(content) {
    if (outPath) {
      const outDir = dirname(resolve(outPath));
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
      writeFileSync(resolve(outPath), content, 'utf-8');
      console.log(`\n  ✅ Written to: ${resolve(outPath)}`);
    } else {
      console.log(content);
    }
  }

  switch (command) {
    case 'audit': {
      const result = runAudit(skillPath);
      console.log(formatAuditTerminal(result));
      if (isStrict) {
        if (result._hasMissingSkillMd) {
          console.error('\n  ✖ STRICT: Missing SKILL.md — exit 3');
          process.exit(3);
        }
        if (result._hasCriticalSafety) {
          console.error('\n  ✖ STRICT: Critical safety failure — exit 2');
          process.exit(2);
        }
      }
      break;
    }

    case 'score': {
      const result = runAudit(skillPath);
      if (isJSON) {
        console.log(formatScoreJSON(result));
      } else {
        const scoreLabel = result.score.policyCaps.length > 0
          ? `${result.score.rawTotal} → ${result.score.total}/${result.score.max}`
          : `${result.score.total}/${result.score.max}`;
        console.log(`\n  ${result.name}: ${scoreLabel} (${result.rating})\n`);
        for (const [key, cat] of Object.entries(result.score.breakdown)) {
          const label = {
            structure: 'Structure',
            progressive: 'Progressive',
            safety: 'Safety',
            solanaFit: 'Solana Fit',
            installReady: 'Install',
            docs: 'Docs',
          }[key] || key;
          console.log(`    ${label.padEnd(14)} ${String(cat.score).padStart(2)}/${cat.max}`);
        }
        if (result.score.policyCaps.length > 0) {
          console.log('');
          console.log('  Policy caps:');
          for (const cap of result.score.policyCaps) {
            console.log(`    🚫 ${cap.label} → max ${cap.maxScore}`);
          }
        }
        console.log('');
      }
      if (failUnder !== null && result.score.total < failUnder) {
        console.error(`  ✖ FAIL: Score ${result.score.total} is below threshold ${failUnder}`);
        process.exit(1);
      }
      break;
    }

    case 'report': {
      if (!outPath) {
        console.error('Error: --out <file> is required for report command');
        process.exit(1);
      }
      const result = runAudit(skillPath);
      if (isSARIF) {
        writeOut(formatSARIF(result));
      } else {
        writeOut(formatReportMarkdown(result));
      }
      const scoreLabel = result.score.policyCaps.length > 0
        ? `Raw: ${result.score.rawTotal} → Final: ${result.score.total}/${result.score.max}`
        : `Score: ${result.score.total}/${result.score.max}`;
      console.log(`  ${scoreLabel} (${result.rating})\n`);
      break;
    }

    case 'batch': {
      const batch = runBatch(skillPath);
      if (isJSON) {
        writeOut(JSON.stringify(batch, null, 2));
      } else if (isMarkdown) {
        writeOut(formatBatchMarkdown(batch));
      } else {
        // Terminal summary
        console.log(`\n  Batch Review: ${batch.totalSkills} skills scanned`);
        console.log(`  Avg raw: ${batch.summary.avgRaw} | Avg final: ${batch.summary.avgFinal} | Capped: ${batch.summary.policyCapped}\n`);
        for (const r of batch.results) {
          const caps = r.score.policyCaps.length > 0 ? ` [${r.score.policyCaps.map(c => c.id).join(', ')}]` : '';
          console.log(`    ${r.name.padEnd(30)} ${String(r.score.total).padStart(3)}/${r.score.max} ${r.rating}${caps}`);
        }
        console.log('');
      }
      if (failUnder !== null) {
        const failing = batch.results.filter(r => r.score.total < failUnder);
        if (failing.length > 0) {
          console.error(`  ✖ FAIL: ${failing.length} skill(s) below threshold ${failUnder}`);
          process.exit(1);
        }
      }
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

main();
