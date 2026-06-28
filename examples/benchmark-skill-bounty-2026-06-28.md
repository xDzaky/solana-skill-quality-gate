# Benchmark Report — Local Fixtures

**Date**: 2026-06-28
**Scanner**: solana-skill-quality-gate v2.0.0
**Samples**: 5 local benchmark fixtures (not real submissions)

> ⚠️ This is a **local sample benchmark** using synthetic fixtures. It demonstrates how the scanner evaluates different skill patterns, not a review of actual bounty submissions.

---

## Results

| Fixture | Raw Score | Final Score | Rating | Policy Caps |
|---------|-----------|-------------|--------|-------------|
| excellent | 91 | 91 | Excellent | None |
| missing-license | 87 | 87 | Excellent | None |
| giant-skill-md | 78 | 78 | Good | None |
| generic-keyword-stuffing | 62 | 59 | Fair | No Solana fit |
| dangerous-install | 62 | 29 | Poor | Secret collection, Opaque execution, Suspicious install |

**Average raw score**: 76.0
**Average final score**: 68.8
**Policy-capped**: 2 of 5 (40%)

---

## Common Findings

### Top 5 Most Common Risks
1. **Missing LICENSE file** — blocks open-source compliance
2. **No progressive routing** — monolithic SKILL.md without links to focused files
3. **No Solana-specific content** — generic skills that don't belong in the Solana AI Kit
4. **Suspicious install scripts** — curl piped to bash, eval, seed phrase collection
5. **Missing examples/** — no usage demos or sample outputs

### Top 5 Best-Shaped Skills
1. Well-structured SKILL.md with YAML frontmatter (name + description)
2. Progressive disclosure: short router → focused .md files
3. Clear safety section: "read-only", "no private keys required"
4. Transparent install.sh with no network calls
5. Examples directory with sample outputs

---

## Why Maintainers Can Use This in Batch Review

When reviewing 200+ skill submissions, maintainers can run:

```bash
# Quick pass/fail gate
node scripts/skillqa.mjs score <path> --json --fail-under 80

# Strict mode: reject on any safety finding
node scripts/skillqa.mjs audit <path> --strict

# Full report for detailed review
node scripts/skillqa.mjs report <path> --out review.md
```

This reduces manual review time by immediately identifying:
- Skills with critical safety issues (policy-capped, auto-rejected)
- Skills with structural problems (missing SKILL.md, no frontmatter)
- Skills that aren't genuinely Solana-specific (keyword stuffing, generic content)
- Skills that pass all gates and are ready for human review

---

## False Positive / False Negative Policy

- **False positives**: The scanner uses negation-aware matching (e.g., "No private keys required" is not flagged). Self-audit infrastructure files (rules, fixtures, docs) are excluded from safety scanning when auditing the scanner itself.
- **False negatives**: The scanner uses keyword matching, not semantic analysis. A truly malicious skill could evade detection by using encoded or obfuscated patterns. This is why the scanner is assistive, not a substitute for human review.
