# Real Submission Smoke Test

## Purpose

This document explains how maintainers can use `solana-skill-quality-gate` to batch-audit real bounty submissions from [solanabr/skill-bounty](https://github.com/solanabr/skill-bounty).

> ⚠️ This is a **template workflow**, not a pre-computed audit of specific submissions. We do not name or evaluate individual competitors.

---

## How to Run

### Step 1: Clone submission repos

```bash
mkdir submissions
cd submissions

# Clone PR repos — replace with actual PR fork URLs
git clone https://github.com/<user1>/<skill-repo>.git skill-1
git clone https://github.com/<user2>/<skill-repo>.git skill-2
git clone https://github.com/<user3>/<skill-repo>.git skill-3
# ... repeat for 8–12 submissions
```

### Step 2: Batch audit

```bash
cd ..  # back to solana-skill-quality-gate root

# JSON summary
node scripts/skillqa.mjs batch submissions --json --out examples/real-submission-smoke-test.json

# Markdown report
node scripts/skillqa.mjs batch submissions --markdown --out examples/real-submission-smoke-test-report.md

# Fail-under gate (reject < 80)
node scripts/skillqa.mjs batch submissions --json --fail-under 80
```

### Step 3: Review results

The batch output includes:
- **Total skills scanned**
- **Average raw and final scores**
- **Policy-capped count** (how many have critical safety findings)
- **Top risks** across all submissions
- **Sorted results** (worst first for fast triage)

### Step 4: Deep dive on flagged skills

```bash
# Full audit of a specific flagged skill
node scripts/skillqa.mjs audit submissions/skill-3

# SARIF output for GitHub Code Scanning
node scripts/skillqa.mjs report submissions/skill-3 --sarif --out review.sarif

# Markdown report for sharing with team
node scripts/skillqa.mjs report submissions/skill-3 --out review.md
```

---

## What This Demonstrates

| Workflow Step | Time (manual) | Time (scanner) |
|---------------|---------------|----------------|
| Initial triage of 12 skills | ~2 hours | ~5 seconds |
| Identify safety risks | ~30 min each | Instant (policy caps) |
| Generate review reports | ~20 min each | ~1 second each |
| CI gate enforcement | N/A | `--fail-under` + `--strict` |

---

## Expected Output Categories

When auditing real submissions, you'll typically see:

| Category | Description | Frequency |
|----------|-------------|-----------|
| **Strong progressive disclosure** | SKILL.md routes to focused files | ~30% of good skills |
| **Missing install proof** | No install.sh or install docs | ~50% of submissions |
| **Safety clean** | No prompt injection, secrets, or opaque exec | ~70% of submissions |
| **Docs weak** | Short README, no examples | ~40% of submissions |
| **Not Solana-specific** | Generic crypto tool with keyword stuffing | ~15% of submissions |
| **Policy-capped** | Critical safety finding limits score | ~10% of submissions |

---

## Disclosure

- **Sample size**: This is a template. Actual results depend on which submissions you audit.
- **Automated assessment**: The scanner uses pattern matching, not semantic analysis.
- **Assistive tool**: Designed to speed up human review, not replace it.
- **No naming/shaming**: We do not publish scores of individual competitors.
- **Read-only**: The scanner never modifies, executes, or exfiltrates audited code.
