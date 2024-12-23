// test-sell.ts
import { FaktorySDK, NetworkType } from "@faktory/core-sdk";
import dotenv from "dotenv";

dotenv.config();

console.log("\nEnvironment Configuration:");
console.log({
  NETWORK: process.env.NETWORK,
  STX_ADDRESS: process.env.STX_ADDRESS,
  FAK_API_URL: process.env.FAK_API_URL,
  HAS_MNEMONIC: !!process.env.MNEMONIC,
});

const DEX_CONTRACT =
  "SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.cat-pepe-faktory-dex";

const sdk = new FaktorySDK({
  API_HOST: process.env.FAK_API_URL || "https://faktory-be.vercel.app/api",
  API_KEY: process.env.FAK_API_KEY || "dev-api-token",
  defaultAddress: process.env.STX_ADDRESS!,
  network: (process.env.NETWORK || "testnet") as NetworkType,
});

async function testSell() {
  try {
    // Calculate amount with 6 decimals (from tokenInfo)
    const amount = 13601724 * Math.pow(10, 6); // 13,601,724 WOOF tokens

    console.log("\nGetting quote for selling 13,601,724 WOOF tokens...");
    const outQuote = await sdk.getOut(DEX_CONTRACT, amount);
    console.log("Quote:", JSON.stringify(outQuote, null, 2));

    console.log("\nExecuting sell of 13,601,724 WOOF tokens...");
    const sellResponse = await sdk.sell(
      DEX_CONTRACT,
      amount,
      30000, // gas fee
      0, // account index
      process.env.MNEMONIC!,
      20 // 20% slippage
    );
    console.log("Sell transaction:", JSON.stringify(sellResponse, null, 2));
  } catch (error) {
    console.error("Error in sell test:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
  }
}

testSell();
