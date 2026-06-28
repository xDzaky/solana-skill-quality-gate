# Verification

## NFT Ownership Check

Uses @solana/web3.js to query token accounts and verify ownership via Metaplex's `findByMint` method. Supports both legacy NFTs and Token-2022 standard.

## Collection Verification

Queries the DAS API through Helius to verify collection membership and on-chain verification status.

## Metadata Validation

Fetches and validates NFT metadata against Metaplex token metadata standards. Checks URI accessibility, image format, and attribute completeness.
