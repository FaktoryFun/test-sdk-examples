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
  "STV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RJ5XDY2.test-token-faktory-dex";

const sdk = new FaktorySDK({
  network: "testnet",
});

async function testSell() {
  try {
    const { address, key } = await deriveChildAccount(
      "testnet",
      process.env.MNEMONIC!,
      0
    );

    const networkObj = getNetwork("testnet");
    const nonce = await getNextNonce("testnet", address);

    const amount = 4000000 * Math.pow(10, 6);

    // Rest remains the same with testnet contract
    console.log("\nGetting quote for selling tokens...");
    const outQuote = await sdk.getOut(DEX_CONTRACT, address, amount);
    console.log("Quote:", JSON.stringify(outQuote, null, 2));

    const sellParams = await sdk.getSellParams({
      dexContract: DEX_CONTRACT,
      amount,
      senderAddress: address,
      slippage: 20,
    });

    const txOptions: SignedContractCallOptions = {
      ...sellParams,
      senderKey: key,
      validateWithAbi: true,
      fee: 30000,
      nonce,
      functionArgs: sellParams.functionArgs as ClarityValue[],
    };

    const tx = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(tx);
    await logBroadcastResult(broadcastResponse, address);
  } catch (error) {
    console.error("Error in sell test:", error);
  }
}

testSell();
