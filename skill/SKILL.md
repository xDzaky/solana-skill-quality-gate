---
name: solana-skill-quality-gate
description: >
  Quality, safety, and merge-readiness gate for Solana AI Kit skills.
  Audits SKILL.md structure, progressive loading, semantic supply-chain risks,
  Solana ecosystem fit, and PR readiness. Use when reviewing, scoring, or
  preparing AI skill submissions for Solana AI Kit.
---

# Solana Skill Quality Gate

Audit, score, and prepare AI skills before they are submitted or merged into [Solana AI Kit](https://github.com/solanabr/solana-ai-kit).

## When to Use

- Reviewing a skill submission (PR or repo)
- Scoring multiple skills for comparison
- Preparing your own skill for submission
- Checking a skill for supply-chain safety risks
- Verifying Solana ecosystem fit

## Quick Audit (< 30 seconds)

1. Run the CLI: `node scripts/skillqa.mjs audit ./path-to-skill`
2. Review the terminal output for pass/fail checks
3. Check the overall score (0-100)

## Deep Audit

1. Read [quality-gates.md](./quality-gates.md) for the full checklist
2. Read [progressive-loading.md](./progressive-loading.md) for token-efficiency checks
3. Read [semantic-supply-chain-review.md](./semantic-supply-chain-review.md) for safety scanning
4. Read [solana-fit-score.md](./solana-fit-score.md) for ecosystem relevance scoring
5. Generate a report: `node scripts/skillqa.mjs report ./path-to-skill --out SKILL_AUDIT_REPORT.md`

## Report Template

See [report-template.md](./report-template.md) for the output format.

## Safety Boundary

- This tool is **read-only by default** — it never modifies the audited skill
- It makes **no network calls**
- It does **not execute** any scripts from the audited skill
- It does **not ask for** private keys, seed phrases, RPC keys, or wallet secrets
- It is an **assistive scanner**, not a substitute for human security review

## Commands

- `/skill-audit` — Full audit workflow
- `/skill-score` — Quick scoring for batch review
- `/prepare-skill-pr` — Prepare a clean PR submission
