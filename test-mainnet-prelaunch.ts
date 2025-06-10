import {
  deriveChildAccount,
  getNetwork,
  getNextNonce,
  logBroadcastResult,
} from "./test-utils";

import dotenv from "dotenv";

dotenv.config();

async function testPreLaunchDeployment() {
  try {
    // Get account from mnemonic
    const { address, key } = await deriveChildAccount(
      "mainnet",
      process.env.MNEMONIC!,
      0
    );
    // Use a test address - this is the address that will be the token creator
    const testAddress = "SP7SX9AT5H41YGYRV8MACR1NESBYF6TRMC6P82DV";

    console.log("Using creator address:", testAddress);

    // Call pre-launch endpoint
    console.log("Calling pre-launch endpoint...");
    const response = await fetch(
      "https://faktory-be.vercel.app/api/aibtcdev/prelaunch",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.AIBTCDEV_API_KEY || "",
        },
        body: JSON.stringify({
          symbol: "testMASK9",
          name: "Pre-Launch Test",
          supply: 1000000000, // 1B tokens
          creatorAddress: address,
          originAddress: testAddress,
          description: "Test token for pre-launch functionality",
          tweetOrigin: "1883607431143723149", // add tweetOrigin parameter
          uri: "https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/tokens/60360b67-5f2e-4dfb-adc4-f8bf7c9aab85.json",
          // Optional fields:
          logoUrl:
            "https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/tokens/60360b67-5f2e-4dfb-adc4-f8bf7c9aab85.png",
          mediaUrl: "",
          twitter: "https://x.com/historyinmemes/status/1783783324789416343",
          website: "https://x.com/historyinmemes/status/1783783324789416343",
          telegram: "https://x.com/historyinmemes/status/1783783324789416343",
          discord: "https://x.com/historyinmemes/status/1783783324789416343",
        }),
      }
    );

    const result = await response.json();
    if (!result.success) {
      throw new Error(
        `Failed to get pre-launch contract: ${result.error?.message}`
      );
    }

    console.log("Pre-launch contract created successfully!");
    console.log("Contract details:");
    console.log("- Name:", result.data.contract.name);
    console.log("- Contract:", result.data.contract.contract);
    console.log("- Hash:", result.data.contract.hash);
    console.log("Token ID:", result.data.dbRecord.id);
    console.log("Transaction ID:", result.data.txId);

    console.log("\nTest complete!");
    console.log(
      "\nYou can now check the status manually in the database or blockchain explorer."
    );
    console.log(
      `Explorer link: https://explorer.stacks.co/txid/${result.data.txId}`
    );
  } catch (error) {
    console.error("Error in pre-launch deployment test:", error);
  }
}

testPreLaunchDeployment();
