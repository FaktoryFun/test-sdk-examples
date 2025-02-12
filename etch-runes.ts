import { Inscription } from "ordinalsbot";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get API key and receive address from environment variables
const API_KEY = process.env.ORDINALSBOT_API_KEY;
const RECEIVE_ADDRESS = process.env.RECEIVE_ADDRESS;

if (!API_KEY) {
  throw new Error("ORDINALSBOT_API_KEY environment variable is required");
}

if (!RECEIVE_ADDRESS) {
  throw new Error("RECEIVE_ADDRESS environment variable is required");
}

// Initialize the Inscription client
const inscription = new Inscription(API_KEY, "testnet");

// Configuration for etching 100% supply of a runes token
const runesEtchOrder = {
  files: [
    {
      name: "rune.txt", // Any supported file name
      size: 1, // Size in bytes
      type: "plain/text", // File type
      dataURL: "data:plain/text;base64,YQ==", // Just contains "a" in base64
    },
  ],
  turbo: true,
  rune: "FAKTORY•TOKEN",
  supply: 21000000, // 21m total supply
  symbol: "K",
  divisibility: 8,
  premine: 21000000, // 21m 100% premine
  fee: 510,
  receiveAddress: RECEIVE_ADDRESS,
};

/**
 * Main function to execute the runes etching order
 */
async function etchRunesToken() {
  try {
    console.log("Creating runes etching order...");
    const response = await inscription.createRunesEtchOrder(runesEtchOrder);

    console.log("Order created successfully:");
    console.log(JSON.stringify(response, null, 2));

    // Check if the response has an ID property
    if (response && typeof response === "object" && "id" in response) {
      console.log(`\nTracking order status for ID: ${response.id}`);
      const orderStatus = await inscription.getOrder(response.id);
      console.log("Current order status:", orderStatus);
    }
  } catch (error) {
    console.error("Error creating runes etching order:");
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      // Check if error has a status property
      if (typeof error === "object" && error !== null && "status" in error) {
        console.error("Status:", (error as { status: unknown }).status);
      }
    } else {
      console.error("Unknown error:", error);
    }
    throw error;
  }
}

// Execute the test
etchRunesToken().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
