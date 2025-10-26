# Faktory SDK Test Suite

This repository contains tests for the Faktory SDK, demonstrating how to use the SDK to interact with Stacks smart contracts, particularly for DEX and pool operations.

## sBTC Pool Tests

The following tests demonstrate how to use the Faktory SDK for sBTC pool operations:

### Prerequisites

1. Create a `.env` file with your mnemonic:

   ```
   MNEMONIC="your twelve word mnemonic phrase goes here"
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Link the SDK (if developing locally):

   ```bash
   # In SDK directory
   cd ~/path/to/faktory-sdk
   npm link

   # In this test directory
   npm link @faktoryfun/core-sdk
   ```

### Buy with sBTC Test

The `test-pool-sbtc-buy.ts` file demonstrates how to:

- Get a quote for buying tokens with sBTC
- Generate transaction parameters for the buy operation
- Create and broadcast a transaction

Run the test:

```bash
npm run main-buy-pool
```

### Sell for sBTC Test

The `test-pool-sbtc-sell.ts` file demonstrates how to:

- Get a quote for selling tokens to receive sBTC
- Generate transaction parameters for the sell operation
- Create and broadcast a transaction

Run the test:

```bash
npm run main-sell-pool
```

## Key Implementation Notes

### Type Compatibility with npm link

When using `npm link`, you might encounter TypeScript errors due to multiple instances of the same package. To avoid these issues:

1. Create function arguments locally instead of using SDK's directly:

   ```typescript
   const functionArgs = [
     contractPrincipalCV(poolAddress, poolName),
     uintCV(amountInMicrounits),
     someCV(bufferCV(Buffer.from([0x00]))), // For buy (0x01 for sell)
   ];
   ```

2. Use consistent post condition types:
   ```typescript
   const postConditions = [
     makeStandardFungiblePostCondition(
       address,
       FungibleConditionCode.LessEqual,
       amountInMicrounits.toString(),
       assetInfo
     ),
   ];
   ```

### Error Handling

The tests include fallback mechanisms if post condition creation fails, allowing you to test the core functionality even if there are issues with contract addresses or asset details.

### Post Conditions

Post conditions are critical for user safety. They ensure:

- For buys: User doesn't spend more than specified sBTC and receives at least minimum tokens
- For sells: User doesn't spend more than specified tokens and receives at least minimum sBTC

## Available Scripts

```json
{
  "main-buy-pool": "ts-node test-pool-sbtc-buy.ts",
  "main-sell-pool": "ts-node test-pool-sbtc-sell.ts"
}
```

Add these to your `package.json` scripts section.
