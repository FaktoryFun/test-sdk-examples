````markdown
# Faktory SDK Examples

This repository contains example implementations for integrating the [@faktoryfun/core-sdk](https://www.npmjs.com/package/@faktoryfun/core-sdk?activeTab=readme).

⚠️ Important: Smart contract audit is currently in progress by @setzeus. During this period, new tokens and DEXes created through the SDK will not be tradeable on mainnet, as trading is restricted to a single test address hard coded in the smart contract. Full trading functionality will be enabled automatically only for new tokens created after the audit is complete and this restriction is lifted.

## Overview

These examples demonstrate how to use the Faktory SDK with wallet integration, showing complete transaction lifecycle from parameter building to broadcasting.

## Setup

```bash
git clone https://github.com/FaktoryFun/test-sdk-examples.git
cd test-sdk-examples
npm install
```
````

Create a `.env` file:

```env
NETWORK=mainnet
STX_ADDRESS=your-stacks-address
MNEMONIC=your-mnemonic
```

## Examples

### Buy Tokens

```typescript
// test-buy.ts
// Shows how to:
// - Get price quotes
// - Build buy transaction parameters
// - Handle transaction signing
// - Broadcast transaction
npm run test-buy
```

### Sell Tokens

```typescript
// test-sell.ts
// Shows how to:
// - Get sell quotes
// - Build sell transaction parameters
// - Handle token transfers
npm run test-sell
```

### Create Token

```typescript
// test-create.ts
// Shows how to:
// - Configure token parameters
// - Create new token and DEX
npm run test-create
```

### Verify LP Transfer to AMM (on bonding graduation)

```typescript
// test-verify.ts
// Shows how to:
// - Verify token transfers
npm run test-verify
```

## Utils

The repository includes utility functions for:

- Network configuration
- Account derivation from mnemonics
- Transaction nonce management
- Broadcast result logging

## Important Notes

⚠️ This is test code - make sure to implement proper error handling and security measures in production.

⚠️ Trading functionality is currently restricted on mainnet pending smart contract audit completion.

## Links

- [Faktory SDK Documentation](https://github.com/FaktoryFun/core-sdk)
- [Faktory Website](https://faktory.fun)

```

```
