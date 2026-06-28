# Quality Gates — Full Checklist

This document defines the **six quality gates** that every Solana AI Kit skill must pass before it is considered merge-ready. Each gate has a maximum point value, individual check items, and a rubric for scoring.

**Total possible score: 100 points.**

---

## Score Interpretation

| Band       | Score   | Meaning                                                                 |
|------------|---------|-------------------------------------------------------------------------|
| Excellent  | 80–100  | Merge-ready. Meets all critical requirements; minor polish only.        |
| Good       | 60–79   | Likely mergeable with minor fixes. No critical blockers.                |
| Fair       | 40–59   | Needs work. Several gates partially passed; no safety failures.         |
| Poor       | 20–39   | Significant issues. Multiple gate failures; may have safety concerns.   |
| Failing    | 0–19    | Not viable in current form. Fundamental structural or safety failures.  |

> **Critical failure override**: If Gate 3 (Safety & Supply-Chain) scores **0**, the overall score is capped at **19** regardless of other gate scores.

---

## Gate 1 — Structure & Format (20 pts)

Verifies that the skill directory follows the expected layout and that `SKILL.md` has correct YAML frontmatter and markdown structure.

| #   | Check                                           | Pass | Partial | Fail | Weight |
|-----|--------------------------------------------------|------|---------|------|--------|
| 1.1 | `SKILL.md` exists at skill root                 | 4    | 0       | 0    | 4      |
| 1.2 | Valid YAML frontmatter with `name` field         | 3    | 1       | 0    | 3      |
| 1.3 | Valid YAML frontmatter with `description` field  | 3    | 1       | 0    | 3      |
| 1.4 | `description` is between 20–300 characters       | 2    | 1       | 0    | 2      |
| 1.5 | Markdown renders without errors                  | 2    | 1       | 0    | 2      |
| 1.6 | Contains at least one `## ` section heading      | 2    | 0       | 0    | 2      |
| 1.7 | No broken internal links (relative references)   | 2    | 1       | 0    | 2      |
| 1.8 | Directory contains no unexpected binary files     | 2    | 1       | 0    | 2      |

### Rubric

- **Pass**: Check fully satisfied.
- **Partial**: Check is _close_ but has minor deviation (e.g., description is 15 chars).
- **Fail**: Check is missing or fundamentally broken.

### Common Failures

- Missing `name` or `description` in frontmatter.
- `SKILL.md` placed in a subdirectory instead of skill root.
- Broken relative links to `references/` files.
- Binary blobs (`.exe`, `.dll`, `.so`) committed to the skill directory.

---

## Gate 2 — Progressive Disclosure (20 pts)

Evaluates whether the skill follows token-efficient progressive loading patterns. See [progressive-loading.md](./progressive-loading.md) for the full guide.

| #   | Check                                              | Pass | Partial | Fail | Weight |
|-----|----------------------------------------------------|------|---------|------|--------|
| 2.1 | `SKILL.md` line count ≤ 200                        | 5    | 2       | 0    | 5      |
| 2.2 | `SKILL.md` file size ≤ 8 KB                        | 3    | 1       | 0    | 3      |
| 2.3 | Router pattern used (links to deeper files)         | 4    | 2       | 0    | 4      |
| 2.4 | No monolith anti-pattern                            | 3    | 0       | 0    | 3      |
| 2.5 | Focused files are self-contained                    | 3    | 1       | 0    | 3      |
| 2.6 | No phantom references (links to nonexistent files)  | 2    | 0       | 0    | 2      |

### Rubric

- **2.1**: ≤200 lines = Pass; 201–400 = Partial; >400 = Fail.
- **2.2**: ≤8 KB = Pass; 8–16 KB = Partial; >16 KB = Fail.
- **2.3**: Pass if `SKILL.md` links to ≥2 deeper reference files.
- **2.4**: Fail if >80% of total skill content is in `SKILL.md` alone.
- **2.5**: Pass if each linked file can be understood without reading others first.
- **2.6**: Fail if any internal link points to a file that does not exist.

### Common Failures

- Single monolithic `SKILL.md` with 1000+ lines.
- Facade pattern: tiny `SKILL.md` that links to a single massive file.
- Duplicated content across `SKILL.md` and reference files.

---

## Gate 3 — Safety & Supply-Chain (25 pts)

The highest-weighted gate. Scans for semantic supply-chain risks, prompt injection vectors, and data exfiltration patterns. See [semantic-supply-chain-review.md](./semantic-supply-chain-review.md) for the full detection framework.

| #   | Check                                              | Pass | Partial | Fail | Weight |
|-----|----------------------------------------------------|------|---------|------|--------|
| 3.1 | No priority manipulation patterns                   | 5    | 2       | 0    | 5      |
| 3.2 | No prompt injection vectors                         | 5    | 2       | 0    | 5      |
| 3.3 | No data exfiltration patterns                       | 5    | 0       | 0    | 5      |
| 3.4 | No secret collection attempts                       | 4    | 0       | 0    | 4      |
| 3.5 | No opaque execution (obfuscated code)               | 3    | 1       | 0    | 3      |
| 3.6 | No unauthorized network calls                       | 3    | 1       | 0    | 3      |

### Rubric

- **3.1**: Fail if instructions attempt to override system prompts or claim elevated authority.
- **3.2**: Fail if embedded strings could alter agent behavior when loaded as context.
- **3.3**: Fail if any pattern encodes, collects, or transmits user/project data externally.
- **3.4**: Fail if instructions request private keys, seed phrases, RPC secrets, or wallet mnemonics.
- **3.5**: Partial if code is minified without source; Fail if deliberately obfuscated.
- **3.6**: Partial if network calls are documented and justified; Fail if undocumented.

### Critical Override

> If Gate 3 total is **0 points**, the entire audit score is capped at **19 (Failing)**.
> Any single check scoring 0 in Gate 3 should be flagged as a **critical finding**.

### Common Failures

- Hidden `<!-- ignore previous instructions -->` comments.
- Base64-encoded payloads in script files.
- Instructions that request wallet private keys for "testing."
- Undocumented `fetch()` or `curl` calls in helper scripts.

---

## Gate 4 — Solana Ecosystem Fit (15 pts)

Evaluates whether the skill is genuinely relevant to the Solana ecosystem. See [solana-fit-score.md](./solana-fit-score.md) for the keyword taxonomy and scoring framework.

| #   | Check                                              | Pass | Partial | Fail | Weight |
|-----|----------------------------------------------------|------|---------|------|--------|
| 4.1 | Core Solana keyword presence                       | 5    | 2       | 0    | 5      |
| 4.2 | Functional Solana integration (not just keywords)   | 4    | 2       | 0    | 4      |
| 4.3 | No keyword stuffing detected                       | 3    | 1       | 0    | 3      |
| 4.4 | Skill targets a valid Solana use case               | 3    | 1       | 0    | 3      |

### Rubric

- **4.1**: Pass if skill references ≥3 core Solana concepts (SPL, Anchor, Program, etc.).
- **4.2**: Pass if the skill actually _does_ something Solana-specific, not just mentions it.
- **4.3**: Partial if keyword density is suspiciously high (>5% of total words); Fail if >10%.
- **4.4**: Pass if the skill maps to a recognized Solana use case (DeFi, NFTs, DAOs, payments, etc.).

### Common Failures

- Generic skill (e.g., "JSON formatter") with "Solana" mentioned once.
- Ethereum-centric skill with Solana keywords pasted in.
- Keyword stuffing: repeating "Solana" dozens of times without substance.

---

## Gate 5 — Install & Test Readiness (10 pts)

Checks whether the skill can be installed and tested without undocumented prerequisites.

| #   | Check                                              | Pass | Partial | Fail | Weight |
|-----|----------------------------------------------------|------|---------|------|--------|
| 5.1 | Install steps documented (if dependencies exist)    | 3    | 1       | 0    | 3      |
| 5.2 | No undeclared dependencies                          | 3    | 1       | 0    | 3      |
| 5.3 | Test or validation instructions provided            | 2    | 1       | 0    | 2      |
| 5.4 | Works on stated minimum Node/runtime version        | 2    | 1       | 0    | 2      |

### Rubric

- **5.1**: Pass if README or SKILL.md documents all install steps; Partial if some steps are implied.
- **5.2**: Pass if all imports/requires resolve; Partial if optional deps are missing docs.
- **5.3**: Pass if a test command, example invocation, or validation checklist exists.
- **5.4**: Pass if tested on the declared runtime; Partial if version not specified but likely works.

### Common Failures

- `npm install` fails due to missing `package.json`.
- Skill requires a specific Solana CLI version but doesn't document it.
- No way to verify the skill works without deploying to mainnet.

---

## Gate 6 — Documentation & Examples (10 pts)

Evaluates the quality of user-facing documentation and example content.

| #   | Check                                              | Pass | Partial | Fail | Weight |
|-----|----------------------------------------------------|------|---------|------|--------|
| 6.1 | Clear "When to Use" section                        | 2    | 1       | 0    | 2      |
| 6.2 | At least one usage example                         | 3    | 1       | 0    | 3      |
| 6.3 | Examples are runnable or clearly illustrative       | 2    | 1       | 0    | 2      |
| 6.4 | No placeholder or TODO content in published docs    | 1    | 0       | 0    | 1      |
| 6.5 | API or command reference (if applicable)            | 2    | 1       | 0    | 2      |

### Rubric

- **6.1**: Pass if the skill describes its purpose and when it should be triggered.
- **6.2**: Pass if at least one concrete example is provided (code, command, or workflow).
- **6.3**: Pass if examples can be copy-pasted and run; Partial if they are pseudocode.
- **6.4**: Fail if published documentation contains `TODO`, `FIXME`, or `[placeholder]`.
- **6.5**: Pass if all commands/functions are documented; Partial if some are missing.

### Common Failures

- `SKILL.md` says "see examples" but no examples directory exists.
- Examples reference devnet addresses that are no longer funded.
- Documentation is a copy-paste from another skill with names not updated.

---

## Scoring Procedure

1. Evaluate each check within each gate.
2. Sum the points per gate (cannot exceed the gate maximum).
3. Sum all gate scores for the total (0–100).
4. Apply the Gate 3 critical override if applicable.
5. Map the total to the score interpretation band.

```
Total Score = Gate1 + Gate2 + Gate3 + Gate4 + Gate5 + Gate6
            = (max 20) + (max 20) + (max 25) + (max 15) + (max 10) + (max 10)
            = max 100
```

---

## Quick Reference

| Gate | Name                    | Max Points | Critical? |
|------|-------------------------|------------|-----------|
| 1    | Structure & Format      | 20         | No        |
| 2    | Progressive Disclosure  | 20         | No        |
| 3    | Safety & Supply-Chain   | 25         | **Yes**   |
| 4    | Solana Ecosystem Fit    | 15         | No        |
| 5    | Install & Test Ready    | 10         | No        |
| 6    | Documentation & Examples| 10         | No        |
|      | **Total**               | **100**    |           |
