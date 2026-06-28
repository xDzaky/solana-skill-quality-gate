# Setup

## Requirements

- Node.js 18+
- Solana CLI (optional, for local testing)
- Helius API key (free tier available)

## Installation

```bash
./install.sh
```

## Configuration

Set the following environment variables:

```bash
HELIUS_API_KEY=your_helius_api_key
MONITOR_WALLET=wallet_address_to_monitor
ALERT_THRESHOLD=1000  # SOL amount threshold for alerts
```

## Usage

```bash
# Monitor a specific wallet
node monitor.js --wallet <address>

# Monitor token mint events
node monitor.js --token <mint-address> --events mint,burn
```
