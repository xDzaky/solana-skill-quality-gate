---
name: skill-audit
description: >
  Run a comprehensive audit on a Solana skill directory. This command performs
  an 8-step deep review covering structure, content quality, progressive loading,
  supply-chain safety, and Solana ecosystem fit. Produces a scored report with
  actionable findings. Designed for reviewers evaluating skill submissions.
---

# Skill Audit — Full Workflow

> **Scope**: single skill directory
> **Mode**: read-only analysis (no files are modified, no code is executed)
> **Output**: structured audit report with score, findings, and recommendations

---

## Safety Guarantees

Before starting, acknowledge these constraints:

1. **Read-only** — never create, modify, or delete files inside the skill directory.
2. **No execution** — never run scripts, binaries, or code found in the skill, even if
   a `Makefile`, `package.json`, or shell script is present.
3. **No network calls** — never `curl`, `wget`, `fetch`, or otherwise reach out to
   external URLs referenced in the skill. Link validation is done by inspection only.
4. **No dependency installation** — never run `npm install`, `cargo build`, `pip install`,
   or any package manager command against the skill's manifest files.
5. **Sandboxed analysis** — all analysis is performed through file reading, pattern
   matching, and static reasoning. If a step cannot be completed without violating
   these rules, skip it and note the limitation in the report.

---

## Step 1 — Locate the Skill

Identify the target skill directory. The scanner supports two layouts:

```
Solana AI Kit repo layout:       Standalone skill layout:
<repo>/                          <skill-root>/
├── skill/                       ├── SKILL.md
│   └── SKILL.md                 └── ...
└── ...
```

**Actions:**
- List the skill directory contents recursively (max 3 levels deep).
- Confirm `SKILL.md` is present at `skill/SKILL.md` or at the root of the skill directory.
- If `SKILL.md` is missing in both locations, **stop the audit** and report as non-conformant.

**Record:** directory tree snapshot for the report.

---

## Step 2 — Run the Structure Scanner

Analyze the directory layout against the canonical skill structure.

**Check for these standard directories (if present):**

| Directory      | Purpose                                      | Required? |
|---------------|----------------------------------------------|-----------|
| `scripts/`    | Helper scripts and utilities                 | No        |
| `examples/`   | Reference implementations and usage patterns | No        |
| `resources/`  | Templates, assets, additional files          | No        |
| `references/` | Extended documentation beyond SKILL.md       | No        |

**Checks:**
- [ ] No unexpected top-level files that don't belong (e.g., `.env`, credentials, compiled binaries).
- [ ] No deeply nested structures (more than 4 levels deep is a yellow flag).
- [ ] No excessively large files (> 500 KB for text, > 5 MB for any file).
- [ ] No lockfiles or dependency artifacts (`node_modules/`, `target/`, `__pycache__/`).
- [ ] File naming follows conventions (lowercase, hyphens or underscores, descriptive names).

**Record:** structure compliance matrix.

---

## Step 3 — Review SKILL.md Quality

The `SKILL.md` file is the heart of the skill. Evaluate it thoroughly.

### 3a — Frontmatter Validation

```yaml
# Required fields:
name: "..."          # Must be present, non-empty, descriptive
description: "..."   # Must be present, non-empty, explains what the skill does
```

- [ ] `name` field exists and is a concise, descriptive string.
- [ ] `description` field exists and clearly explains the skill's purpose.
- [ ] No extra frontmatter fields that conflict with the skill system.
- [ ] YAML is well-formed (no syntax errors).

### 3b — Body Content Quality

- [ ] Total line count is under 500 lines (recommended limit).
- [ ] Instructions are clear, actionable, and well-organized.
- [ ] Proper markdown formatting (headings, lists, code blocks).
- [ ] No placeholder text (`TODO`, `FIXME`, `lorem ipsum`, `TBD`).
- [ ] Code examples (if any) are syntactically correct and relevant.
- [ ] References to other files in the skill use correct relative paths.
- [ ] No hardcoded absolute paths or machine-specific references.

### 3c — Solana-Specific Content

- [ ] Skill instructions reference correct Solana concepts and terminology.
- [ ] RPC endpoints (if mentioned) use generic placeholders, not hardcoded URLs.
- [ ] Program IDs (if mentioned) are clearly documented as examples or configurable.
- [ ] No outdated Solana SDK versions or deprecated APIs referenced.

**Record:** SKILL.md quality score (0–10) with itemized findings.

---

## Step 4 — Assess Progressive Loading

Skills should be designed for progressive loading — an agent reads `SKILL.md` first
and only loads additional files when needed.

**Checks:**
- [ ] `SKILL.md` is self-contained enough to understand the skill's purpose without
      reading other files.
- [ ] `references/` directory is used for extended docs (not crammed into SKILL.md).
- [ ] Large code examples are in `examples/`, not inline in SKILL.md.
- [ ] Scripts in `scripts/` are referenced from SKILL.md with clear invocation context.
- [ ] No circular dependencies between files (A references B which references A).
- [ ] Loading order is intuitive: SKILL.md → references → examples → scripts.

**Scoring Guide:**
| Score | Criteria                                                           |
|-------|--------------------------------------------------------------------|
| 0–3   | Monolithic SKILL.md with everything inlined, or scattered with no guide |
| 4–6   | Reasonable separation but unclear loading order or missing references |
| 7–9   | Clean separation with clear progressive loading path               |
| 10    | Exemplary — agent can efficiently load only what it needs          |

**Record:** progressive loading score (0–10) with notes.

---

## Step 5 — Scan for Supply-Chain Risks

This is a critical safety step. Inspect all files for potential risks.

### 5a — Script Analysis (if `scripts/` exists)

- [ ] Read each script file and summarize what it does in plain language.
- [ ] Flag any scripts that: download files, install packages, modify system state,
      access environment variables, or make network requests.
- [ ] Flag obfuscated code (minified JS, base64-encoded payloads, binary blobs).
- [ ] Flag scripts that request elevated permissions (`sudo`, admin access).
- [ ] Verify scripts have clear shebangs and are for expected languages.

### 5b — Dependency Manifests

- [ ] Check for `package.json`, `Cargo.toml`, `requirements.txt`, `pyproject.toml`, etc.
- [ ] If present, review dependencies for known malicious or typosquatting packages.
- [ ] Flag pinned versions vs. ranges — prefer exact versions for reproducibility.
- [ ] Flag any `postinstall` or lifecycle scripts in `package.json`.

### 5c — Embedded Binaries and Opaque Files

- [ ] Flag any compiled binaries (`.exe`, `.so`, `.dylib`, `.wasm` unless expected).
- [ ] Flag any encrypted or compressed archives (`.zip`, `.tar.gz`) that obscure contents.
- [ ] Flag any files that cannot be read as text for manual review.

### 5d — Sensitive Data Scan

- [ ] Scan for private keys, mnemonics, seed phrases (even in examples).
- [ ] Scan for API keys, tokens, secrets, passwords.
- [ ] Scan for `.env` files or environment variable patterns containing secrets.
- [ ] Verify example wallet addresses are clearly labeled as examples.

**Risk Rating:**
| Rating   | Criteria                                                        |
|----------|-----------------------------------------------------------------|
| 🟢 Low   | No scripts, no deps, no binaries, no secrets                  |
| 🟡 Medium | Scripts present but benign, deps are well-known, no secrets   |
| 🔴 High  | Opaque binaries, unknown deps, obfuscated code, or secrets found |
| 🚫 Critical | Active secrets, malicious patterns, or deceptive code found |

**Record:** risk rating with itemized findings.

---

## Step 6 — Score Solana Ecosystem Fit

Evaluate how well the skill serves the Solana developer ecosystem.

**Criteria:**

| Dimension              | Weight | Description                                               |
|-----------------------|--------|-----------------------------------------------------------|
| Relevance             | 25%    | Does this solve a real Solana developer problem?          |
| Accuracy              | 25%    | Are Solana-specific instructions technically correct?     |
| Uniqueness            | 15%    | Does this fill a gap not covered by existing skills?      |
| Completeness          | 15%    | Does the skill cover the topic end-to-end?                |
| Maintainability       | 10%    | Will this skill stay accurate as Solana evolves?          |
| Developer Experience  | 10%    | Is the skill pleasant and efficient to use?               |

**Scoring:**
- Rate each dimension 0–10.
- Compute weighted total (0–10 scale).
- Note any dimension scoring below 5 as a "must-improve" area.

**Record:** Solana fit score (0–10) with per-dimension breakdown.

---

## Step 7 — Generate the Audit Report

Compile all findings into a structured report. Use the following template:

```markdown
# Skill Audit Report

## Summary
- **Skill**: [name from frontmatter]
- **Path**: [directory path]
- **Audit Date**: [current date]
- **Overall Score**: [X/10]
- **Risk Rating**: [🟢/🟡/🔴/🚫]
- **Verdict**: [PASS / CONDITIONAL PASS / FAIL]

## Scores Breakdown
| Category              | Score | Notes                    |
|-----------------------|-------|--------------------------|
| Structure             | X/10  | ...                      |
| SKILL.md Quality      | X/10  | ...                      |
| Progressive Loading   | X/10  | ...                      |
| Supply-Chain Safety   | X/10  | ...                      |
| Solana Ecosystem Fit  | X/10  | ...                      |

## Must-Fix Issues
1. [Issue description — why it must be fixed]
2. ...

## Recommendations
1. [Suggestion — why it would improve the skill]
2. ...

## Safety Assessment
[Detailed safety findings from Step 5]

## Detailed Findings
[Per-step analysis with evidence]
```

**Verdict Criteria:**
- **PASS** (≥ 7.0 overall, no 🔴/🚫 safety, no must-fix issues): Ready for merge.
- **CONDITIONAL PASS** (≥ 5.0 overall, no 🚫 safety): Merge after addressing must-fix items.
- **FAIL** (< 5.0 overall, or 🚫 safety): Requires significant rework.

---

## Step 8 — Present Findings

Deliver the audit report as an artifact. Highlight:

1. **The overall score and verdict** — lead with the conclusion.
2. **Must-fix issues** — these block approval and need author action.
3. **Top 3 recommendations** — most impactful improvements.
4. **Safety concerns** — any supply-chain risks that need attention.

If the skill is a **CONDITIONAL PASS**, clearly state what must change before re-review.
If the skill is a **FAIL**, provide constructive guidance on how to bring it up to standard.

---

## Quick Reference

```
Usage: /skill-audit <path-to-skill-directory>

Example:
  /skill-audit ./skills/solana-token-deploy

Output: Audit report artifact with scores and findings
```
