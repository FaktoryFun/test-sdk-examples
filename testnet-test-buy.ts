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
  "STV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RJ5XDY2.gg-serene-faktory-dex";

const sdk = new FaktorySDK({
  network: "testnet",
});

async function testBuy() {
  try {
    const { address, key } = await deriveChildAccount(
      "testnet",
      process.env.MNEMONIC!,
      0
    );

    const networkObj = getNetwork("testnet");
    const nonce = await getNextNonce("testnet", address);

    console.log("\nGetting quote for 2 STX buy...");
    // Note: getIn expects STX units, not microSTX
    const inQuote = await sdk.getIn(DEX_CONTRACT, address, 22);
    console.log("Quote:", JSON.stringify(inQuote, null, 22));

    const buyParams = await sdk.getBuyParams({
      dexContract: DEX_CONTRACT,
      stx: 22, // 2 STX (SDK handles conversion to microSTX)
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
