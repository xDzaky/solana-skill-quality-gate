# Features

## Wallet Activity Monitor

Track all SPL token transfers for a specified wallet address using @solana/web3.js connection subscriptions and Helius enhanced transaction webhooks.

## Token Supply Tracker

Monitor mint and burn events for any SPL token. Uses token-2022 program extensions for enhanced metadata. Integrates with Metaplex for NFT-related token tracking.

## Jupiter Price Integration

Fetch real-time token prices via Jupiter Price API v2 for converting transfer amounts to USD values. Supports all tokens listed on Jupiter's verified token list.

## Solana Pay Monitoring

Track Solana Pay transaction requests and transfer requests. Compatible with Actions and Blinks for monitoring merchant payment flows.

## Alert System

Configurable alerts for:
- Large transfers (> threshold in lamports or SOL)
- New token accounts created via SPL Token program
- Authority changes on token mints
- Suspicious patterns (rapid small transfers, potential wash trading)
- Validator stake/unstake events
