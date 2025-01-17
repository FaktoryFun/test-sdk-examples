// test-dao-tokens.ts
import { FaktorySDK } from "@faktoryfun/core-sdk";
import dotenv from "dotenv";

dotenv.config();

const sdk = new FaktorySDK({
  network: "mainnet",
});

async function testGetDaoTokens() {
  try {
    console.log("\nFetching DAO tokens...");
    const daoTokens = await sdk.getDaoTokens({
      limit: 10, // Adjust limit as needed
      sortOrder: "desc", // Or "asc" depending on your needs
    });

    console.log("DAO Tokens Response:", JSON.stringify(daoTokens, null, 2));

    // Also test the daoOnly parameter in getVerifiedTokens
    console.log("\nTesting getVerifiedTokens with daoOnly parameter...");
    const verifiedDaoTokens = await sdk.getVerifiedTokens({
      daoOnly: true,
      limit: 10,
    });

    console.log(
      "Verified DAO Tokens Response:",
      JSON.stringify(verifiedDaoTokens, null, 2)
    );
  } catch (error) {
    console.error("Error fetching DAO tokens:", error);
  }
}

testGetDaoTokens();
