import dotenv from "dotenv";
import { deriveChildAccount, getNetwork } from "./test-utils"; // Adjust the import to your file structure

dotenv.config();

/**
 * Deploys a complete DAO with all 20 contracts and constructs it
 */
async function deployDAO() {
  try {
    // Load environment variables
    const apiKey = process.env.AIBTCDEV_API_KEY;
    if (!apiKey) {
      throw new Error("AIBTCDEV_API_KEY environment variable is not set");
    }

    // Get account information (adjust according to your needs)
    const { address } = await deriveChildAccount(
      "testnet",
      process.env.MNEMONIC!,
      0
    );

    // Prepare request payload
    const payload = {
      symbol: "DBTC7", // The token symbol
      tokenName: "Demo DAO Token", // The token name
      tokenMaxSupply: 1000000000, // Max supply (1 billion)
      tokenUri: "https://aibtc.dev",
      logoUrl: "https://aibtc.dev/logo.png",
      originAddress: address, // The address that will receive tokens
      daoManifest: "This is a test DAO for demonstration purposes",
      daoManifestInscriptionId: "inscription-123456", // Replace with real inscription ID if needed
      tweetOrigin: "123456789", // Optional tweet ID for reference
    };

    console.log("Deploying DAO with parameters:", payload);
    console.log("Using origin address:", address);

    // Make API request to deploy the DAO
    const response = await fetch(
      "https://faktory-testnet-be.vercel.app/api/aibtcdev/deploy-construct",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(payload),
      }
    );

    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API request failed with status ${response.status}: ${errorText}`
      );
    }

    // Parse and display the result
    const result = await response.json();

    if (result.success) {
      console.log("DAO deployment successful!");
      console.log(
        "Deployment result:",
        JSON.stringify(result.deployment, null, 2)
      );
      console.log(
        "Construction result:",
        JSON.stringify(result.construction, null, 2)
      );

      // Log important contract addresses
      const deployerAddress = result.deployment?.deployerAddress || address;
      console.log("\nDeployed DAO Contracts:");
      console.log(
        `Base DAO Contract: ${deployerAddress}.${payload.symbol.toLowerCase()}-base-dao`
      );
      console.log(
        `Token Contract: ${deployerAddress}.${payload.symbol.toLowerCase()}-faktory`
      );
      console.log(
        `DEX Contract: ${deployerAddress}.${payload.symbol.toLowerCase()}-faktory-dex`
      );

      return result;
    } else {
      throw new Error(`DAO deployment failed: ${result.error}`);
    }
  } catch (error) {
    console.error("Error deploying DAO:", error);
    throw error;
  }
}

// Execute the function if running directly
if (require.main === module) {
  deployDAO()
    .then(() => {
      console.log("Deployment script completed successfully.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Deployment script failed:", error);
      process.exit(1);
    });
}

// Export the function for use in other modules
export default deployDAO;
