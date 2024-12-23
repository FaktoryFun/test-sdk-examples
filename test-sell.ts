// test-sell.ts
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
  "SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.cat-pepe-faktory-dex";

const sdk = new FaktorySDK({
  network: "mainnet",
});

async function testSell() {
  try {
    // Get account from mnemonic
    const { address, key } = await deriveChildAccount(
      "mainnet",
      process.env.MNEMONIC!,
      0
    );

    const networkObj = getNetwork("mainnet");
    const nonce = await getNextNonce("mainnet", address);

    const amount = 4000000 * Math.pow(10, 6);

    // Get quote first
    console.log("\nGetting quote for selling tokens...");
    const outQuote = await sdk.getOut(DEX_CONTRACT, address, amount);
    console.log("Quote:", JSON.stringify(outQuote, null, 2));

    // Get sell parameters
    const sellParams = await sdk.getSellParams({
      dexContract: DEX_CONTRACT,
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
    console.error("Error in sell test:", error);
  }
}

testSell();
