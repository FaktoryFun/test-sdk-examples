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

const sdk = new FaktorySDK({
  API_HOST: process.env.FAK_API_URL || "https://faktory-be.vercel.app/api",
  API_KEY: process.env.FAK_API_KEY || "dev-api-token",
  defaultAddress: process.env.STX_ADDRESS!,
  network: (process.env.NETWORK || "testnet") as NetworkType,
});

async function testTokenCreation() {
  try {
    console.log("\nTesting token creation...");
    const tokenInput = {
      symbol: "WOOF",
      name: "Cat Pepe",
      description: "Much bush, such pepe",
      supply: 69000000,
      targetStx: 1,
      creatorAddress: process.env.STX_ADDRESS!,
      initialBuyAmount: 0,
      targetAmm: "SP2BN9JN4WEG02QYVX5Y21VMB2JWV3W0KNHPH9R4P",
      // Optional fields
      uri: "",
      logoUrl: "https://faktory.fun/drink-milkshake.gif",
      mediaUrl: "",
      twitter: "https://x.com/RaphaStacks",
      website: "https://x.com/RaphaStacks",
      telegram: "https://x.com/RaphaStacks",
      discord: "https://x.com/RaphaStacks",
    };

    console.log("Token Creation Parameters:", tokenInput);
    const createResponse = await sdk.createToken(tokenInput);
    console.log("\nToken Creation Result:", createResponse);

    if (createResponse.success) {
      const { tokenContract, dexContract } = createResponse.data[0];
      console.log("\nContract Addresses:");
      console.log("Token Contract:", tokenContract);
      console.log("DEX Contract:", dexContract);

      // Wait for deployment
      console.log("\nWaiting for contracts to deploy...");
      let deployed = false;
      let attempts = 0;
      const maxAttempts = 30;

      while (!deployed && attempts < maxAttempts) {
        attempts++;
        const status = await sdk.checkContractsDeployed(
          tokenContract,
          dexContract
        );
        console.log(`\nAttempt ${attempts}/${maxAttempts}:`, status);

        if (status.token && status.dex) {
          deployed = true;
          console.log("\nBoth contracts deployed successfully!");
          // Save these addresses for your buy/sell tests
          console.log("\nUse these addresses in your trading tests:");
          console.log(`Token Contract: ${tokenContract}`);
          console.log(`DEX Contract: ${dexContract}`);
          break;
        }

        console.log("Waiting 10 seconds before next check...");
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }

      if (!deployed) {
        console.log("\nDeployment timed out - check contract status manually");
      }
    }
  } catch (error) {
    console.error(
      "Error in test:",
      error instanceof Error ? error.message : error
    );
  }
}

testTokenCreation();
