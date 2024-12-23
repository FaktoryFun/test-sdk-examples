// test-create.ts
import { FaktorySDK } from "@faktoryfun/core-sdk";
import dotenv from "dotenv";

dotenv.config();

const sdk = new FaktorySDK({
  network: "mainnet",
});

async function testTokenCreation() {
  try {
    const tokenInput = {
      symbol: "miaou",
      name: "Pepe Magic",
      description: "Much bush, such pepe",
      supply: 69000000,
      targetStx: 1,
      creatorAddress: process.env.STX_ADDRESS!,
      initialBuyAmount: 0,
      targetAmm: "SP2BN9JN4WEG02QYVX5Y21VMB2JWV3W0KNHPH9R4P",
      uri: "",
      logoUrl: "https://faktory.fun/drink-milkshake.gif",
      mediaUrl: "",
      twitter: "https://x.com/RaphaStacks",
      website: "https://x.com/RaphaStacks",
      telegram: "https://x.com/RaphaStacks",
      discord: "https://x.com/RaphaStacks",
    };

    const createResponse = await sdk.createToken(tokenInput);
    console.log("Token Creation Result:", createResponse);
  } catch (error) {
    console.error("Error in token creation:", error);
  }
}

testTokenCreation();
