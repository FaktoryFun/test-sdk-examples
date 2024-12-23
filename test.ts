// import { FaktorySDK, NetworkType } from "@faktory/core-sdk";
// import dotenv from "dotenv";

// dotenv.config();

// console.log("\nEnvironment Configuration:");
// console.log({
//   NETWORK: process.env.NETWORK,
//   STX_ADDRESS: process.env.STX_ADDRESS,
//   FAK_API_URL: process.env.FAK_API_URL,
//   HAS_MNEMONIC: !!process.env.MNEMONIC,
// });

// const DEX_CONTRACT =
//   "SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.hashes-faktory-dex";

// const sdk = new FaktorySDK({
//   API_HOST: process.env.FAK_API_URL || "https://faktory-be.vercel.app/api",
//   API_KEY: process.env.FAK_API_KEY || "dev-api-token",
//   defaultAddress: process.env.STX_ADDRESS!,
//   network: (process.env.NETWORK || "testnet") as NetworkType,
// });

// async function testReadOnlyFunctions() {
//   try {
//     console.log("\n--- Testing Read-Only Functions ---");

//     // Test get-open
//     console.log("\nChecking if market is open...");
//     const isOpen = await sdk.getOpen(DEX_CONTRACT);
//     console.log(
//       "Market open response structure:",
//       JSON.stringify(isOpen, null, 2)
//     );

//     // Test get-in for 0.1 STX (100,000 microSTX)
//     console.log("\nTesting get-in for 0.1 STX...");
//     const inQuote = await sdk.getIn(DEX_CONTRACT, 100000);
//     console.log(
//       "Get-in quote complete response structure:",
//       JSON.stringify(inQuote, null, 2)
//     );

//     // Parse the response
//     const tokensOut = (inQuote as any).value.value["tokens-out"].value;
//     console.log("\nTokens out from get-in:", tokensOut);

//     // Test get-out with a smaller amount (1 token)
//     console.log(
//       "\nTesting get-out with 1000000 tokens (1 token assuming 6 decimals)..."
//     );
//     const outQuote = await sdk.getOut(DEX_CONTRACT, 1000000);
//     console.log("Get-out quote structure:", JSON.stringify(outQuote, null, 2));
//   } catch (error) {
//     console.error("Error in read-only tests:", error);
//   }
// }

// async function testTrading() {
//   try {
//     console.log("\n--- Testing Trading Functions ---");

//     // Get network and initial nonce
//     const networkObj = getNetwork(
//       (process.env.NETWORK as NetworkType) || "mainnet"
//     );
//     const initialNonce = await getNextNonce(
//       networkObj,
//       process.env.STX_ADDRESS!
//     );
//     console.log("Initial nonce:", initialNonce);

//     // Test buy with initial nonce
//     console.log("\nTesting buy with 0.1 STX...");
//     const buyResponse = await sdk.buy(
//       DEX_CONTRACT,
//       100000, // 0.1 STX
//       10000, // gas fee
//       0, // account index
//       process.env.MNEMONIC!,
//       20, // 20% slippage
//       initialNonce // Pass the nonce
//     );
//     console.log("Buy transaction:", JSON.stringify(buyResponse, null, 2));

//     // Test sell with incremented nonce
//     console.log("\nTesting sell with 1 token...");
//     const sellResponse = await sdk.sell(
//       DEX_CONTRACT,
//       1000000, // 1 token (assuming 6 decimals)
//       10000, // gas fee
//       0, // account index
//       process.env.MNEMONIC!,
//       20, // 20% slippage
//       initialNonce + 1 // Pass incremented nonce
//     );
//     console.log("Sell transaction:", JSON.stringify(sellResponse, null, 2));
//   } catch (error) {
//     console.error("Error in trading tests:", error);
//     if (error instanceof Error) {
//       console.error("Error details:", {
//         message: error.message,
//         stack: error.stack,
//       });
//     }
//   }
// }

// async function runAllTests() {
//   await testReadOnlyFunctions();
//   console.log("\nStarting trading tests...");
//   await testTrading();
// }

// runAllTests();
