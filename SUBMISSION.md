# SUBMISSION.md — Bounty Submission

## One-Paragraph Pitch

**solana-skill-quality-gate** is a pre-submit quality gate for Solana skill builders and a review accelerator for Solana AI Kit maintainers. Builders run `skillqa audit ./my-skill` to catch safety issues, structural problems, and quality gaps before opening a PR — improving their chance of merge. Maintainers use `skillqa batch ./submissions` to triage hundreds of submissions in seconds instead of hours. Zero dependencies, read-only, no network calls.

---

## Why This Is Novel

Most bounty submissions add one more domain skill. **This submission improves the quality of every future skill.**

It is a meta-infrastructure layer for Solana AI Kit — the first skill whose purpose is to evaluate, score, and gate other skills. I have not found another submission positioned as maintainer/builder quality infrastructure.

Without a quality gate, the kit risks accumulating technical debt, prompt injection vulnerabilities, and low-quality skills that hurt the ecosystem. This skill is the immune system.

---

## Why This Is Useful for Solana Builders

| Builder Problem | How This Solves It |
|-----------------|-------------------|
| "Will my skill get merged?" | Run audit before submitting — fix blockers first |
| "Is my skill safe?" | Safety scanner catches prompt injection, secret collection, opaque exec |
| "Is my SKILL.md too big?" | Progressive disclosure checker flags monolithic files |
| "Am I Solana-specific enough?" | Evidence-based Solana fit scoring (not just keywords) |
| "What do I need to fix?" | PR-ready checklist with must-fix / should-fix / nice-to-have |

### Why This Is Useful for Maintainers

| Maintainer Problem | How This Solves It |
|-------------------|-------------------|
| Hundreds of submissions, manual review is slow | `batch` command scores all in seconds |
| Unsafe skills slip through | Safety scanner + policy caps |
| Inconsistent review standards | Deterministic 100-point scoring rubric |
| CI/CD integration needed | `--strict`, `--fail-under`, SARIF, exit codes |

---

## Verification Commands

```bash
git clone https://github.com/xDzaky/solana-skill-quality-gate
cd solana-skill-quality-gate

npm test                                                          # 50 tests
npm run gate                                                      # self-audit ≥ 90
node scripts/skillqa.mjs batch scripts/fixtures/benchmark-samples --json
node scripts/skillqa.mjs report scripts/fixtures/bad-skill --sarif --out bad.sarif
node scripts/skillqa.mjs audit scripts/fixtures/bad-skill --strict  # exit 2
```

---

## Key Proof Points

- **50 tests** — self-audit, policy caps, strict, fail-under, batch, SARIF, evidence, hardened self-audit
- **Self-audit: 100/100** — scanner passes its own quality gate
- **5 benchmark fixtures** with known expected scores
- **Community scan report** — 5 archetype submissions audited with findings
- **Batch review** — scan multiple skills in one command
- **SARIF 2.1.0** — GitHub Code Scanning compatible
- **Evidence-based Solana fit** — 5 structural signals beyond keyword counting
- **Builder-first workflow** — "Use It Before You Submit"
- **Agent + command** — `/review-skill` slash command + reviewer agent persona
- **Zero npm dependencies** — single readable .mjs file
- **CI** — Node 18/20/22 matrix

---

## Safety Model

- Read-only — never modifies audited skills
- No network calls — works entirely offline
- No secret collection — never asks for private keys or seed phrases
- No script execution — does not run install.sh or any audited code
- No opaque binaries — zero npm dependencies
- Transparent — all rules in `scripts/rules.json`

---

## Limitations

- Keyword-based detection, not semantic analysis
- No runtime analysis
- English-focused safety patterns
- Assistive tool — speeds up human review, does not replace it

---

## Bounty Form Answers

**Link to Your Submission:**
https://github.com/xDzaky/solana-skill-quality-gate

**Did you contribute towards existing repos or is it a new idea?**
This is a new idea.

`solana-skill-quality-gate` is a builder-first pre-submit quality gate for Solana AI Kit skills, and a review accelerator for maintainers. It helps skill authors audit their own submissions before opening a PR, then helps reviewers triage skills consistently with deterministic scoring, safety checks, Solana fit evidence, batch review, SARIF output, and PR-ready reports.

**What is your closest "competing" skill?**
The closest comparison is a mix of generic skill format validation, static safety linting, and PR readiness tooling. However, I have not found another submission positioned as quality infrastructure for the kit itself. This skill checks not only file structure, but also progressive disclosure, semantic supply-chain risks, Solana ecosystem fit, install/test readiness, docs quality, and GitHub Code Scanning-compatible SARIF output.

**Post any links/proofs:**
- Repo: https://github.com/xDzaky/solana-skill-quality-gate
- CI: https://github.com/xDzaky/solana-skill-quality-gate/actions
- SUBMISSION.md: https://github.com/xDzaky/solana-skill-quality-gate/blob/main/SUBMISSION.md
- Community scan: https://github.com/xDzaky/solana-skill-quality-gate/blob/main/examples/community-scan-report.md
- SARIF: https://github.com/xDzaky/solana-skill-quality-gate/blob/main/examples/bad-skill.sarif
- Batch report: https://github.com/xDzaky/solana-skill-quality-gate/blob/main/examples/batch-review.md

**Anything Else?**
This submission is not just another domain skill. It is a meta-infrastructure skill that improves the quality of every future Solana AI Kit skill. Most submissions add one more skill. This one protects the ecosystem.

---

## PR Body for solanabr/skill-bounty

```markdown
## solana-skill-quality-gate

A pre-submit quality gate for Solana skill builders, and a review accelerator for maintainers.

### What it does
- Builders: audit your skill before submitting (`skillqa audit ./my-skill`)
- Maintainers: batch-review hundreds of submissions in seconds (`skillqa batch ./submissions`)
- 6-category scoring (100 points): structure, progressive disclosure, safety, Solana fit, install, docs
- Policy caps for critical findings (prompt injection → max 39)
- SARIF 2.1.0 for GitHub Code Scanning
- Evidence-based Solana fit (5 structural signals)

### Verification
```bash
npm test           # 50 tests
npm run gate       # self-audit ≥ 90
```

### Key facts
- Zero npm dependencies
- Read-only, no network calls, no script execution
- Self-audit: 100/100
- Node 18/20/22 CI matrix
- Builder-first pre-submit workflow
- Agent + command integration

### Links
- Repo: https://github.com/xDzaky/solana-skill-quality-gate
- Solana AI Kit: https://github.com/solanabr/solana-ai-kit
```
