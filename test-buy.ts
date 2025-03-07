// test-buy.ts
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

const DEX_CONTRACT =
  "STV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RJ5XDY2.okbtc4-faktory-dex";

const sdk = new FaktorySDK({
  network: "mainnet",
});

async function testBuy() {
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
    console.log("\nGetting quote for 0.05 STX buy...");
    const inQuote = await sdk.getIn(DEX_CONTRACT, address, 200000);
    console.log("Quote:", JSON.stringify(inQuote, null, 2));

    // Get transaction parameters
    console.log("\nGetting buy parameters...");
    const buyParams = await sdk.getBuyParams({
      dexContract: DEX_CONTRACT,
      stx: 200000, //  200k sats
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
    console.error("Error in buy test:", error);
  }
}

testBuy();
