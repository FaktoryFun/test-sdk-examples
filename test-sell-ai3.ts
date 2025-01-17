// test-sell-ai3.ts
import { FaktorySDK } from "@faktoryfun/core-sdk";
import {
  makeContractCall,
  broadcastTransaction,
  SignedContractCallOptions,
  ClarityValue,
} from "@stacks/transactions";
import {
  deriveChildAccount,
  getNetwork,
  getNextNonce,
  logBroadcastResult,
} from "./test-utils";
import dotenv from "dotenv";

dotenv.config();

const AI3_DEX_CONTRACT =
  "SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.ai3-faktory-dex";

const sdk = new FaktorySDK({
  network: "mainnet",
});

async function testSellAi3() {
  try {
    // Get account from mnemonic
    const { address, key } = await deriveChildAccount(
      "mainnet",
      process.env.MNEMONIC!,
      0
    );

    const networkObj = getNetwork("mainnet");
    const nonce = await getNextNonce("mainnet", address);

    const amount = 48987 * Math.pow(10, 6); // 48000 tokens with 6 decimals

    // Get quote first
    console.log("\nGetting quote for selling AI3 tokens...");
    const outQuote = await sdk.getOut(AI3_DEX_CONTRACT, address, amount);
    console.log("Quote:", JSON.stringify(outQuote, null, 2));

    // Get sell parameters
    console.log("\nGetting sell parameters for AI3...");
    const sellParams = await sdk.getSellParams({
      dexContract: AI3_DEX_CONTRACT,
      amount,
      senderAddress: address,
      slippage: 20,
    });

    // Add required properties for signing
    const txOptions: SignedContractCallOptions = {
      ...sellParams,
      senderKey: key,
      validateWithAbi: true,
      fee: 30000,
      nonce,
      functionArgs: sellParams.functionArgs as ClarityValue[],
    };

    // Make and broadcast transaction
    const tx = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(tx);
    await logBroadcastResult(broadcastResponse, address);
  } catch (error) {
    console.error("Error in AI3 sell test:", error);
  }
}

testSellAi3();
