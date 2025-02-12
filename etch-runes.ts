import { Inscription } from "ordinalsbot";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get API key from environment variable
const API_KEY = process.env.ORDINALSBOT_API_KEY;

if (!API_KEY) {
  throw new Error("ORDINALSBOT_API_KEY environment variable is required");
}

// Initialize the Inscription client
// Using testnet for safety - switch to "mainnet" for production
const inscription = new Inscription(API_KEY, "testnet");

// Configuration for etching 100% supply of a runes token
const runesEtchOrder = {
  files: [
    {
      size: 10,
      type: "plain/text",
      name: "runes-token-etch.txt",
      // Base64 encoded content for the inscription
      dataURL: "data:plain/text;base64,UnVuZXMgVG9rZW4gRXRjaA==",
    },
  ],
  turbo: true, // Enable turbo mode for faster processing
  rune: "FAKTORY•TOKEN", // 13 character limit for rune name (really?)
  supply: 1000000, // Total supply of 1 million tokens
  symbol: "FAK", // Token symbol
  premine: 1000000, // Mint 100% supply immediately
  divisibility: 8, // Number of decimal places (similar to Bitcoin)
  fee: 510, // Transaction fee in sats
  receiveAddress: process.env.RECEIVE_ADDRESS, // Address to receive the minted tokens
  terms: {
    amount: 1,
    cap: 1000000, // Match the total supply
    height: {
      // Set block height range for minting
      // These should be adjusted based on current testnet height
      start: 2500000,
      end: 2600000,
    },
  },
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

    // You can now track the order status using the returned order ID
    if (response.orderId) {
      console.log(`\nTracking order status for ID: ${response.orderId}`);
      const orderStatus = await inscription.getOrder(response.orderId);
      console.log("Current order status:", orderStatus.status);
    }
  } catch (error) {
    console.error("Error creating runes etching order:");
    console.error(`Status: ${error.status} | Message: ${error.message}`);
    throw error;
  }
}

// Execute the test
etchRunesToken().catch(console.error);
