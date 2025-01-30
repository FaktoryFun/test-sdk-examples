// test-token-trades.ts
import { FaktorySDK } from "@faktoryfun/core-sdk";
import dotenv from "dotenv";

dotenv.config();

const sdk = new FaktorySDK({
  network: "mainnet",
});

async function testGetTokenTrades() {
  try {
    // Test with a known token contract
    const tokenContract =
      "SP2XCME6ED8RERGR9R7YDZW7CA6G3F113Y8JMVA46.nothing-faktory"; // Example token

    console.log("\nFetching token trades...");
    console.log(`Token Contract: ${tokenContract}`);

    const trades = await sdk.getTokenTrades(tokenContract);

    console.log("\nTrades Response:", JSON.stringify(trades, null, 2));

    if (trades.success && trades.data.length > 0) {
      // Print some stats about the trades
      console.log("\nTrade Statistics:");
      console.log(`Total trades fetched: ${trades.data.length}`);
      console.log(
        `Latest trade timestamp: ${new Date(
          trades.data[0].timestamp * 1000
        ).toISOString()}`
      );
      console.log(
        `Latest trade amount: ${trades.data[0].tokensAmount} tokens for ${
          trades.data[0].ustxAmount / 1000000
        } STX`
      );
    }
  } catch (error) {
    console.error("Error fetching token trades:", error);
  }
}

// Run the test
testGetTokenTrades();
