import { FaktorySDK, NetworkType } from "@faktory/core-sdk"; // Add NetworkType import
import dotenv from "dotenv";

dotenv.config();

console.log("\nEnvironment Configuration:");
console.log({
  NETWORK: process.env.NETWORK,
  STX_ADDRESS: process.env.STX_ADDRESS,
  FAK_API_URL: process.env.FAK_API_URL,
  HAS_MNEMONIC: !!process.env.MNEMONIC,
});

const sdk = new FaktorySDK({
  API_HOST: process.env.FAK_API_URL || "https://faktory-be.vercel.app/api",
  API_KEY: process.env.FAK_API_KEY || "dev-api-token",
  defaultAddress: process.env.STX_ADDRESS!,
  network: (process.env.NETWORK || "testnet") as NetworkType, // Cast to NetworkType
});
// test-creation.ts
async function testTokenCreation() {
  try {
    console.log("\nTesting token creation...");
    const tokenInput = {
      symbol: "SEXYPEPE",
      name: "Sexy Pepe",
      description: "The sexiest Pepe you've ever seen",
      supply: 69000000,
      targetStx: 1,
      creatorAddress: process.env.STX_ADDRESS!,
      initialBuyAmount: 0,
      targetAmm: "SP2BN9JN4WEG02QYVX5Y21VMB2JWV3W0KNHPH9R4P",
    };

    console.log("Token Creation Parameters:", tokenInput);
    const createResponse = await sdk.createToken(tokenInput);
    console.log("\nToken Creation Result:", createResponse);

    // Save contract addresses for later use
    if (createResponse.success) {
      console.log("\nContract Addresses:");
      console.log("Token Contract:", createResponse.data[0].tokenContract);
      console.log("DEX Contract:", createResponse.data[0].dexContract);
      console.log("\nWaiting for contract deployment...");
      // Could add contract hash tracking here
    }
  } catch (error) {
    console.error(
      "Error in test:",
      error instanceof Error ? error.message : error
    );
  }
}

// test-trading.ts
async function testTrading(dexContract: string) {
  try {
    // First verify contract exists
    console.log("\nChecking if market is open...");
    const isOpen = await sdk.getOpen(dexContract);
    console.log("Market open:", isOpen);

    if (isOpen) {
      // Test buy
      console.log("\nTesting buy...");
      const buyResponse = await sdk.buy(
        dexContract,
        1100000,
        10000,
        0,
        process.env.MNEMONIC!
      );
      console.log("Buy Result:", buyResponse);
    }
  } catch (error) {
    console.error(
      "Error in test:",
      error instanceof Error ? error.message : error
    );
  }
}
