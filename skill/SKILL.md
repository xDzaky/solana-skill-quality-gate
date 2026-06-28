---
name: solana-skill-quality-gate
description: >
  Quality and trust gate for Solana AI Kit skills. Builders use it to
  audit skills before installing or submitting them. Checks structure,
  safety, Solana fit, progressive loading, and supply-chain risks —
  so you only trust skills that pass the gate.
---

# Solana Skill Quality Gate

A trust gate for Solana AI Kit skills — audit before you install, audit before you submit.

## When to Use

- **Before installing a community skill** — check if it's safe, well-structured, and genuinely Solana-specific before trusting it with your agent's context
- **Before submitting your own skill** — catch blockers before opening a PR
- **Reviewing submissions** — batch-audit multiple skills for fast triage
- **CI/CD gates** — enforce quality thresholds with `--strict` and `--fail-under`

## Use It Before You Submit

1. Build your skill following the [quality guidelines](./what-makes-a-good-solana-skill.md)
2. Run `node scripts/skillqa.mjs audit ./my-skill`
3. Fix blockers, then open your PR with confidence

## Use It Before You Install

Before trusting a community skill with your agent's context window:

1. Clone the skill repo
2. Run `node scripts/skillqa.mjs audit ./that-skill`
3. Score ≥ 80 and no policy caps → safe to install. Otherwise → inspect manually.

## Trigger Phrases

- "review my skill"
- "check if my skill is ready"
- "audit this skill"
- "is this skill safe to install"
- "scan skill for issues"

## Routes

| Topic | File |
|-------|------|
| Quickstart | [quickstart.md](./quickstart.md) |
| Quality guide | [what-makes-a-good-solana-skill.md](./what-makes-a-good-solana-skill.md) |
| Safety patterns | [safety-patterns.md](./safety-patterns.md) |
| Solana ecosystem fit | [solana-ecosystem-signals.md](./solana-ecosystem-signals.md) |
| Scoring rubric | [quality-gates.md](./quality-gates.md) |

## Quick Command Reference

```bash
node scripts/skillqa.mjs audit <path>           # Full audit
node scripts/skillqa.mjs score <path> --json     # JSON score
node scripts/skillqa.mjs batch <dir> --markdown  # Batch review
node scripts/skillqa.mjs report <path> --out f   # Markdown report
node scripts/skillqa.mjs report <path> --sarif --out f  # SARIF
```

## Safety

- Does **not** execute any code from audited skills
- Does **not** make network calls
- Does **not** collect secrets or private keys
- Read-only scanning only
