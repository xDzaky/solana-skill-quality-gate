---
name: prepare-skill-pr
description: >
  Prepare a Solana skill for pull request submission. Guides the author through
  a self-audit, structural verification, content checks, safety scan, and score
  generation. Produces a PR-ready submission with a standardized title, description,
  and pre-submission checklist.
---

# Prepare Skill PR — Submission Workflow

> **Scope**: single skill directory, preparing for PR submission
> **Mode**: read-only analysis + PR metadata generation
> **Output**: PR title, description body, and verified checklist

---

## Overview

This command walks skill authors through a structured preparation process before
submitting a pull request. It catches common issues early, ensures the skill meets
quality standards, and generates a consistent PR format for reviewers.

**Run this command before every skill PR submission.**

---

## Step 1 — Self-Audit

Before preparing the PR, run a self-assessment on the skill directory.

### 1a — Verify You're in the Right Directory

```
Expected: skills/<your-skill-name>/
Current:  [confirm path]
```

- [ ] The skill is in a properly named directory under `skills/`.
- [ ] Directory name is lowercase with hyphens (e.g., `solana-token-deploy`).
- [ ] Directory name is descriptive and matches the skill's purpose.

### 1b — Run a Quick Self-Score

Mentally evaluate your skill against these criteria:

| Question                                                    | Yes/No |
|------------------------------------------------------------|--------|
| Does SKILL.md clearly explain what this skill does?        |        |
| Can an agent understand the skill from SKILL.md alone?     |        |
| Are large code blocks in `examples/` rather than inline?   |        |
| Are extended docs in `references/` rather than SKILL.md?   |        |
| Have you checked for accidental secrets or credentials?    |        |
| Is all Solana-specific content technically accurate?       |        |
| Does the skill solve a real problem for Solana developers? |        |

If you answered "No" to any question, address it before proceeding.

---

## Step 2 — Verify Structure

Confirm the skill directory follows the canonical layout.

### Required Files

```
<skill-name>/
├── SKILL.md              ← REQUIRED: main instruction file
```

### Optional Standard Directories

```
<skill-name>/
├── SKILL.md
├── README.md             ← Optional: human-readable overview
├── scripts/              ← Optional: helper scripts and utilities
│   └── ...
├── examples/             ← Optional: reference implementations
│   └── ...
├── resources/            ← Optional: templates, assets, configs
│   └── ...
└── references/           ← Optional: extended documentation
    └── ...
```

### Structural Checks

- [ ] `SKILL.md` exists at the skill root.
- [ ] No unexpected files at the root (e.g., `.env`, compiled binaries, lockfiles).
- [ ] No `node_modules/`, `target/`, `__pycache__/`, or other dependency artifacts.
- [ ] Directory nesting does not exceed 4 levels.
- [ ] No files exceed 500 KB (text) or 5 MB (any type).
- [ ] All filenames are lowercase with hyphens or underscores.
- [ ] No empty directories or placeholder files.

---

## Step 3 — Check SKILL.md

The most critical file in the skill. Verify it thoroughly.

### 3a — Frontmatter

```yaml
---
name: your-skill-name
description: >
  A clear, concise description of what this skill does and when
  an agent should use it. This is used for trigger-matching.
---
```

**Checklist:**
- [ ] `name` field is present and matches the directory name.
- [ ] `description` field is present, non-empty, and descriptive.
- [ ] Description explains both **what** the skill does and **when** to use it.
- [ ] YAML syntax is valid (no tabs, proper quoting, correct indentation).
- [ ] No extra frontmatter fields that might conflict with the skill system.

### 3b — Body Content

- [ ] Total length is under 500 lines (recommended maximum).
- [ ] Content is organized with clear markdown headings (h2, h3).
- [ ] Instructions are actionable — an agent can follow them step by step.
- [ ] Code examples are syntactically correct and use proper fenced blocks.
- [ ] No placeholder text (`TODO`, `FIXME`, `TBD`, `lorem ipsum`, `XXX`).
- [ ] No hardcoded absolute paths (use relative paths within the skill).
- [ ] No machine-specific assumptions (specific OS paths, usernames, etc.).
- [ ] All references to other files in the skill use correct relative paths.

### 3c — Solana Content Accuracy

- [ ] Solana terminology is used correctly (programs, accounts, instructions, etc.).
- [ ] RPC endpoints use placeholders (e.g., `<YOUR_RPC_URL>`) not hardcoded URLs.
- [ ] Program IDs are clearly labeled as examples or marked as configurable.
- [ ] SDK versions referenced are current (not deprecated).
- [ ] No outdated patterns (e.g., old Anchor syntax, deprecated SPL interfaces).
- [ ] Cluster references are appropriate (devnet for testing, mainnet-beta for prod).

---

## Step 4 — Check README (if present)

If a `README.md` exists alongside `SKILL.md`, verify it adds value.

- [ ] README provides a human-readable overview (not a duplicate of SKILL.md).
- [ ] README explains the skill's purpose for human contributors.
- [ ] README documents any prerequisites or setup needed.
- [ ] README includes usage examples if applicable.
- [ ] README does not contradict SKILL.md content.
- [ ] README links to SKILL.md for agent-facing instructions.

**Note:** A README is optional. Not every skill needs one. If the skill is simple
enough that SKILL.md covers everything, a README may be unnecessary.

---

## Step 5 — Check Safety

This is a critical step. Run through the safety checklist carefully.

### 5a — Secrets Scan

Search all files in the skill directory for:

- [ ] Private keys (base58 strings that look like Solana keypairs).
- [ ] Mnemonics or seed phrases (12/24 word sequences).
- [ ] API keys or tokens (strings matching `sk-`, `Bearer `, `token=`, etc.).
- [ ] `.env` files or references to environment variables containing secrets.
- [ ] Hardcoded passwords or credentials.

**If any secrets are found: STOP. Remove them, rotate the compromised credentials,
and restart this checklist.**

### 5b — Script Safety

If the skill includes a `scripts/` directory:

- [ ] Each script has a clear purpose documented in SKILL.md.
- [ ] No scripts download files from the internet.
- [ ] No scripts install packages or modify system state.
- [ ] No scripts require elevated permissions (`sudo`).
- [ ] No obfuscated code (minified, base64-encoded, compressed).
- [ ] Scripts are in expected languages (bash, Python, TypeScript, Rust).

### 5c — Dependency Safety

If dependency manifests exist (`package.json`, `Cargo.toml`, etc.):

- [ ] All dependencies are well-known, reputable packages.
- [ ] No typosquatting risks (double-check package name spelling).
- [ ] Versions are pinned to exact versions (not ranges).
- [ ] No `postinstall` or lifecycle scripts in `package.json`.
- [ ] No unnecessary dependencies (minimize attack surface).

### 5d — Binary and Opaque File Check

- [ ] No compiled binaries (`.exe`, `.so`, `.dylib`) unless explicitly justified.
- [ ] No compressed archives that obscure their contents.
- [ ] All files can be read and reviewed as text.
- [ ] `.wasm` files (if present) have corresponding source code.

---

## Step 6 — Generate Score

Run the skill scorer to get a baseline score before submission.

```
/skill-score <path-to-your-skill>
```

**Minimum thresholds for PR submission:**

| Dimension          | Minimum Score | Rationale                            |
|-------------------|---------------|--------------------------------------|
| Structure         | 6/10          | Basic organization must be correct   |
| Content Quality   | 6/10          | Instructions must be usable          |
| Progressive Loading| 5/10         | Some separation expected             |
| Safety            | 8/10          | High bar for safety is non-negotiable|
| Solana Fit        | 6/10          | Must be relevant to ecosystem        |
| **Overall**       | **6.0/10**    | **Minimum for CONDITIONAL PASS**     |

**If your score is below the minimums:**
- Review the flags in the score output.
- Address each flag before proceeding.
- Re-run the scorer to verify improvement.

**If your overall score is below 6.0:** do not submit the PR. Address the issues
first and re-score.

---

## Step 7 — Prepare the PR

### PR Title Template

```
feat(skills): add <skill-name> — <brief description>
```

**Examples:**
```
feat(skills): add solana-token-deploy — guided SPL token creation and deployment
feat(skills): add anchor-testing — comprehensive Anchor program test patterns
feat(skills): add validator-setup — Solana validator node configuration guide
```

### PR Description Template

Use this template for the PR body:

```markdown
## Skill: <skill-name>

### Description
<Clear explanation of what this skill does and what problem it solves for
Solana developers. 2-3 sentences.>

### Motivation
<Why does this skill need to exist? What gap does it fill? What developer
pain point does it address?>

### Skill Score
- **Overall**: X.X/10
- **Structure**: X/10
- **Content Quality**: X/10
- **Progressive Loading**: X/10
- **Safety**: X/10
- **Solana Fit**: X/10
- **Verdict**: PASS / CONDITIONAL PASS

### Contents
<Brief listing of what's included>
- `SKILL.md` — main instruction file (X lines)
- `examples/` — X reference implementations
- `scripts/` — X helper utilities
- `references/` — X extended documentation files

### Testing
<How was this skill tested?>
- [ ] Manually followed SKILL.md instructions end-to-end
- [ ] Verified all code examples compile/run correctly
- [ ] Tested with an AI agent for instruction clarity
- [ ] Checked against current Solana SDK versions

### Checklist
- [ ] SKILL.md has valid frontmatter (name + description)
- [ ] SKILL.md is under 500 lines
- [ ] No secrets, credentials, or private keys included
- [ ] No compiled binaries or opaque files
- [ ] All Solana-specific content is technically accurate
- [ ] Self-score meets minimum thresholds (overall ≥ 6.0)
- [ ] Ran `/skill-score` and included results above
```

---

## Pre-Submission Checklist

**Final checks before clicking "Create Pull Request":**

### Content & Quality
- [ ] SKILL.md frontmatter is valid with `name` and `description`.
- [ ] SKILL.md body is clear, actionable, and under 500 lines.
- [ ] All code examples are syntactically correct.
- [ ] No placeholder text remains (`TODO`, `FIXME`, `TBD`).
- [ ] Markdown renders correctly (preview it).

### Structure & Organization
- [ ] Skill is in `skills/<skill-name>/` directory.
- [ ] Directory follows canonical layout.
- [ ] No unnecessary files or artifacts included.
- [ ] File naming conventions followed.

### Safety & Security
- [ ] **No secrets, keys, or credentials anywhere in the skill.**
- [ ] No suspicious scripts or obfuscated code.
- [ ] No compiled binaries without source.
- [ ] Dependency manifests (if any) are clean and minimal.

### Solana Accuracy
- [ ] Terminology is correct and current.
- [ ] SDK versions and APIs are not deprecated.
- [ ] RPC endpoints use placeholders, not hardcoded URLs.
- [ ] Program IDs are clearly documented.

### PR Metadata
- [ ] PR title follows the template: `feat(skills): add <name> — <description>`.
- [ ] PR description uses the standard template.
- [ ] Self-score results are included in the PR description.
- [ ] All testing checkboxes are honestly filled out.

### Final Confirmation
- [ ] I have read through the entire skill one final time.
- [ ] I am confident this skill provides value to Solana developers.
- [ ] I am confident this skill is safe for agents to consume.

---

## After Submission

Once the PR is submitted:

1. **Monitor for reviewer feedback.** Respond promptly to comments.
2. **Expect a `/skill-audit` to be run** by the reviewer — the audit report
   will be posted as a PR comment.
3. **Address all must-fix issues** before requesting re-review.
4. **Re-run `/skill-score`** after making changes and update the PR description.
5. **Don't force-push** unless asked — reviewers lose comment context on force-push.
