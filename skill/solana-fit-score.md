# Solana Fit Score — Ecosystem Relevance Framework

This document defines how to evaluate whether a skill is genuinely relevant to the **Solana ecosystem** and not a generic tool with Solana keywords superficially applied.

---

## Why Solana Fit Matters

Solana AI Kit is a curated collection of skills purpose-built for the Solana ecosystem. Accepting generic skills degrades the kit's quality and confuses users who expect Solana-specific functionality. The fit score ensures that:

- Skills provide **genuine Solana value**, not just keyword matches
- Generic utilities are identified and redirected to more appropriate registries
- Keyword-stuffed submissions are detected and flagged
- The kit maintains a **high signal-to-noise ratio**

---

## Keyword Taxonomy

### Tier 1 — Core Solana (Weight: 3x)

Keywords that are unique to or strongly associated with the Solana ecosystem:

| Category          | Keywords                                                                          |
|-------------------|-----------------------------------------------------------------------------------|
| **Runtime**       | `Solana`, `Sealevel`, `SVM`, `Solana Virtual Machine`, `BPF`, `sBPF`             |
| **SDK/Framework** | `@solana/web3.js`, `@solana/spl-token`, `Anchor`, `Seahorse`, `solana-program`   |
| **Token System**  | `SPL Token`, `SPL Token-2022`, `Token Extensions`, `Mint`, `ATA`                 |
| **Consensus**     | `Proof of History`, `PoH`, `Tower BFT`, `Gulf Stream`, `Turbine`                 |
| **Accounts**      | `AccountInfo`, `PDA`, `Program Derived Address`, `System Program`, `Rent`        |
| **Programs**      | `on-chain program`, `CPI`, `Cross-Program Invocation`, `instruction data`        |
| **Networks**      | `mainnet-beta`, `devnet`, `testnet`, `localnet`, `solana-test-validator`         |
| **Wallets**       | `Phantom`, `Solflare`, `Backpack`, `Glow`, `wallet-adapter`                      |
| **CLI**           | `solana-cli`, `solana-keygen`, `solana airdrop`, `solana deploy`                 |

### Tier 2 — Testing & Security (Weight: 2x)

Keywords related to Solana-specific testing, security, and development tooling:

| Category          | Keywords                                                                          |
|-------------------|-----------------------------------------------------------------------------------|
| **Testing**       | `Bankrun`, `solana-program-test`, `Amman`, `anchor test`, `Trident`              |
| **Security**      | `Soteria`, `sec3`, `Neodyme`, `sealevel-attacks`, `account validation`           |
| **Debugging**     | `solana logs`, `solana confirm`, `explorer.solana.com`, `transaction inspector`  |
| **Build Tools**   | `anchor build`, `cargo build-sbf`, `solana program deploy`, `Verifiable Build`   |
| **Monitoring**    | `Helius`, `Triton`, `QuickNode`, `Alchemy (Solana)`, `Shyft`                    |

### Tier 3 — DeFi & Protocols (Weight: 2x)

Keywords for Solana-native DeFi protocols, NFTs, and ecosystem projects:

| Category          | Keywords                                                                          |
|-------------------|-----------------------------------------------------------------------------------|
| **DEX**           | `Raydium`, `Orca`, `Jupiter`, `OpenBook`, `Serum (legacy)`, `Meteora`            |
| **Lending**       | `Solend`, `MarginFi`, `Kamino`, `Drift`, `Mango`                                |
| **NFTs**          | `Metaplex`, `Candy Machine`, `Token Metadata`, `Bubblegum`, `cNFT`              |
| **Staking**       | `Marinade`, `Jito`, `stake pool`, `mSOL`, `jitoSOL`, `bSOL`                     |
| **Governance**    | `Realms`, `SPL Governance`, `Squads`, `Multisig`                                 |
| **Payments**      | `Solana Pay`, `SOL transfer`, `SPL token transfer`, `QR code payment`            |
| **Oracles**       | `Pyth`, `Switchboard`, `price feed`                                              |
| **Storage**       | `Shadow Drive`, `Arweave (Solana context)`, `SHDW`                               |

### Tier 4 — Infrastructure (Weight: 1x)

General blockchain and infrastructure keywords that are relevant but not Solana-exclusive:

| Category          | Keywords                                                                          |
|-------------------|-----------------------------------------------------------------------------------|
| **Standards**     | `JSON-RPC`, `WebSocket`, `gRPC`, `REST API`                                      |
| **Data**          | `borsh`, `transaction`, `blockhash`, `slot`, `epoch`, `lamports`                 |
| **Bridging**      | `Wormhole`, `Allbridge`, `deBridge`, `cross-chain`                               |
| **AI/Agent**      | `AI agent`, `LLM tool`, `skill`, `agent kit`, `function calling`                |
| **General Dev**   | `TypeScript`, `Rust`, `Node.js`, `npm`, `cargo`                                 |

---

## Scoring Rules

### Fit Level Determination

| Fit Level  | Criteria                                                         | Score Range |
|------------|------------------------------------------------------------------|-------------|
| 🟢 High   | ≥ 3 Tier 1 keywords **AND** functional Solana integration        | 12–15       |
| 🟡 Medium | ≥ 1 Tier 1 keyword **AND** ≥ 2 Tier 2/3 keywords                | 8–11        |
| 🟠 Low    | ≥ 1 Tier 1 keyword **OR** ≥ 3 Tier 2/3/4 keywords               | 4–7         |
| 🔴 No Fit | 0 Tier 1 keywords **AND** < 3 other-tier keywords                | 0–3         |

### Scoring Algorithm

```
Base Score:
  Tier1_matches × 3 = T1_score (cap at 9)
  Tier2_matches × 2 = T2_score (cap at 6)
  Tier3_matches × 2 = T3_score (cap at 6)
  Tier4_matches × 1 = T4_score (cap at 3)

Raw Score = T1_score + T2_score + T3_score + T4_score (cap at 15)

Adjustments:
  - Keyword stuffing penalty: -3 to -15 (see below)
  - Functional integration bonus: +0 to +3
  - Generic skill penalty: -3 to -5
  
Final Score = max(0, min(15, Raw_Score + Adjustments))
```

### Functional Integration Assessment

A skill gets a bonus for **actually doing** something Solana-specific, beyond just mentioning keywords:

| Integration Type                                    | Bonus |
|-----------------------------------------------------|-------|
| Makes Solana RPC calls                              | +3    |
| Generates or parses Solana transactions              | +3    |
| Interacts with SPL tokens or programs                | +2    |
| Uses Anchor IDL or program interfaces                | +2    |
| Targets a specific Solana protocol (Raydium, etc.)   | +1    |
| Only references Solana in documentation text         | +0    |

---

## Keyword Stuffing Detection

**Keyword stuffing** is the practice of artificially inflating keyword counts to game the fit score. It's a red flag for low-quality or deceptive submissions.

### Detection Thresholds

| Metric                                          | Normal  | Suspicious | Stuffed  |
|-------------------------------------------------|---------|------------|----------|
| Solana keyword density (% of total words)       | 1–3%    | 3–5%       | > 5%     |
| Unique Solana keywords / Total Solana mentions  | > 0.5   | 0.3–0.5    | < 0.3    |
| Solana keywords in code vs. prose               | Mixed   | Prose-heavy| Prose-only|
| Same keyword repeated > N times                 | N ≤ 5   | 5 < N ≤ 10| N > 10   |

### Stuffing Penalty

| Level      | Penalty | Description                                      |
|------------|---------|--------------------------------------------------|
| Normal     | 0       | Natural keyword usage                            |
| Suspicious | -3      | Elevated density; may be legitimate in a focused skill |
| Confirmed  | -8      | Clear stuffing pattern; repeated keywords without substance |
| Egregious  | -15     | Overwhelming stuffing; skill is likely a bad-faith submission |

### Stuffing Examples

**Normal usage** (no penalty):
```markdown
## Solana Token Swap Skill
This skill helps you swap SPL tokens on Jupiter using Solana's 
transaction system. It constructs a versioned transaction, 
fetches a recent blockhash, and submits via the Solana RPC.
```

**Suspicious usage** (-3 penalty):
```markdown
## Solana Solana Token Tool for Solana
A Solana skill that works with Solana tokens on the Solana blockchain.
Uses Solana web3.js to interact with Solana programs on Solana mainnet.
```

**Confirmed stuffing** (-8 penalty):
```markdown
## Solana Skill
Solana Solana Solana. This Solana tool does Solana things on Solana.
Solana SPL Solana Token Solana Swap Solana DeFi Solana NFT Solana.
Built for Solana by Solana enthusiasts using Solana technology.
Keywords: Solana, Phantom, Jupiter, Raydium, Metaplex, Anchor, SPL.
```

---

## Examples

### Example A — High Fit (Score: 14/15)

**Skill**: "Jupiter Swap Executor"

| Metric                  | Value                                    |
|-------------------------|------------------------------------------|
| Tier 1 keywords         | Solana, SPL Token, @solana/web3.js, ATA  |
| Tier 3 keywords         | Jupiter, Raydium                         |
| Functional integration  | Builds and signs swap transactions (+3)  |
| Keyword stuffing        | Normal (0)                               |
| **Final Score**         | **14**                                   |

**Why it scores high**: Uses core Solana primitives, targets a specific Solana DeFi protocol, and the code _actually does_ Solana-specific work.

---

### Example B — Medium Fit (Score: 9/15)

**Skill**: "Anchor Project Scaffolder"

| Metric                  | Value                                          |
|-------------------------|-------------------------------------------------|
| Tier 1 keywords         | Solana, Anchor                                  |
| Tier 2 keywords         | anchor build, anchor test, Verifiable Build     |
| Functional integration  | Generates boilerplate, doesn't make RPC calls (+1) |
| Keyword stuffing        | Normal (0)                                      |
| **Final Score**         | **9**                                           |

**Why it scores medium**: Relevant to Solana development but more of a dev tool than a runtime integration. Keywords are appropriate but functional depth is limited.

---

### Example C — Low Fit (Score: 5/15)

**Skill**: "Blockchain Transaction Logger"

| Metric                  | Value                                          |
|-------------------------|-------------------------------------------------|
| Tier 1 keywords         | Solana (mentioned once)                         |
| Tier 4 keywords         | transaction, JSON-RPC, REST API                 |
| Functional integration  | Generic logger, Solana is one of 5 chains (+0)  |
| Keyword stuffing        | Normal (0)                                      |
| **Final Score**         | **5**                                           |

**Why it scores low**: Solana is incidental. The skill works across chains and has no Solana-specific logic.

---

### Example D — No Fit (Score: 1/15)

**Skill**: "Markdown Linter"

| Metric                  | Value                               |
|-------------------------|--------------------------------------|
| Tier 1 keywords         | 0                                    |
| Other tier keywords     | Node.js, npm                         |
| Functional integration  | No Solana interaction (+0)           |
| Keyword stuffing        | Normal (0)                           |
| **Final Score**         | **1**                                |

**Why it scores zero-range**: This is a general-purpose tool with no Solana connection. It belongs in a general skill registry, not Solana AI Kit.

---

### Example E — Keyword Stuffed (Score: 2/15)

**Skill**: "Solana Super Tool"

| Metric                  | Value                               |
|-------------------------|--------------------------------------|
| Tier 1 keywords         | Solana (×23), SPL Token (×8)         |
| Tier 3 keywords         | Jupiter (×5), Raydium (×5)           |
| Functional integration  | No actual code, just documentation (+0) |
| Keyword stuffing        | Egregious (-15)                      |
| Raw score before penalty| 15 (capped)                          |
| **Final Score**         | **2** (after -15 penalty, floored at 0, +2 for some keywords) |

**Why it scores low**: High raw keyword count completely undercut by egregious stuffing penalty and zero functional integration.

---

## Scoring Integration

This evaluation feeds into **Gate 4 — Solana Ecosystem Fit** in the [quality gates](./quality-gates.md). The gate allocates **15 points** across four checks:

| Check | What it evaluates                         | Points |
|-------|-------------------------------------------|--------|
| 4.1   | Core Solana keyword presence              | 5      |
| 4.2   | Functional Solana integration             | 4      |
| 4.3   | No keyword stuffing                       | 3      |
| 4.4   | Valid Solana use case                     | 3      |
