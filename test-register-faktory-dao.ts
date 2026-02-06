// test-register-faktory-dao.ts
// Register already-deployed contracts with core-v3.
// Usage: ts-node test-register-faktory-dao.ts TOONY2 boardMembers
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_BASE_URL =
  process.env.FAKTORY_DAO_API_URL || "https://faktory-dao-be.vercel.app";
const API_KEY = process.env.FAKTORY_DAO_API_KEY;

async function registerContracts(symbol: string, prelaunchMode: string) {
  console.log(`\nRegistering ${symbol} with core-v3...`);
  console.log(`  API: ${API_BASE_URL}`);
  console.log(`  Prelaunch mode: ${prelaunchMode}\n`);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/aimemes/register`,
      { symbol, prelaunchMode },
      {
        headers: API_KEY ? { "x-api-key": API_KEY } : {},
      }
    );

    const result = response.data;

    if (result.success) {
      console.log("✅ Registration successful!\n");
      console.log(`  DEX TX: ${result.data.registrations.dex}`);
      console.log(`  Pool TX: ${result.data.registrations.pool}`);
      console.log(`  Creation height: ${result.data.creationHeight}`);
    } else {
      console.error("❌ Registration failed:", result.error);
      if (result.registrations) {
        console.log("  Partial results:");
        console.log(`    DEX: ${result.registrations.dex || "failed"}`);
        console.log(`    Pool: ${result.registrations.pool || "failed"}`);
      }
    }
  } catch (error: any) {
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

// Parse args
const symbol = process.argv[2];
const prelaunchMode = process.argv[3] || "boardMembers";

if (!symbol) {
  console.log("Usage: ts-node test-register-faktory-dao.ts <SYMBOL> [prelaunchMode]");
  console.log("  prelaunchMode: boardMembers (default) or helicopterPilots");
  console.log("\nExample: ts-node test-register-faktory-dao.ts TOONY2 boardMembers");
  process.exit(1);
}

registerContracts(symbol, prelaunchMode);
