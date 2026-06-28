# Solana Ecosystem Signals

How to demonstrate genuine Solana fit in your skill.

## Real Solana vs Generic Crypto

❌ **Generic**: "Supports all blockchains including Solana"
✅ **Solana-specific**: "Uses `@solana/web3.js` to query validator stake accounts and track epoch rewards via `getEpochInfo`"

The difference: generic skills mention Solana as one of many chains. Real Solana skills reference **specific programs, APIs, and workflows**.

## Key Ecosystem References

| Category | Programs/Protocols |
|----------|-------------------|
| Core SDK | `@solana/web3.js`, `@solana/kit`, `@solana/spl-token` |
| Frameworks | Anchor, Pinocchio, Seahorse |
| DeFi | Jupiter, Orca, Raydium, Meteora, Kamino |
| NFT/Tokens | Metaplex, Token-2022, Bubblegum (cNFTs) |
| Infrastructure | Helius, QuickNode, Triton, Jito |
| Oracles | Pyth, Switchboard |
| Governance | Squads, SPL Governance, Realms |
| Testing | LiteSVM, Mollusk, Surfpool, Bankrun |
| Concepts | lamport, blockhash, PDA, CPI, instruction, compute unit |

## Writing Solana-Specific Instructions

✅ **DO**: Describe concrete Solana workflows.

```markdown
## How to Verify NFT Ownership
1. Query the token account using `getTokenAccountsByOwner`
2. Check the mint matches the expected collection
3. Verify on-chain collection status via Metaplex `findByMint`
```

❌ **DON'T**: List features without Solana context.

```markdown
- NFT verification
- Token transfers
- Staking
- Governance
(No Solana-specific details)
```

## Avoiding Keyword Stuffing

The scanner detects when Solana keywords appear mostly in the description but not in actual instructions. To pass:

1. Use Solana terms **in the instruction body**, not only in frontmatter
2. Reference specific program IDs or API methods
3. Describe real builder workflows, not just feature lists

## Defining Scope Boundaries

```markdown
## Scope
- Handles SPL token balance queries on mainnet-beta
- Does NOT sign transactions or manage keypairs
- For swap execution, delegate to the jupiter-swap skill
- Complements the solana-staking skill for validator operations
```

Boundaries help maintainers understand where your skill fits in the ecosystem.
