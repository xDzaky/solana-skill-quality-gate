---
name: solana-skill-quality-gate
description: >
  Pre-submit quality gate for Solana AI Kit skill builders, and a review
  accelerator for maintainers. Audits skills for structure, progressive
  loading, semantic supply-chain risks, Solana ecosystem fit, install
  readiness, and documentation quality.
---

# Solana Skill Quality Gate

A builder-first pre-submit quality gate for Solana AI Kit skills.

## When to Use

- **Before submitting** — audit your own skill to catch blockers before opening a PR
- **Reviewing submissions** — batch-audit multiple skills for fast triage
- **CI/CD gates** — enforce quality thresholds with `--strict` and `--fail-under`
- **Learning** — understand what makes a good Solana AI Kit skill

## Use It Before You Submit

1. Build your skill following the [quality guidelines](./what-makes-a-good-solana-skill.md)
2. Run `node scripts/skillqa.mjs audit ./my-skill`
3. Fix blockers, then open your PR with confidence

## Trigger Phrases

- "review my skill"
- "check if my skill is ready"
- "audit this skill"
- "is my skill submission ready"
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
