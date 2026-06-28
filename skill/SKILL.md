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
- **Preparing your skill** — learn what makes a good Solana AI Kit skill

## Use It Before You Submit

1. Build your skill following the [quality guidelines](./what-makes-a-good-solana-skill.md)
2. Run `node scripts/skillqa.mjs audit ./my-skill` to check for issues
3. Fix blockers, then open your PR with confidence

## What It Checks

- **Structure** — SKILL.md, frontmatter, naming, LICENSE → [quality gates](./quality-gates.md)
- **Progressive disclosure** — router pattern, file limits → [deep audit](./deep-audit.md)
- **Safety** — prompt injection, secrets, exfiltration → [safety patterns](./safety-patterns.md)
- **Solana fit** — keyword depth + evidence signals → [ecosystem signals](./solana-ecosystem-signals.md)
- **Install & docs** — install.sh, README, examples

## Quick Audit

See [quick-audit.md](./quick-audit.md) for the 60-second workflow.

## Building a Good Skill

See [what-makes-a-good-solana-skill.md](./what-makes-a-good-solana-skill.md) for DO/DON'T patterns.

## Safety

- It does **not** ask for private keys, seed phrases, RPC keys, or wallet secrets
- It does **not** execute any code from audited skills
- It does **not** make network calls
- Read-only scanning only
