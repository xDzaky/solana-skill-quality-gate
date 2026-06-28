# solana-token-monitor

Monitor SPL token transfers, mint events, and burn events on Solana.

## Problem

Solana builders need real-time visibility into token activity for security monitoring, portfolio tracking, and compliance. Existing solutions are either expensive SaaS products or require complex infrastructure setup.

## Solution

A lightweight, self-hosted token monitoring skill for Solana AI Kit that leverages Helius webhooks and Jupiter price feeds to provide real-time alerts with zero infrastructure overhead.

## Install

```bash
./install.sh
```

## Usage

```bash
# Monitor a wallet
node monitor.js --wallet <address>

# Monitor a token
node monitor.js --token <mint-address> --events mint,burn,transfer
```

## Features

- **Wallet Activity Monitor** — Track SPL token transfers using @solana/web3.js
- **Token Supply Tracker** — Monitor mint/burn events with token-2022 support
- **Jupiter Price Integration** — Real-time USD conversion via Jupiter Price API
- **Solana Pay Monitoring** — Track payment flows via Actions and Blinks
- **Alert System** — Configurable alerts for large transfers, authority changes, and suspicious patterns

## License

MIT
