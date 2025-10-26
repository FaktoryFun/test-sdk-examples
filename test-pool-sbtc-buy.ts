// test-pool-sbtc-buy.ts
import { FaktorySDK } from "@faktoryfun/core-sdk";
import {
  makeContractCall,
  broadcastTransaction,
  SignedContractCallOptions,
  ClarityValue,
  AnchorMode,
  PostConditionMode,
} from "@stacks/transactions";
import { StacksNetwork } from "@stacks/network";
import {
  deriveChildAccount,
  getNetwork,
  getNextNonce,
  logBroadcastResult,
} from "./test-utils";
import dotenv from "dotenv";

dotenv.config();

// Use the b-faktory-pool contract
const DEX_CONTRACT = "SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.b-faktory-pool";

const sdk = new FaktorySDK({
  network: "mainnet",
});

async function testPoolBuyWithSbtc() {
  try {
    // Get account from mnemonic
    const { address, key } = await deriveChildAccount(
      "mainnet",
      process.env.MNEMONIC!,
      0
    );

    const networkObj = getNetwork("mainnet");
    const nonce = await getNextNonce("mainnet", address);

    // Amount of sBTC to use for buying (0.00002 sBTC = 2,000 sats)
    const sbtcAmount = 0.00002;
    const satoshis = Math.floor(sbtcAmount * 100000000);

    console.log(
      `\nGetting quote for ${sbtcAmount} sBTC buy (${satoshis} sats)...`
    );
    const buyQuote = await sdk.getPoolBuyWithSbtcQuote({
      dexContract: DEX_CONTRACT,
      inAmount: sbtcAmount,
      senderAddress: address,
    });

    // Safe way to log objects with BigInt values
    const safeQuote = {
      dexContract: buyQuote.dexContract,
      inAmount: buyQuote.inAmount,
      estimatedOut: buyQuote.estimatedOut,
      tokenSymbol: buyQuote.tokenSymbol,
      tokenDecimals: buyQuote.tokenDecimals,
      // Omit raw to avoid BigInt serialization issues
    };
    console.log("Quote:", JSON.stringify(safeQuote, null, 2));

    // Get transaction parameters using the new pool function
    console.log("\nGetting buy parameters...");
    const buyParams = await sdk.getPoolBuyWithSbtcParams({
      dexContract: DEX_CONTRACT,
      inAmount: sbtcAmount,
      senderAddress: address,
      slippage: 15, // 15% slippage tolerance
    });

    // Log parameters safely without BigInt serialization issues
    console.log("Buy Parameters:", {
      contractAddress: buyParams.contractAddress,
      contractName: buyParams.contractName,
      functionName: buyParams.functionName,
      estimatedOut: buyParams.estimatedOut,
      minTokensOut: buyParams.minTokensOut,
      postConditionMode: buyParams.postConditionMode,
    });

    // Add required properties for signing without serializing
    const txOptions: SignedContractCallOptions = {
      contractAddress: buyParams.contractAddress,
      contractName: buyParams.contractName,
      functionName: buyParams.functionName,
      functionArgs: buyParams.functionArgs as any, // Type assertion without serialization
      senderKey: key,
      validateWithAbi: true,
      network: networkObj,
      anchorMode: buyParams.anchorMode as AnchorMode,
      postConditionMode: buyParams.postConditionMode as PostConditionMode,
      postConditions: buyParams.postConditions,
      fee: 30000,
      nonce,
    };

    // Make and broadcast transaction
    console.log("\nCreating and broadcasting transaction...");
    const tx = await makeContractCall(txOptions);
    console.log("Transaction created successfully");

    const broadcastResponse = await broadcastTransaction(tx);
    console.log("Transaction broadcast response:", broadcastResponse);

    await logBroadcastResult(broadcastResponse, address);
  } catch (error) {
    console.error("Error in sBTC pool buy test:", error);
    if (error instanceof Error) {
      console.error("Details:", error.message);

      // Log the stack trace, but split it into lines for better readability
      if (error.stack) {
        console.error("Stack trace:");
        error.stack.split("\n").forEach((line) => console.error("  " + line));
      }
    }
  }
}

// Run the test
testPoolBuyWithSbtc();
