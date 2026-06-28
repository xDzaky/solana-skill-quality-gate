# Monitoring

## RPC Health Check
Uses @solana/web3.js getHealth() and getSlot() to check node synchronization status. Monitors slot lag against cluster leader schedule. Tracks commitment levels: processed, confirmed, finalized.

## Latency Tracking
Measures round-trip time for getLatestBlockhash and getBalance calls across multiple RPC endpoints including Helius, QuickNode, and Triton.

## Validator Performance
Queries getVoteAccounts to track validator uptime, commission rates, and stake distribution.
