// import { FaktorySDK, NetworkType } from "@faktory/core-sdk"; // Add NetworkType import
// import dotenv from "dotenv";

// dotenv.config();

// console.log("\nEnvironment Configuration:");
// console.log({
//   NETWORK: process.env.NETWORK,
//   STX_ADDRESS: process.env.STX_ADDRESS,
//   FAK_API_URL: process.env.FAK_API_URL,
//   HAS_MNEMONIC: !!process.env.MNEMONIC,
// });

// const sdk = new FaktorySDK({
//   API_HOST: process.env.FAK_API_URL || "https://faktory-be.vercel.app/api",
//   API_KEY: process.env.FAK_API_KEY || "dev-api-token",
//   defaultAddress: process.env.STX_ADDRESS!,
//   network: (process.env.NETWORK || "testnet") as NetworkType, // Cast to NetworkType
// });

// // test-trading.ts
// async function testTrading(dexContract: string) {
//   try {
//     // First verify contract exists
//     console.log("\nChecking if market is open...");
//     const isOpen = await sdk.getOpen(dexContract);
//     console.log("Market open:", isOpen);

//     if (isOpen) {
//       // Test buy
//       console.log("\nTesting buy...");
//       const buyResponse = await sdk.buy(
//         dexContract,
//         1100000,
//         10000,
//         0,
//         process.env.MNEMONIC!
//       );
//       console.log("Buy Result:", buyResponse);
//     }
//   } catch (error) {
//     console.error(
//       "Error in test:",
//       error instanceof Error ? error.message : error
//     );
//   }
// }
