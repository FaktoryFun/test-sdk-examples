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

async function testBuy() {
  try {
    // First get quote to see expected output
    console.log("\nGetting quote for 0.05 STX buy...");
    const inQuote = await sdk.getIn(DEX_CONTRACT, 100000);
    console.log("Quote:", JSON.stringify(inQuote, null, 2));

    // Execute buy
    console.log("\nExecuting buy of 0.05 STX...");
    const buyResponse = await sdk.buy(
      DEX_CONTRACT,
      100000, // 0.05 STX
      30000, // Higher gas fee
      0, // account index
      process.env.MNEMONIC!,
      30 // 30% slippage
    );
    console.log("Buy transaction:", JSON.stringify(buyResponse, null, 2));
  } catch (error) {
    console.error("Error in buy test:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
      const anyError = error as any;
      if (anyError.response) {
        console.error("Response data:", anyError.response?.data);
        console.error("Response status:", anyError.response?.status);
      }
    }
  }
}

testBuy();
