// test-x402-deploy.ts
import {
  withPaymentInterceptor,
  privateKeyToAccount,
  decodeXPaymentResponse,
} from "x402-stacks";
import axios, { AxiosInstance } from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_BASE_URL = "https://styxbtc.com/"; // or your local dev URL

interface DeployResponse {
  success: boolean;
  payment: {
    txId: string;
    amount: string;
    sender: string;
  };
  data: {
    tokenId: string;
    contracts: {
      prelaunch: {
        name: string;
        contract: string;
        txId: string;
      };
      token: {
        name: string;
        contract: string;
        txId: string;
        hash: string;
      };
      bonus: {
        name: string;
        contract: string;
        txId: string;
      };
      pool: {
        name: string;
        contract: string;
        txId: string;
      } | null;
      dex: {
        name: string;
        contract: string;
        txId: string;
        hash: string;
      };
    };
    tokenDetails: {
      name: string;
      symbol: string;
      supply: number;
      targetAmm: string;
      prelaunchMode: string;
      creator: string;
    };
  };
}

async function testX402Deploy() {
  try {
    // Step 1: Create account from private key
    console.log("1. Setting up account...");
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("PRIVATE_KEY not set in .env");
    }

    const account = privateKeyToAccount(privateKey, "mainnet");
    console.log(`   Account address: ${account.address}`);

    // Step 2: Create axios instance with x402 payment interceptor
    // Cast to any to avoid axios version mismatch issues
    console.log("2. Creating payment-enabled API client...");
    const baseAxios = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const api = withPaymentInterceptor(baseAxios as any, account);

    // Step 3: Make the deploy request
    console.log("3. Deploying memecoin via x402...");
    console.log("   This will cost 1 STX");

    const response = await api.post<DeployResponse>(
      "/api/aibtc-memes/deploy-x402",
      {
        symbol: "TESTX402",
        name: "Test x402 Token",
        description: "Agents deploying fakfun memes via x402 protocol",
        uri: "https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/tokens/60360b67-5f2e-4dfb-adc4-f8bf7c9aab85.json",
        logoUrl:
          "https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/tokens/60360b67-5f2e-4dfb-adc4-f8bf7c9aab85.png",
        targetAmm: "SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22", // Faktory
        prelaunchMode: "boardMembers",
        twitter: "https://x.com/historyinmemes/status/1783783324789416343",
        website: "https://x.com/historyinmemes/status/1783783324789416343",
        telegram: "https://x.com/historyinmemes/status/1783783324789416343",
        discord: "https://x.com/historyinmemes/status/1783783324789416343",
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
    console.log(
      `   Supply: ${result.data.tokenDetails.supply.toLocaleString()}`
    );
    console.log(`   Target AMM: ${result.data.tokenDetails.targetAmm}`);
    console.log(`   Prelaunch Mode: ${result.data.tokenDetails.prelaunchMode}`);

    console.log("\nContracts Deployed:");
    console.log(`   Prelaunch: ${result.data.contracts.prelaunch.contract}`);
    console.log(`   Token: ${result.data.contracts.token.contract}`);
    console.log(`   Bonus: ${result.data.contracts.bonus.contract}`);
    if (result.data.contracts.pool) {
      console.log(`   Pool: ${result.data.contracts.pool.contract}`);
    }
    console.log(`   DEX: ${result.data.contracts.dex.contract}`);

    console.log("\nTransaction IDs:");
    console.log(`   Prelaunch TX: ${result.data.contracts.prelaunch.txId}`);
    console.log(`   Token TX: ${result.data.contracts.token.txId}`);
    console.log(`   Bonus TX: ${result.data.contracts.bonus.txId}`);
    if (result.data.contracts.pool) {
      console.log(`   Pool TX: ${result.data.contracts.pool.txId}`);
    }
    console.log(`   DEX TX: ${result.data.contracts.dex.txId}`);

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

// Alternative: Manual flow (for understanding the protocol)
async function testX402DeployManual() {
  console.log("=== Manual x402 Flow (for learning) ===\n");

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set in .env");
  }

  // Step 1: Make request without payment
  console.log("1. Making initial request (will get 402)...");
  try {
    await axios.post(`${API_BASE_URL}/api/aibtc-memes/deploy-x402`, {
      symbol: "TEST",
      name: "Test Token",
      uri: "https://example.com/metadata.json",
    });
  } catch (error: any) {
    if (error.response?.status === 402) {
      console.log("   Got 402 Payment Required!");
      console.log(
        "   Payment details:",
        JSON.stringify(error.response.data, null, 2)
      );

      const paymentRequired = error.response.data;
      console.log(
        `\n   Amount: ${paymentRequired.maxAmountRequired} microSTX (${
          parseInt(paymentRequired.maxAmountRequired) / 1_000_000
        } STX)`
      );
      console.log(`   Pay to: ${paymentRequired.payTo}`);
      console.log(`   Network: ${paymentRequired.network}`);
      console.log(`   Expires: ${paymentRequired.expiresAt}`);

      console.log(
        "\n   To complete manually, you would sign a transaction and retry with X-PAYMENT header."
      );
      console.log(
        "   The withPaymentInterceptor() does all this automatically!"
      );
    } else {
      throw error;
    }
  }
}

// Run the test
console.log("🚀 x402 Memecoin Deploy Test\n");

// Choose which test to run
const testMode = process.argv[2] || "auto";

if (testMode === "manual") {
  testX402DeployManual();
} else {
  testX402Deploy();
}
