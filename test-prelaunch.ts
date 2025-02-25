import dotenv from "dotenv";

dotenv.config();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function testPreLaunchDeployment() {
  try {
    // Use a test address - this is the address that will be the token creator
    const testAddress = "ST1JAG6TV2XRYFGJN7CAAN6Z3CEW2YMZWMKWG4PBM"; // "SP000000000000000000002Q6VF78"; // Replace with your test address

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
          symbol: "HOW",
          name: "Pre-Launch Test",
          supply: 1000000000, // 1B tokens
          creatorAddress: testAddress,
          originAddress: testAddress,
          uri: "https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/tokens/prelaunch-test.json",
          // Optional fields:
          logoUrl:
            "https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/tokens/prelaunch-test.png",
          twitter: "https://x.com/faktory_fun",
          website: "https://faktory.fun",
          telegram: "https://t.me/faktory_fun",
          discord: "https://discord.gg/faktory",
          description: "Test token for pre-launch functionality",
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

    // Let's verify the contract was deployed successfully
    console.log("\nWaiting for deployment to be confirmed...");

    // Wait for 60 seconds for the transaction to be confirmed and processed by chainhooks
    console.log("Waiting 60 seconds for transaction to confirm...");
    await delay(60000);

    // Check verification status
    console.log("Checking verification status...");
    const verifyResponse = await fetch(
      `https://faktory-be.vercel.app/api/aibtcdev/prelaunch/${result.data.dbRecord.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const verifyResult = await verifyResponse.json();
    console.log("Verification status:", verifyResult.data?.status);
    console.log(
      "Pre-verified:",
      verifyResult.data?.preVerified === 1 ? "Yes" : "No"
    );

    // Manually trigger verification if needed (optional)
    if (process.env.VERIFY_MANUALLY === "true") {
      console.log("\nManually triggering verification...");
      const manualVerifyResponse = await fetch(
        "https://faktory-be.vercel.app/api/aibtcdev/verify-prelaunch",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.AIBTCDEV_API_KEY || "",
          },
          body: JSON.stringify({
            id: result.data.dbRecord.id,
          }),
        }
      );

      const manualVerifyResult = await manualVerifyResponse.json();
      console.log("Manual verification result:", manualVerifyResult);
    }

    console.log("\nTest complete!");
  } catch (error) {
    console.error("Error in pre-launch deployment test:", error);
  }
}

testPreLaunchDeployment();
