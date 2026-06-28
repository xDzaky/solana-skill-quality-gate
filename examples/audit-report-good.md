# Skill Audit Report

**Skill**: solana-token-monitor
**Audited**: 2026-06-28T14:11:39.087Z
**Scanner**: solana-skill-quality-gate v3.0.0
**Overall Score**: 95/100
**Rating**: Excellent

> ⚠️ This is an automated assessment. Always perform manual review before installing or merging skills from untrusted sources.

---

## Score Breakdown

| Category | Score | Max | Status |
|----------|-------|-----|--------|
| Structure & Format | 20 | 20 | ✅ Pass |
| Progressive Disclosure | 20 | 20 | ✅ Pass |
| Safety & Supply-Chain | 25 | 25 | ✅ Pass |
| Solana Ecosystem Fit | 15 | 15 | ✅ Pass |
| Install & Test Readiness | 7 | 10 | ⚠️ Warning |
| Documentation & Examples | 8 | 10 | ✅ Pass |

---

## Detailed Findings

### Structure & Format

- SKILL.md found: ./skill/SKILL.md
- YAML frontmatter present
- name: "solana-token-monitor"
- name format valid
- description present
- description length OK (217 chars)
- README.md found
- LICENSE found (MIT)

### Progressive Disclosure

- SKILL.md is 35 lines (< 200)
- SKILL.md is 941 bytes (< 8192)
- Routes to 2 focused .md files: setup.md, features.md
- No excessively large inline instruction blocks

### Safety & Supply-Chain

- Priority Manipulation: no risks detected
- Prompt Injection: no risks detected
- Data Exfiltration: no risks detected
- Secret Collection: no risks detected
- Opaque Execution: no risks detected

### Solana Ecosystem Fit

- High Solana fit: 13 Solana-specific keywords found: @solana/web3.js, instruction, lamport, SPL token, SPL, Jupiter, Helius, Metaplex, validator, RPC...
- Moderate Solana fit evidence: 3/5 signals

### Install & Test Readiness

- install.sh found
- install.sh appears transparent (no network/eval commands)
- No package.json found

### Documentation & Examples

- README explains the problem/motivation
- README includes usage examples or code blocks
- No examples/ directory found
- README has substantial content (1173 chars)

---

## Recommendations

### Must Fix (Blocking)

None — all critical checks passed.

### Should Fix (Recommended)

- No package.json found
- No examples/ directory found

### Nice to Have

- Add examples/ directory with sample outputs
- Add GitHub Actions CI workflow
- Consider adding an agent definition
- Consider adding command definitions

---

## PR Readiness Checklist

- [x] SKILL.md has valid YAML frontmatter
- [x] Name follows lowercase-hyphen convention
- [x] Description is clear and under 1024 characters
- [x] README.md explains the problem solved
- [x] LICENSE is MIT or clearly open-source
- [x] Install path is documented and transparent
- [x] No supply-chain risk patterns detected
- [x] Skill is genuinely Solana-specific
- [x] Progressive loading is implemented
- [x] Examples or usage docs are provided
