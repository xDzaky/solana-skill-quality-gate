# Adoption Guide

How to integrate `solana-skill-quality-gate` into your workflow.

> **Disclaimer**: This is an assistive quality gate. It speeds up human review — it does not replace it. The Solana AI Kit team has not officially adopted this tool. The workflows below are recommended patterns.

---

## For Builders: Pre-Submit Self-Check

Before opening a PR to the skill bounty, audit your own skill:

```bash
# Clone the scanner
git clone https://github.com/xDzaky/solana-skill-quality-gate
cd solana-skill-quality-gate

# Audit your skill
node scripts/skillqa.mjs audit /path/to/my-skill

# Get JSON score
node scripts/skillqa.mjs score /path/to/my-skill --json

# Generate a report to attach to your PR
node scripts/skillqa.mjs report /path/to/my-skill --out my-skill-report.md
```

**Rule of thumb**: Score ≥ 80 with zero policy caps → ready to submit.

---

## For Maintainers: PR Review Workflow

When reviewing incoming skill PRs, batch-scan all submissions:

```bash
# Clone all submission repos into a directory
mkdir submissions/
# ... clone each PR fork into submissions/

# Batch review — sorted by score (worst first)
node scripts/skillqa.mjs batch submissions/ --markdown --out triage-report.md

# Deep dive on flagged skills
node scripts/skillqa.mjs audit submissions/suspicious-skill --strict

# SARIF for GitHub Code Scanning
node scripts/skillqa.mjs report submissions/flagged-skill --sarif --out flagged.sarif
```

---

## GitHub Actions: Automated PR Check

Add this to your skill repo's CI to auto-check quality on every PR:

```yaml
name: Skill Quality Gate
on: [pull_request]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Clone scanner
        run: git clone https://github.com/xDzaky/solana-skill-quality-gate /tmp/sqg

      - name: Run quality gate
        run: node /tmp/sqg/scripts/skillqa.mjs score . --json --fail-under 80

      - name: Strict safety check
        run: node /tmp/sqg/scripts/skillqa.mjs audit . --strict

      - name: Generate report
        if: always()
        run: node /tmp/sqg/scripts/skillqa.mjs report . --out quality-report.md

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: quality-report
          path: quality-report.md
```

---

## Batch Review Example

Scenario: 12 skill submissions to review for a bounty round.

```bash
# Batch scan all 12
node scripts/skillqa.mjs batch ./bounty-submissions --json --out batch.json

# Quick terminal summary
node scripts/skillqa.mjs batch ./bounty-submissions

# Expected output:
#   Batch Review: 12 skills scanned
#   Avg raw: 71.3 | Avg final: 65.8 | Capped: 3
#
#   unsafe-skill                    29/100 Poor [opaque_execution]
#   generic-crypto-tool             59/100 Fair [no_solana_fit]
#   ...
#   excellent-defi-skill            91/100 Excellent
```

Time saved: ~2 hours of manual triage → ~5 seconds.
