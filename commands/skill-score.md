---
name: skill-score
description: >
  Quick-score one or more Solana skills for batch review. Produces a compact JSON
  score summary per skill, enabling fast triage across large skill directories.
  Use this for initial screening before running a full skill-audit on flagged items.
---

# Skill Score — Quick Scoring Command

> **Scope**: one or more skill directories
> **Mode**: read-only, fast analysis
> **Output**: JSON score objects, optional comparison table

---

## Purpose

When reviewing many skills (e.g., a batch PR or a skills registry), a full audit
on each is impractical. `skill-score` provides a rapid, consistent scoring pass
that surfaces which skills need closer attention.

---

## Workflow

### Step 1 — Run the Scorer

For each skill directory provided, perform a rapid assessment across five dimensions.
Use the `--json` output format for machine-readable results.

**Input:** one or more skill directory paths.

```
Usage: /skill-score <path> [<path2> <path3> ...]

Examples:
  /skill-score ./skills/solana-token-deploy
  /skill-score ./skills/*
  /skill-score ./skills/anchor-setup ./skills/spl-token-ops ./skills/validator-monitor
```

**For each skill, evaluate:**

| Dimension            | Quick Check                                                    | Max Score |
|---------------------|----------------------------------------------------------------|-----------|
| Structure           | SKILL.md exists, frontmatter valid, standard dirs used         | 10        |
| Content Quality     | Line count, placeholder scan, markdown lint, code blocks valid | 10        |
| Progressive Loading | Separation of concerns, references used, not monolithic        | 10        |
| Safety              | No secrets, no opaque binaries, scripts benign or absent       | 10        |
| Solana Fit          | Relevant to Solana, accurate terminology, fills a gap          | 10        |

**Speed Target:** each skill should be scored in under 30 seconds of analysis time.

---

### Step 2 — Review JSON Output

Each skill produces a JSON score object with the following schema:

```json
{
  "skill_name": "solana-token-deploy",
  "skill_path": "./skills/solana-token-deploy",
  "timestamp": "2025-01-15T10:30:00Z",
  "scores": {
    "structure": {
      "score": 8,
      "max": 10,
      "flags": []
    },
    "content_quality": {
      "score": 7,
      "max": 10,
      "flags": ["SKILL.md exceeds 500 lines"]
    },
    "progressive_loading": {
      "score": 6,
      "max": 10,
      "flags": ["large code blocks inline in SKILL.md"]
    },
    "safety": {
      "score": 9,
      "max": 10,
      "flags": ["scripts/ directory present — manual review recommended"]
    },
    "solana_fit": {
      "score": 8,
      "max": 10,
      "flags": []
    }
  },
  "overall": {
    "score": 7.6,
    "max": 10,
    "weighted": true,
    "verdict": "PASS"
  },
  "flag_count": 2,
  "critical_flags": [],
  "needs_full_audit": false
}
```

**Field Reference:**

| Field              | Type     | Description                                               |
|-------------------|----------|-----------------------------------------------------------|
| `skill_name`      | string   | Name from SKILL.md frontmatter (or directory basename)    |
| `skill_path`      | string   | Path to the skill directory                               |
| `timestamp`       | string   | ISO 8601 timestamp of when the score was generated        |
| `scores`          | object   | Per-dimension scores with flags                           |
| `scores.*.score`  | number   | Score for this dimension (0–10)                           |
| `scores.*.flags`  | string[] | Brief notes explaining deductions                        |
| `overall.score`   | number   | Weighted average across all dimensions                    |
| `overall.verdict` | string   | `PASS`, `CONDITIONAL_PASS`, or `FAIL`                    |
| `flag_count`      | number   | Total number of non-critical flags                       |
| `critical_flags`  | string[] | Flags that automatically trigger `FAIL` or full audit    |
| `needs_full_audit`| boolean  | `true` if the score suggests a deeper review is needed   |

---

### Step 3 — Compare Scores for Batch Review

When multiple skills are scored, generate a comparison table for quick triage:

```markdown
## Batch Score Summary

| #  | Skill                  | Structure | Content | Loading | Safety | Solana | Overall | Verdict          |
|----|------------------------|-----------|---------|---------|--------|--------|---------|------------------|
| 1  | anchor-setup           | 9         | 8       | 8       | 10     | 9      | 8.8     | ✅ PASS          |
| 2  | spl-token-ops          | 7         | 7       | 6       | 9      | 8      | 7.4     | ✅ PASS          |
| 3  | validator-monitor      | 6         | 5       | 4       | 8      | 7      | 6.0     | ⚠️ CONDITIONAL   |
| 4  | sketchy-helper         | 3         | 4       | 2       | 3      | 5      | 3.4     | ❌ FAIL          |

**Batch Statistics:**
- Total skills scored: 4
- Passing: 2 (50%)
- Conditional: 1 (25%)
- Failing: 1 (25%)
- Average score: 6.4/10
```

Sort the table by overall score (descending) to surface the best and worst quickly.

---

### Step 4 — Triage by Score Ranges

Use these score ranges to determine next actions:

#### 🟢 PASS — Score ≥ 7.0, no critical flags

**Action:** Skill is ready for merge or final review.
- No full audit required unless the reviewer wants extra confidence.
- Address any non-critical flags as optional improvements.
- Proceed to PR approval workflow.

#### 🟡 CONDITIONAL PASS — Score 5.0–6.9, no critical flags

**Action:** Skill needs targeted improvements before merge.
- Run `/skill-audit` on this skill for detailed findings.
- Author must address all flags before re-scoring.
- Re-score after fixes to confirm improvement.
- Common issues at this level:
  - SKILL.md too long or poorly organized
  - Missing progressive loading (everything inline)
  - Incomplete Solana-specific guidance
  - Minor structural issues

#### 🔴 FAIL — Score < 5.0, or any critical flags

**Action:** Skill requires significant rework.
- Run `/skill-audit` for comprehensive findings and guidance.
- Author should review the audit report and address all must-fix issues.
- Re-submit for fresh scoring after rework.
- Common issues at this level:
  - Missing or malformed SKILL.md
  - Security concerns (secrets, opaque binaries, suspicious scripts)
  - Factually incorrect Solana content
  - Fundamental structural problems

#### 🚫 CRITICAL — Any critical flag present

**Action:** Immediate attention required regardless of score.
- Critical flags include:
  - Embedded secrets or private keys
  - Obfuscated or malicious code patterns
  - Compiled binaries without source
  - Known malicious dependencies
- Do **not** merge under any circumstances until resolved.
- Escalate to project maintainers if intentional malice is suspected.

---

## Weighting Formula

The overall score uses weighted averaging:

```
overall = (structure × 0.15) +
          (content_quality × 0.25) +
          (progressive_loading × 0.15) +
          (safety × 0.25) +
          (solana_fit × 0.20)
```

**Rationale:**
- **Safety** and **Content Quality** are weighted highest (25% each) because
  a skill that is unsafe or poorly written provides negative value.
- **Solana Fit** is weighted at 20% because ecosystem relevance is the skill's
  reason for existing.
- **Structure** and **Progressive Loading** are weighted at 15% each because
  they affect usability but are easier to fix than content or safety issues.

---

## Tips for Batch Scoring

1. **Start broad, then narrow.** Score all skills first, then audit only the
   flagged ones.
2. **Sort by safety first.** A skill with a low safety score is more urgent
   than one with a low content score.
3. **Track trends.** If many skills fail on the same dimension, it may indicate
   a gap in contributor documentation.
4. **Re-score after fixes.** Always re-run the scorer to verify improvements.
5. **Use consistent baselines.** Score all skills in a batch during the same
   session to ensure consistent judgment.
