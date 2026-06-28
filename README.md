# solana-skill-quality-gate

[![Test](https://github.com/xDzaky/solana-skill-quality-gate/actions/workflows/test.yml/badge.svg)](https://github.com/xDzaky/solana-skill-quality-gate/actions/workflows/test.yml)

A quality, safety, and merge-readiness gate for [Solana AI Kit](https://github.com/sendai-sf/solana-ai-kit) skills.

**This is not another domain skill.** It is a maintainer-facing quality gate that helps Solana AI Kit safely accept better skills.

---

## Verify in 60 Seconds

```bash
git clone https://github.com/xDzaky/solana-skill-quality-gate
cd solana-skill-quality-gate
npm test                                                # 35 tests
npm run audit:self                                      # self-audit
node scripts/skillqa.mjs score . --json --fail-under 90 # CI gate
```

---

## Why This Can Help Solana AI Kit Maintainers

The bounty has **247+ submissions** and **82+ open PRs**. Many skills look good in a README but are actually:

- **Unsafe** — contain prompt injection, secret collection, or opaque install scripts
- **Token-inefficient** — monolithic SKILL.md with 300+ lines loaded every time
- **Not Solana-specific** — generic crypto tools with keyword stuffing
- **Structurally invalid** — missing SKILL.md, no frontmatter, no progressive disclosure

Maintainers need a **repeatable, deterministic way** to quickly triage submissions. This scanner provides that.

---

## What It Does

| Feature | Description |
|---------|-------------|
| **SKILL.md validation** | Checks YAML frontmatter, name convention, description |
| **Progressive disclosure** | Verifies router pattern, line limits, focused file routing |
| **Safety scanning** | Negation-aware detection of prompt injection, secret collection, exfiltration, priority manipulation, opaque execution |
| **Solana fit scoring** | Keyword density, ecosystem depth, keyword-stuffing detection |
| **Policy caps** | Critical findings cap the total score (prompt injection → max 39, opaque exec → max 29) |
| **Strict CI mode** | `--strict` exits non-zero on safety or structural failures |
| **Fail-under gate** | `--fail-under N` exits non-zero if score < threshold |
| **Report generation** | Markdown reports with raw/final scores, applied caps, PR checklist |
| **Self-audit** | Scanner passes its own audit at 100/100 |

---

## Usage

### Quick Audit

```bash
# Terminal output with emoji status
node scripts/skillqa.mjs audit <path>

# JSON score for CI pipelines
node scripts/skillqa.mjs score <path> --json

# Full markdown report
node scripts/skillqa.mjs report <path> --out report.md
```

### CI Gate

```bash
# Pass/fail gate (exit 1 if below threshold)
node scripts/skillqa.mjs score <path> --json --fail-under 85

# Strict mode (exit 2 on safety, exit 3 on missing SKILL.md)
node scripts/skillqa.mjs audit <path> --strict
```

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Pass |
| `1` | Score below `--fail-under` threshold |
| `2` | Critical safety failure (`--strict`) |
| `3` | Invalid structure / missing SKILL.md (`--strict`) |

### Self-Audit

```bash
npm run audit:self    # Terminal audit of this repo
npm run score:self    # JSON score of this repo
npm run report:self   # Markdown report → examples/audit-report-self.md
```

---

## Install

### Standard Install (user-level)

```bash
git clone https://github.com/xDzaky/solana-skill-quality-gate
cd solana-skill-quality-gate
bash install.sh
```

### Custom Install

```bash
# Install to project-local directory
bash install-custom.sh --project

# Install to custom path
bash install-custom.sh --target ~/my-skills/quality-gate

# Preview what would be installed
bash install-custom.sh --dry-run

# Non-interactive
bash install-custom.sh --user --yes
```

---

## Scoring

### Categories (100 points total)

| Category | Max | What It Checks |
|----------|-----|----------------|
| Structure & Format | 20 | SKILL.md, frontmatter, name, description, LICENSE |
| Progressive Disclosure | 20 | File size, routing, inline blocks |
| Safety & Supply-Chain | 25 | Prompt injection, secrets, exfiltration, opaque exec |
| Solana Ecosystem Fit | 15 | Keyword depth, stuffing detection |
| Install & Test Ready | 10 | install.sh, tests, CI workflow |
| Documentation | 10 | README, examples, content quality |

### Ratings

| Score | Rating |
|-------|--------|
| 80–100 | Excellent |
| 60–79 | Good |
| 40–59 | Fair |
| 20–39 | Poor |
| 0–19 | Failing |

### Policy Caps

Critical findings **automatically cap the total score**, regardless of other categories:

| Finding | Max Score |
|---------|-----------|
| Prompt injection detected | 39 |
| Secret collection detected | 39 |
| Opaque/suspicious execution | 29 |
| Priority manipulation | 49 |
| Suspicious install script | 39 |
| Missing SKILL.md | 49 |
| No Solana-specific content | 59 |

Reports show both **raw score** and **policy-adjusted final score**.

---

## What This Does NOT Do

- ❌ Does not execute any code from the audited skill
- ❌ Does not perform semantic/LLM-based analysis
- ❌ Does not replace human code review
- ❌ Does not verify runtime behavior or functional correctness
- ❌ Does not access the network or collect secrets

---

## Limitations

- **Keyword-based detection**: Uses pattern matching, not semantic understanding. Obfuscated malicious content may evade detection.
- **No runtime analysis**: Cannot detect issues that only appear during execution.
- **English-focused**: Safety patterns are in English. Non-English prompt injection may not be detected.
- **Assistive tool**: Designed to speed up human review, not to replace it entirely.

---

## False Positive / False Negative Policy

- **Negation-aware**: Phrases like "No private keys required" or "does not ignore instructions" are recognized as safe and not flagged.
- **Self-audit safe**: Scanner infrastructure files (rules, fixtures, docs, examples) are excluded from safety scanning during self-audit to prevent false positives from rule definitions.
- **Conservative caps**: Policy caps err on the side of caution. A skill with any critical safety finding is capped below "Fair" to force manual review.

---

## Safety Model

- **Read-only** — never modifies the audited skill
- **No network calls** — works entirely offline
- **No secret collection** — never asks for private keys, seed phrases, RPC keys, or wallet secrets
- **No script execution** — does not run install.sh or any code from the audited skill
- **No opaque binaries** — zero npm dependencies, single readable .mjs file
- **Transparent** — all rules in `scripts/rules.json`, all logic in `scripts/skillqa.mjs`

---

## Judge Checklist

For judges evaluating this submission:

- [ ] `npm test` passes (35 tests)
- [ ] `npm run score:self` shows 100/100
- [ ] `node scripts/skillqa.mjs score . --json --fail-under 90` exits 0
- [ ] `node scripts/skillqa.mjs audit scripts/fixtures/bad-skill --strict` exits 2
- [ ] Bad fixture scores ≤ 39 (policy-capped)
- [ ] Good fixture scores ≥ 80
- [ ] Reports show raw score, final score, and applied caps
- [ ] Scanner has zero npm dependencies
- [ ] No network calls, no secrets, no script execution
- [ ] `install.sh` and `install-custom.sh` are transparent and safe

---

## Project Structure

```
solana-skill-quality-gate/
├── skill/                    # SKILL.md router + focused docs
│   ├── SKILL.md             # Progressive disclosure entry point
│   ├── quick-audit.md       # Quick audit workflow
│   ├── deep-audit.md        # Deep audit details
│   ├── semantic-supply-chain-review.md
│   ├── quality-gates.md     # Scoring rubric
│   └── report-template.md   # Report format
├── commands/                 # Agent command definitions
├── agents/                   # Agent persona
├── scripts/
│   ├── skillqa.mjs          # CLI scanner (zero deps)
│   ├── rules.json           # Detection rules
│   ├── test.mjs             # Test runner (35 tests)
│   └── fixtures/            # Test fixtures
│       ├── good-skill/      # 95/100 Excellent
│       ├── bad-skill/       # 29/100 Poor (capped)
│       └── benchmark-samples/  # 5 benchmark fixtures
├── examples/                 # Generated reports
├── install.sh               # Standard installer
├── install-custom.sh        # Custom installer (--target, --project, --dry-run)
├── .github/workflows/       # CI (Node 18/20/22)
├── LICENSE                  # MIT
└── README.md                # This file
```

---

## License

MIT
