// test-buy-ai3.ts
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

async function testBuyAi3() {
  try {
    // Get account from mnemonic
    const { address, key } = await deriveChildAccount(
      "mainnet",
      process.env.MNEMONIC!,
      0
    );

    const networkObj = getNetwork("mainnet");
    const nonce = await getNextNonce("mainnet", address);

    // Get quote first
    console.log("\nGetting quote for 0.1 STX buy from AI3 DEX...");
    const inQuote = await sdk.getIn(AI3_DEX_CONTRACT, address, 100000);
    console.log("Quote:", JSON.stringify(inQuote, null, 2));

    // Get transaction parameters
    console.log("\nGetting buy parameters for AI3...");
    const buyParams = await sdk.getBuyParams({
      dexContract: AI3_DEX_CONTRACT,
      ustx: 100000, // 0.1 STX
      senderAddress: address,
      slippage: 30,
    });

    // Add required properties for signing
    const txOptions: SignedContractCallOptions = {
      ...buyParams,
      senderKey: key,
      validateWithAbi: true,
      fee: 30000,
      nonce,
      functionArgs: buyParams.functionArgs as ClarityValue[],
    };

    // Make and broadcast transaction
    const tx = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(tx);
    await logBroadcastResult(broadcastResponse, address);
  } catch (error) {
    console.error("Error in AI3 buy test:", error);
  }
}

testBuyAi3();
