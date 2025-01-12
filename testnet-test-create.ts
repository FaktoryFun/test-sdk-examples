// test-create.ts
import { FaktorySDK } from "@faktoryfun/core-sdk";
import dotenv from "dotenv";

dotenv.config();

const sdk = new FaktorySDK({
  network: "testnet",
});

async function testTokenCreation() {
  try {
    const tokenInput = {
      symbol: "last",
      name: "test token",
      description: "bet last and heavy",
      supply: 69000000,
      targetStx: 1,
      creatorAddress: process.env.TESTNET_STX_ADDRESS!,
      initialBuyAmount: 0,
      targetAmm: "ST28MP1HQDJWQAFSQJN2HBAXBVP7H7THD1Y83JDEY",
      uri: "",
      logoUrl: "https://faktory.fun/drink-milkshake.gif",
      mediaUrl: "",
      twitter: "https://x.com/RaphaStacks",
      website: "https://x.com/RaphaStacks",
      telegram: "https://x.com/RaphaStacks",
      discord: "https://x.com/RaphaStacks",
    };

    console.log("Sending token input:", JSON.stringify(tokenInput, null, 2));
    const createResponse = await sdk.createToken(tokenInput);
    console.log("Token Creation Result:", createResponse);
  } catch (error) {
    console.error("Error in token creation:", error);
  }
}

testTokenCreation();
