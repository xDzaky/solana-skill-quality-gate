---
name: solana-defi-toolkit
description: >
  Comprehensive DeFi toolkit for Solana covering swaps, liquidity, and staking.
---

# Solana DeFi Toolkit

A comprehensive DeFi toolkit for building on Solana.

## Features

### Token Swaps
Use Jupiter aggregator for optimal swap routing across Solana DEXes. The Jupiter API provides access to Raydium, Orca, and Meteora liquidity pools. Configure slippage tolerance and priority fees for transactions.

### Liquidity Provision
Provide liquidity to concentrated liquidity market makers (CLMMs) on Orca Whirlpools and Raydium. Calculate impermanent loss exposure. Monitor pool APY and fee earnings.

### Staking
Stake SOL with validators using the native staking program. Track epoch rewards, commission rates, and validator performance. Use Marinade or Jito for liquid staking.

### Portfolio Tracking
Monitor wallet balances across SPL tokens. Track historical P&L. Fetch real-time prices from Jupiter Price API.

### Transaction Building
Build complex transactions with multiple instructions using @solana/web3.js. Set compute unit limits and priority fees. Use versioned transactions with address lookup tables for efficiency.

### Account Management
Create and manage SPL token accounts. Handle token-2022 extensions including transfer fees, interest bearing tokens, and confidential transfers. Use PDAs for program-derived accounts.

### DeFi Analytics
Calculate total value locked (TVL) across protocols. Track trading volume on Raydium and Orca. Monitor lending rates on Solend and MarginFi.

### Validator Operations
Set up and monitor Solana validators. Track vote credits, skip rate, and stake weight. Configure commission and manage authorized keys.

### Bridge Operations
Bridge assets from Ethereum using Wormhole. Track bridge transaction status. Convert wrapped tokens to native SPL tokens.

### Oracle Integration
Fetch price feeds from Pyth and Switchboard oracles. Calculate TWAP for DeFi strategies. Handle oracle staleness and confidence intervals.

### NFT Operations
Mint NFTs using Metaplex Candy Machine v3. Manage collections and verify creators. List on Magic Eden and Tensor marketplaces.

### Compressed NFTs
Create and manage compressed NFTs (cNFTs) using Bubblegum. Interact with state compression trees. Verify proof of ownership through Helius DAS API.

### Governance
Create and manage Solana governance proposals using SPL Governance. Track voting power and delegation. Execute approved proposals through CPI.

### Payment Processing
Accept payments using Solana Pay and Blinks. Generate payment QR codes. Handle webhook notifications for confirmed transactions.

### Security Scanning
Audit smart contracts for common vulnerabilities. Check program authority and upgrade status. Verify account ownership and PDA derivation.

### Testing
Test DeFi strategies using solana-test-validator. Mock oracle prices for testing. Use Bankrun for fast integration tests. Run anchor test suites.

### RPC Management
Configure RPC endpoints for Helius, QuickNode, and Triton. Handle rate limiting and failover. Use gRPC for streaming account updates.

### Token Creation
Launch tokens with custom metadata. Set up token-2022 extensions. Create liquidity pools on Raydium and Orca.

### Airdrop Distribution
Calculate token distributions based on wallet activity. Execute batch transfers. Track airdrop claim status.

## Configuration

Set up your environment variables:

```
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
JUPITER_API_KEY=your_key
HELIUS_API_KEY=your_key
```

## Usage

This toolkit provides everything you need for DeFi development on Solana. Each feature module can be used independently or combined for complex DeFi strategies.

## Safety

- Read-only by default
- No automatic transaction signing
- All private key handling must be explicit
