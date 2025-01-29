# Faktory SDK Examples

This repository contains example implementations for integrating the [@faktoryfun/core-sdk](https://www.npmjs.com/package/@faktoryfun/core-sdk?activeTab=readme).

⚠️ Important: Token supply cannot exceed 1 billion tokens for better relatability. Note: If you receive a 500 status error during token creation, check if your supply exceeds 1 billion tokens. Please reduce the supply to 1 billion or less for better token relatability and market dynamics.

## Overview

These examples demonstrate how to use the Faktory SDK with wallet integration, showing complete transaction lifecycle from parameter building to broadcasting.

## Setup

```bash
git clone https://github.com/FaktoryFun/test-sdk-examples.git
cd test-sdk-examples
npm install
```

Create a `.env` file:

```env
NETWORK=mainnet
STX_ADDRESS=your-stacks-address
TESTNET_STX_ADDRESS=your-testnet-address
MNEMONIC=your-mnemonic
```

## Network Configuration

The examples support both mainnet and testnet environments.

Example for testnet:

```typescript
const sdk = new FaktorySDK({
  network: "testnet",
});

// Use testnet addresses
const testToken = await sdk.createToken({
  creatorAddress: process.env.TESTNET_STX_ADDRESS!,
  targetAmm: "ST28MP1HQDJWQAFSQJN2HBAXBVP7H7THD1Y83JDEY", // Testnet AMM
  // ... other params
});
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
// test-buy.ts
const buyParams = await sdk.getBuyParams({
  dexContract: "SP000.token-dex",
  ustx: 100000,
  senderAddress: "SP000..."
});

// Sign and broadcast with your wallet
const tx = await makeContractCall(buyParams);
const signedTx = await wallet.signTransaction(tx);

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

## Create Token

### Create Token (Managed)

```typescript
// test-create.ts
// Shows how to:
// - Configure token parameters
// - Create new token and DEX
// test-create.ts - Faktory backend handles deployment
const response = await sdk.createToken({
  symbol: "TOKEN",
  name: "My Token",
  description: "A test token",
  supply: 69000000,
  targetStx: 1,
  creatorAddress: process.env.STX_ADDRESS!,
  initialBuyAmount: 0, // optional first buy
  targetAmm: "SP3DX9KDA8AMX5BHW5QJ68W39V7YHZE696PHXFR20" // Velar
});

npm run test-create
```

### Create Token (Manual Deployment)

```typescript
// test-create-manual.ts - You handle deployment
const params = await sdk.getTokenDeployParams({
  symbol: "TOKEN",
  name: "My Token",
  description: "A test token",
  supply: 69000000,
  targetStx: 1,
  creatorAddress: address,
  initialBuyAmount: 0.1, // 0.1 STX first buy
  targetAmm: "SP3DX9KDA8AMX5BHW5QJ68W39V7YHZE696PHXFR20",
});

// Deploy token contract (requires initialBuyAmount + 1 STX fee)
const totalStxNeeded = initialBuyAmount * 1_000_000 + 1_000_000;
const tokenTx = await makeContractDeploy({
  contractName: "my-token-faktory",
  codeBody: params.tokenCode,
  postConditions: [
    makeStandardSTXPostCondition(
      address,
      FungibleConditionCode.LessEqual,
      totalStxNeeded
    ),
  ],
  // ... other params
});

// Then deploy DEX contract (requires 1 STX fee)
const dexTx = await makeContractDeploy({
  contractName: "my-token-faktory-dex",
  codeBody: params.dexCode,
  // ... other params
});
```

### Verify LP Transfer to AMM (on bonding graduation)

```typescript
// test-verify.ts
// Shows how to:
// - Verify token transfers
// test-verify.ts - Check bonding curve graduation
const verification = await sdk.verifyTransfer("SP000.token");


npm run test-verify
```

## Running Tests

```typescript
npm run test-buy      # Test token buying
npm run test-sell     # Test token selling
npm run test-create   # Test managed token creation
npm run test-manual   # Test manual token creation
npm run test-verify   # Test transfer verification

npm run testnet-test-buy
npm run testnet-test-sell
npm run testnet-test-create
npm run testnet-test-manual
npm run testnet-test-verify

// dedicated to ai btc dev
npm run testnet-test-ai-create
npm run test-ai-create
```

## Other

npx ts-node fetch-holders.ts SP3E8B51MF5E28BD82FM95VDSQ71VK4KFNZX7ZK2R.frog-faktory::FROGGY

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

## Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

The user acknowledges that trading cryptocurrencies involves substantial risk and any trading decisions are made at their own risk. Past performance is not indicative of future results. This SDK is provided as a tool for interacting with smart contracts and should not be considered as financial advice.

```

```
