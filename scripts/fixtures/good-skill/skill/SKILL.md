---
name: solana-token-monitor
description: >
  Monitor SPL token transfers, mint events, and burn events on Solana.
  Provides real-time alerts for wallet activity, token supply changes,
  and suspicious transfer patterns using Helius webhooks and Jupiter
  price feeds.
---

# Solana Token Monitor

Monitor SPL token activity on Solana in real-time.

## When to Use

- Tracking token transfers for a specific wallet
- Monitoring mint/burn events for token supply analysis
- Setting up alerts for suspicious transfer patterns
- Integrating Helius webhooks for real-time notifications

## Quick Start

See [setup.md](./setup.md) for configuration instructions.

## Features

See [features.md](./features.md) for detailed capability descriptions.

## Safety

- Read-only monitoring — no transactions are signed or sent
- No private keys or seed phrases required
- Uses public RPC endpoints only
- No data exfiltration or external reporting
