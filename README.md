# solana-skill-quality-gate

[![Test](https://github.com/xDzaky/solana-skill-quality-gate/actions/workflows/test.yml/badge.svg)](https://github.com/xDzaky/solana-skill-quality-gate/actions/workflows/test.yml)

A quality, safety, and merge-readiness gate for [Solana AI Kit](https://github.com/solanabr/solana-ai-kit) skills.

**This is not another domain skill.** It is a maintainer-facing quality gate that helps Solana AI Kit safely accept better skills.

---

## Verify in 60 Seconds

```bash
git clone https://github.com/xDzaky/solana-skill-quality-gate
cd solana-skill-quality-gate
npm test                                                # 50 tests
npm run gate                                            # self-audit ≥ 90
node scripts/skillqa.mjs batch scripts/fixtures/benchmark-samples --json
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
| **Solana fit scoring** | Keyword density + evidence-based structural signals |
| **Policy caps** | Critical findings cap the total score (prompt injection → max 39, opaque exec → max 29) |
| **Batch review** | Score multiple skills in one command with sorted results |
| **SARIF output** | GitHub Code Scanning compatible SARIF 2.1.0 format |
| **Strict CI mode** | `--strict` exits non-zero on safety or structural failures |
| **Fail-under gate** | `--fail-under N` exits non-zero if score < threshold |
| **Report generation** | Markdown reports with raw/final scores, applied caps, PR checklist |
| **Self-audit** | Scanner passes its own audit at 100/100 |

---

## Usage

### Quick Audit

```bash
node scripts/skillqa.mjs audit <path>                   # Terminal output
node scripts/skillqa.mjs score <path> --json             # JSON score
node scripts/skillqa.mjs report <path> --out report.md   # Markdown report
```

### Batch Review

```bash
# Score all skills in a directory (each subdirectory = one skill)
node scripts/skillqa.mjs batch ./submissions --json --out batch.json
node scripts/skillqa.mjs batch ./submissions --markdown --out batch.md
node scripts/skillqa.mjs batch ./submissions --fail-under 80
```

Output includes: total skills, pass/fail count, average scores, policy-capped count, top risks, and sorted results (worst first).

### SARIF for GitHub Code Scanning

```bash
node scripts/skillqa.mjs report <path> --sarif --out skill.sarif
```

Upload to GitHub Code Scanning with:
```yaml
- uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: skill.sarif
```

### CI Gate

```bash
node scripts/skillqa.mjs score <path> --json --fail-under 85   # exit 1 if below
node scripts/skillqa.mjs audit <path> --strict                  # exit 2 on safety
```

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Pass |
| `1` | Score below `--fail-under` threshold |
| `2` | Critical safety failure (`--strict`) |
| `3` | Invalid structure / missing SKILL.md (`--strict`) |

---

## Scoring

### Categories (100 points total)

| Category | Max | What It Checks |
|----------|-----|----------------|
| Structure & Format | 20 | SKILL.md, frontmatter, name, description, LICENSE |
| Progressive Disclosure | 20 | File size, routing, inline blocks |
| Safety & Supply-Chain | 25 | Prompt injection, secrets, exfiltration, opaque exec |
| Solana Ecosystem Fit | 15 | Keyword depth + evidence-based signals |
| Install & Test Ready | 10 | install.sh, tests, CI workflow |
| Documentation | 10 | README, examples, content quality |

### Solana Fit Evidence

Beyond keyword counting, the scanner checks 5 structural evidence signals:

| Signal | What It Checks |
|--------|---------------|
| Workflow Evidence | SKILL.md has concrete "When to Use" / workflow sections |
| Focused Files Evidence | Non-SKILL.md files in skill/ contain Solana instructions |
| README Problem Evidence | README explains a real Solana builder problem |
| Examples Evidence | examples/ or commands/ contain Solana-specific content |
| Boundary Evidence | Skill defines scope boundaries ("does not", "out of scope") |

JSON output includes `solanaEvidence` object with each signal as boolean.

### Ratings

| Score | Rating |
|-------|--------|
| 80–100 | Excellent |
| 60–79 | Good |
| 40–59 | Fair |
| 20–39 | Poor |
| 0–19 | Failing |

### Policy Caps

Critical findings **automatically cap the total score**:

| Finding | Max Score |
|---------|-----------|
| Prompt injection detected | 39 |
| Secret collection detected | 39 |
| Opaque/suspicious execution | 29 |
| Priority manipulation | 49 |
| Suspicious install script | 39 |
| Missing SKILL.md | 49 |
| No Solana-specific content | 59 |

---

## Install

### Standard Install

```bash
git clone https://github.com/xDzaky/solana-skill-quality-gate
cd solana-skill-quality-gate
bash install.sh
```

### Custom Install

```bash
bash install-custom.sh --project       # Project-local
bash install-custom.sh --target ~/dir  # Custom path
bash install-custom.sh --dry-run       # Preview
bash install-custom.sh --user --yes    # Non-interactive
```

---

## What This Does NOT Do

- ❌ Does not execute any code from the audited skill
- ❌ Does not perform semantic/LLM-based analysis
- ❌ Does not replace human code review
- ❌ Does not verify runtime behavior
- ❌ Does not access the network or collect secrets

---

## Safety Model

- **Read-only** — never modifies the audited skill
- **No network calls** — works entirely offline
- **No secret collection** — never asks for private keys, seed phrases, or wallet secrets
- **No script execution** — does not run install.sh or any audited code
- **No opaque binaries** — zero npm dependencies, single readable .mjs file
- **Transparent** — all rules in `scripts/rules.json`

---

## Judge Checklist

- [ ] `npm test` passes (50 tests)
- [ ] `npm run gate` passes (self-audit ≥ 90)
- [ ] `node scripts/skillqa.mjs batch scripts/fixtures/benchmark-samples --json` shows 5 skills
- [ ] `node scripts/skillqa.mjs report scripts/fixtures/bad-skill --sarif --out bad.sarif` produces valid SARIF
- [ ] Bad fixture scores ≤ 39 (policy-capped)
- [ ] Good fixture scores ≥ 80
- [ ] Scanner has zero npm dependencies
- [ ] No network calls, no secrets, no script execution

See [SUBMISSION.md](./SUBMISSION.md) for the full bounty submission.

---

## Project Structure

```
solana-skill-quality-gate/
├── skill/                    # SKILL.md router + focused docs
├── commands/                 # Agent command definitions
├── agents/                   # Agent persona
├── scripts/
│   ├── skillqa.mjs          # CLI scanner (zero deps)
│   ├── rules.json           # Detection rules
│   ├── test.mjs             # Test runner (50 tests)
│   └── fixtures/            # Test fixtures
│       ├── good-skill/      # 95/100 Excellent
│       ├── bad-skill/       # 29/100 Poor (capped)
│       └── benchmark-samples/  # 5 benchmark fixtures
├── examples/                 # Generated reports, SARIF, batch reviews
├── install.sh               # Standard installer
├── install-custom.sh        # Custom installer
├── SUBMISSION.md            # Bounty submission document
├── .github/workflows/       # CI (Node 18/20/22)
├── LICENSE                  # MIT
└── README.md                # This file
```

---

## Links

- [Solana AI Kit](https://github.com/solanabr/solana-ai-kit)
- [Skill Bounty](https://github.com/solanabr/skill-bounty)
- [Real Submission Smoke Test](./examples/real-submission-smoke-test.md)
- [SUBMISSION.md](./SUBMISSION.md)

---

## License

MIT
