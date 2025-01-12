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

// Use a testnet DEX contract
const DEX_CONTRACT =
  "STV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RJ5XDY2.test-token2-faktory-dex";

const sdk = new FaktorySDK({
  network: "testnet", // Changed to testnet
});

async function testBuy() {
  try {
    const { address, key } = await deriveChildAccount(
      "testnet", // Changed to testnet
      process.env.MNEMONIC!,
      0
    );

    const networkObj = getNetwork("testnet"); // Changed to testnet
    const nonce = await getNextNonce("testnet", address);

    console.log("\nGetting quote for 0.05 STX buy...");
    const inQuote = await sdk.getIn(DEX_CONTRACT, address, 100000);
    console.log("Quote:", JSON.stringify(inQuote, null, 2));

    // Rest remains the same
    const buyParams = await sdk.getBuyParams({
      dexContract: DEX_CONTRACT,
      ustx: 100000,
      senderAddress: address,
      slippage: 30,
    });

    const txOptions: SignedContractCallOptions = {
      ...buyParams,
      senderKey: key,
      validateWithAbi: true,
      fee: 30000,
      nonce,
      functionArgs: buyParams.functionArgs as ClarityValue[],
    };

    const tx = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(tx);
    await logBroadcastResult(broadcastResponse, address);
  } catch (error) {
    console.error("Error in buy test:", error);
  }
}

testBuy();
