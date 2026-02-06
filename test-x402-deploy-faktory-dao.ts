// test-x402-deploy-faktory-dao.ts
// Test script for the faktory-dao x402 deploy endpoint
import {
  withPaymentInterceptor,
  privateKeyToAccount,
  decodeXPaymentResponse,
} from "x402-stacks";
import axios from "axios";
import dotenv from "dotenv";
import { deriveChildAccount } from "./test-utils";

dotenv.config();

const API_BASE_URL = process.env.FAKTORY_DAO_API_URL || "https://faktory-dao-be.vercel.app";

interface DeployResponse {
  success: boolean;
  payment: {
    txId: string;
    amount: string;
    sender: string;
  };
  data: {
    tokenId: string;
    deployedContracts: Record<string, { contract: string; txId: string }>;
    registrations: {
      dex: string | null;
      pool: string | null;
    };
    tokenDetails: {
      name: string;
      symbol: string;
      supply: number;
      prelaunchMode: string;
      creator: string;
    };
    dbRecord: Record<string, unknown>;
  };
}

async function testX402DeployFaktoryDao() {
  try {
    // Step 1: Create account from mnemonic
    console.log("1. Setting up account...");
    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic) {
      throw new Error("MNEMONIC not set in .env");
    }

    const { address, key } = await deriveChildAccount("mainnet", mnemonic, 0);
    const account = privateKeyToAccount(key, "mainnet");
    console.log(`   Account address: ${address}`);

    // Step 2: Create axios instance with x402 payment interceptor
    console.log("2. Creating payment-enabled API client...");
    const baseAxios = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const api = withPaymentInterceptor(baseAxios as any, account);

    // Step 3: Make the deploy request
    console.log("3. Deploying memecoin via x402 on faktory-dao...");
    console.log("   This will cost 1 STX");

    const response = await api.post<DeployResponse>(
      "/api/aimemes/deploy-x402",
      {
        symbol: "TESTDAO",
        name: "Test DAO Token",
        description: "Agents deploying memes via x402 protocol on faktory-dao",
        uri: "https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/tokens/60360b67-5f2e-4dfb-adc4-f8bf7c9aab85.json",
        logoUrl:
          "https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/tokens/60360b67-5f2e-4dfb-adc4-f8bf7c9aab85.png",
        prelaunchMode: "boardMembers",
        twitter: "",
        website: "",
        telegram: "",
        discord: "",
      }
    );

    // Step 4: Check payment details from response header
    const paymentResponse = decodeXPaymentResponse(
      response.headers["x-payment-response"]
    );

    console.log("\n✅ Deployment successful!");
    console.log("=================================");

    if (paymentResponse) {
      console.log("Payment Details:");
      console.log(`   TX ID: ${paymentResponse.txId}`);
      console.log(`   Status: ${paymentResponse.status}`);
      console.log(`   Block: ${paymentResponse.blockHeight}`);
    }

    const result = response.data;
    console.log("\nToken Details:");
    console.log(`   Name: ${result.data.tokenDetails.name}`);
    console.log(`   Symbol: ${result.data.tokenDetails.symbol}`);
    console.log(`   Creator: ${result.data.tokenDetails.creator}`);
    console.log(`   Supply: ${result.data.tokenDetails.supply.toLocaleString()}`);
    console.log(`   Prelaunch Mode: ${result.data.tokenDetails.prelaunchMode}`);

    console.log("\nContracts Deployed:");
    for (const [name, info] of Object.entries(result.data.deployedContracts)) {
      console.log(`   ${name}: ${info.contract}`);
    }

    console.log("\nTransaction IDs:");
    for (const [name, info] of Object.entries(result.data.deployedContracts)) {
      console.log(`   ${name} TX: ${info.txId}`);
    }

    console.log("\nCore-v3 Registrations:");
    console.log(`   DEX: ${result.data.registrations.dex || "pending"}`);
    console.log(`   Pool: ${result.data.registrations.pool || "pending"}`);

    console.log("\n=================================");
    console.log(`Token ID in DB: ${result.data.tokenId}`);

    return result;
  } catch (error: any) {
    if (error.response?.status === 402) {
      console.error("Payment required but failed:", error.response.data);
    } else if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else {
      console.error("Error:", error.message);
    }
    throw error;
  }
}

// Show 402 response without paying (for learning)
async function testX402DeployManual() {
  console.log("=== Manual x402 Flow (faktory-dao) ===\n");

  console.log("1. Making initial request (will get 402)...");
  try {
    await axios.post(`${API_BASE_URL}/api/aimemes/deploy-x402`, {
      symbol: "TEST",
      name: "Test Token",
      uri: "https://example.com/metadata.json",
    });
  } catch (error: any) {
    if (error.response?.status === 402) {
      console.log("   Got 402 Payment Required!");
      console.log("   Payment details:", JSON.stringify(error.response.data, null, 2));

      const paymentRequired = error.response.data;
      console.log(
        `\n   Amount: ${paymentRequired.maxAmountRequired} microSTX (${
          parseInt(paymentRequired.maxAmountRequired) / 1_000_000
        } STX)`
      );
      console.log(`   Pay to: ${paymentRequired.payTo}`);
      console.log(`   Network: ${paymentRequired.network}`);
      console.log(`   Expires: ${paymentRequired.expiresAt}`);

      console.log("\n   To complete manually, sign a transaction and retry with X-PAYMENT header.");
      console.log("   The withPaymentInterceptor() does all this automatically!");
    } else {
      throw error;
    }
  }
}

// Run the test
console.log("🚀 x402 Memecoin Deploy Test (faktory-dao)\n");

const testMode = process.argv[2] || "auto";

if (testMode === "manual") {
  testX402DeployManual();
} else {
  testX402DeployFaktoryDao();
}
