# Progressive Loading — Evaluation Guide

This document defines how to evaluate whether a Solana AI Kit skill follows **progressive disclosure** principles — structuring content so that AI agents load only what they need, when they need it, minimizing wasted context-window tokens.

---

## Why Progressive Loading Matters

AI agents have finite context windows. Every token loaded from a skill file is a token _not_ available for the user's actual task. Skills that dump thousands of lines into a single file:

- **Waste tokens** on instructions the agent may never need
- **Dilute relevance** — the agent must sift through noise to find the right instruction
- **Increase latency** — larger payloads take longer to load and process
- **Risk truncation** — oversized files may be silently cut off by the agent runtime

Progressive disclosure solves this by organizing skill content into a **thin router** (`SKILL.md`) that links to **focused reference files**, loaded on demand.

---

## Size Thresholds

### Line Count — `SKILL.md`

| Lines   | Verdict  | Action                                               |
|---------|----------|------------------------------------------------------|
| ≤ 200   | ✅ Pass  | Good size. Fits comfortably in most context windows.  |
| 201–400 | ⚠️ Warn | Consider splitting. Some content may be deferrable.   |
| > 400   | ❌ Fail  | Must split. This file is too large for a router.      |

### File Size — `SKILL.md`

| Size     | Verdict  | Action                                               |
|----------|----------|------------------------------------------------------|
| ≤ 8 KB   | ✅ Pass  | Efficient. Leaves ample room for task context.        |
| 8–16 KB  | ⚠️ Warn | Approaching limit. Review for extractable content.    |
| > 16 KB  | ❌ Fail  | Oversized. Must refactor into focused files.          |

### Reference Files

Individual reference files (in `references/`, `resources/`, etc.) should also follow reasonable size limits:

| Size     | Verdict  | Action                                               |
|----------|----------|------------------------------------------------------|
| ≤ 20 KB  | ✅ Pass  | Reasonable for a focused reference document.          |
| 20–50 KB | ⚠️ Warn | Large. Consider splitting by topic.                   |
| > 50 KB  | ❌ Fail  | Too large. Must be decomposed.                        |

---

## Routing Structure

A well-structured skill uses `SKILL.md` as a **router** — a concise entry point that:

1. **Describes** the skill's purpose and trigger conditions
2. **Links** to focused files for detailed instructions
3. **Does not** contain the full implementation details itself

### Example: Good Router Pattern

```markdown
---
name: my-solana-skill
description: Does something useful on Solana
---

# My Solana Skill

Short description of what this skill does.

## When to Use
- Trigger condition A
- Trigger condition B

## Workflow
1. Step one — see [detailed-workflow.md](./references/detailed-workflow.md)
2. Step two — see [api-reference.md](./references/api-reference.md)

## Safety
See [safety-notes.md](./references/safety-notes.md)
```

### Routing Checklist

| #   | Check                                              | Required? |
|-----|----------------------------------------------------|-----------|
| R.1 | `SKILL.md` links to ≥ 2 reference files            | Yes       |
| R.2 | Each link uses a relative path                      | Yes       |
| R.3 | Each linked file exists and is readable              | Yes       |
| R.4 | `SKILL.md` does not duplicate content from linked files | Yes   |
| R.5 | Link text is descriptive (not "click here")          | Recommended |
| R.6 | Links are grouped logically (by topic or workflow)   | Recommended |

---

## Focused File Quality

Each file linked from `SKILL.md` should be **self-contained** and **focused on a single topic**. This ensures agents only load what's relevant to the current sub-task.

### Self-Containment Test

A focused file passes the self-containment test if an agent can:

1. Read **only** that file (plus `SKILL.md` frontmatter)
2. Understand the topic completely
3. Act on the instructions without needing to read other reference files

### Focus Test

A focused file passes the focus test if:

1. It covers **one** coherent topic (e.g., "API reference" or "safety guidelines")
2. Removing any section would leave a gap in that topic
3. No section belongs more naturally in a different file

### Quality Checklist

| #   | Check                                              | Required? |
|-----|----------------------------------------------------|-----------|
| F.1 | File has a clear `# Title`                          | Yes       |
| F.2 | File is self-contained (passes test above)          | Yes       |
| F.3 | File is focused on one topic (passes test above)    | Yes       |
| F.4 | File size ≤ 20 KB                                   | Yes       |
| F.5 | File uses markdown formatting consistently          | Recommended |
| F.6 | File does not require reading other files first      | Yes       |

---

## Inline Instruction Blocks

Sometimes `SKILL.md` needs to include short, critical instructions inline — not everything should be deferred. Use this test:

### Inline-Worthy Content

Content belongs inline in `SKILL.md` if it meets **all three** criteria:

1. **Critical**: The agent needs it on _every_ invocation
2. **Brief**: Under 20 lines
3. **Standalone**: Does not depend on context from a reference file

### Examples

| Content Type                     | Inline? | Reason                                      |
|----------------------------------|---------|----------------------------------------------|
| Safety boundary (5 bullet points)| ✅ Yes  | Critical, brief, standalone                  |
| Full API reference (200 lines)   | ❌ No   | Not brief; defer to reference file           |
| Trigger conditions (3 bullets)   | ✅ Yes  | Critical for routing, brief                  |
| Detailed workflow (50+ lines)    | ❌ No   | Not brief; defer to reference file           |
| Quick-start command (2 lines)    | ✅ Yes  | Critical, brief, standalone                  |
| Changelog (any length)           | ❌ No   | Not critical for every invocation            |

---

## Anti-Patterns

### 🚫 The Monolith

**What it is**: A single `SKILL.md` file containing _all_ skill content — instructions, API references, examples, safety notes, changelogs, everything.

**Why it's bad**: Wastes tokens on irrelevant content. Risks truncation. Makes updates error-prone.

**Detection**:
- `SKILL.md` > 400 lines
- `SKILL.md` > 16 KB
- No reference files linked
- > 80% of total skill content is in `SKILL.md`

**Fix**: Extract focused topics into `references/` files and link from `SKILL.md`.

---

### 🚫 The Facade

**What it is**: A tiny `SKILL.md` (< 20 lines) that links to a single massive reference file containing everything.

**Why it's bad**: The router is _too_ thin — it provides no useful context for routing decisions. The single reference file is itself a monolith.

**Detection**:
- `SKILL.md` < 20 lines
- Links to exactly 1 reference file
- That reference file is > 50 KB or > 500 lines

**Fix**: Add meaningful routing content to `SKILL.md` (trigger conditions, quick-start, safety boundary). Split the monolithic reference into multiple focused files.

---

### 🚫 The Repeater

**What it is**: `SKILL.md` contains large blocks of content that are duplicated verbatim in reference files.

**Why it's bad**: Wastes tokens loading the same content twice. Creates maintenance burden — updates must be made in multiple places.

**Detection**:
- Exact or near-exact text matches between `SKILL.md` and reference files
- Paragraphs that appear in both router and a linked file
- Copy-paste artifacts (e.g., same typo in both locations)

**Fix**: Keep the canonical version in the reference file. In `SKILL.md`, use a brief summary and link.

---

### 🚫 The Phantom

**What it is**: `SKILL.md` links to reference files that do not exist.

**Why it's bad**: The agent attempts to load a nonexistent file, wasting a tool call and receiving an error. Breaks the progressive disclosure chain.

**Detection**:
- Relative links in `SKILL.md` that resolve to nonexistent paths
- References to directories that are empty
- Links with typos in filenames

**Fix**: Ensure every link target exists. Run the link-check validation:

```bash
node scripts/skillqa.mjs check-links ./path-to-skill
```

---

## Best Practices Summary

| Practice                                                  | Priority     |
|-----------------------------------------------------------|-------------|
| Keep `SKILL.md` ≤ 200 lines, ≤ 8 KB                      | 🔴 Critical |
| Link to ≥ 2 focused reference files                       | 🔴 Critical |
| No content duplication between router and reference files  | 🔴 Critical |
| Each reference file covers one topic, ≤ 20 KB              | 🟡 Important |
| All internal links resolve to existing files               | 🔴 Critical |
| Inline only critical, brief, standalone content            | 🟡 Important |
| Use descriptive link text                                  | 🟢 Nice     |
| Group links by topic or workflow step                      | 🟢 Nice     |

---

## Scoring Integration

This evaluation feeds into **Gate 2 — Progressive Disclosure** in the [quality gates](./quality-gates.md). The gate allocates **20 points** across six checks:

| Check | What it evaluates                     | Points |
|-------|---------------------------------------|--------|
| 2.1   | `SKILL.md` line count                 | 5      |
| 2.2   | `SKILL.md` file size                  | 3      |
| 2.3   | Router pattern (links to deeper files)| 4      |
| 2.4   | No monolith anti-pattern              | 3      |
| 2.5   | Focused files self-contained          | 3      |
| 2.6   | No phantom references                 | 2      |
