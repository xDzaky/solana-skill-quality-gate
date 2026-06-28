# SUBMISSION.md — Bounty Submission

## One-Paragraph Pitch

**solana-skill-quality-gate** is a zero-dependency, read-only CLI scanner that helps Solana AI Kit maintainers triage 247+ skill submissions in minutes instead of hours. It scores skills across 6 categories (structure, progressive disclosure, safety, Solana fit, install readiness, documentation), applies policy caps for critical findings (prompt injection, secret collection, opaque execution), and outputs machine-readable JSON, Markdown reports, SARIF for GitHub Code Scanning, and batch review summaries. It passes its own audit at 100/100.

---

## Why This Is Novel

Most bounty submissions are **domain skills** (NFT minting, DeFi swaps, staking tools). This is a **meta-skill**: it evaluates the quality, safety, and merge-readiness of other skills.

No other submission in the bounty addresses the maintainer's bottleneck: **how to safely review 247+ submissions and 82+ open PRs without missing prompt injection, secret exfiltration, or quality issues.**

---

## Why This Helps Solana AI Kit Maintainers

| Problem | How This Solves It |
|---------|-------------------|
| 247 submissions, manual review is slow | `batch` command scores all submissions in seconds |
| Unsafe skills slip through | Safety scanner detects prompt injection, secret collection, opaque execution |
| Generic skills waste tokens | Solana fit scoring + evidence-based checks filter non-Solana content |
| Inconsistent review standards | Deterministic scoring rubric (100-point scale) with policy caps |
| CI/CD integration needed | `--strict`, `--fail-under`, SARIF output, exit codes |

---

## Verification Commands

```bash
git clone https://github.com/xDzaky/solana-skill-quality-gate
cd solana-skill-quality-gate

# Run test suite (51 tests)
npm test

# Self-audit gate (must pass ≥ 90)
npm run gate

# Batch review benchmark fixtures
node scripts/skillqa.mjs batch scripts/fixtures/benchmark-samples --json

# SARIF output for GitHub Code Scanning
node scripts/skillqa.mjs report scripts/fixtures/bad-skill --sarif --out bad.sarif

# Strict mode rejects unsafe skills
node scripts/skillqa.mjs audit scripts/fixtures/bad-skill --strict
# Expected: exit 2 (critical safety failure)
```

---

## Key Proof Points

- **51 tests** covering self-audit, policy caps, strict mode, fail-under, batch, SARIF, evidence-based fit, hardened self-audit
- **Self-audit: 100/100** — scanner passes its own quality gate
- **5 benchmark fixtures** with known expected scores (from Excellent to Poor)
- **Policy caps** prevent unsafe skills from scoring above "Fair"
- **Batch review** scans multiple skills in one command
- **SARIF 2.1.0** output for GitHub Code Scanning integration
- **Evidence-based Solana fit** (5 signals beyond keyword counting)
- **Hardened self-audit** — strict path identity check prevents bypass
- **Zero npm dependencies** — single readable .mjs file
- **CI/CD** with Node 18/20/22 matrix

---

## Safety Model

- Read-only — never modifies audited skills
- No network calls — works entirely offline
- No secret collection — never asks for private keys or seed phrases
- No script execution — does not run install.sh or any audited code
- No opaque binaries — zero npm dependencies
- Transparent — all rules in `scripts/rules.json`

---

## Limitations

- Keyword-based detection, not semantic analysis
- No runtime analysis — cannot detect issues during execution
- English-focused safety patterns
- Assistive tool — designed to speed up human review, not replace it

---

## Bounty Form Answers

**Skill name**: solana-skill-quality-gate

**What does your skill do?**
Quality, safety, and merge-readiness gate for Solana AI Kit skills. Scores skills across 6 categories (structure, progressive disclosure, safety, Solana fit, install readiness, docs). Detects prompt injection, secret collection, and opaque execution. Outputs JSON, Markdown, SARIF, and batch review summaries for maintainer triage.

**Why is it useful for Solana builders?**
Solana AI Kit has 247+ skill submissions and 82+ open PRs. Maintainers need a fast, deterministic way to triage them. This scanner provides automated quality/safety assessment so maintainers can focus human review on skills that pass the gate.

**How do you install and use it?**
```bash
git clone https://github.com/xDzaky/solana-skill-quality-gate
cd solana-skill-quality-gate
node scripts/skillqa.mjs audit <path-to-skill>
node scripts/skillqa.mjs batch <submissions-dir> --json
```

**Does it have any dependencies?**
Zero npm dependencies. Single Node.js file (scripts/skillqa.mjs). Requires Node.js 18+.

---

## PR Body for solanabr/skill-bounty

```markdown
## solana-skill-quality-gate

Quality, safety, and merge-readiness gate for Solana AI Kit skills.

### What it does
- Scores skills across 6 categories (100-point scale)
- Detects prompt injection, secret collection, opaque execution
- Policy caps prevent unsafe skills from scoring above "Fair"
- Batch review for triaging 247+ submissions
- SARIF output for GitHub Code Scanning
- Evidence-based Solana fit (5 structural signals)

### Verification
```bash
npm test           # 51 tests
npm run gate       # self-audit ≥ 90
```

### Key facts
- Zero npm dependencies
- Read-only, no network calls, no script execution
- Self-audit: 100/100
- Node 18/20/22 CI matrix

### Links
- Repo: https://github.com/xDzaky/solana-skill-quality-gate
- Solana AI Kit: https://github.com/solanabr/solana-ai-kit
```
