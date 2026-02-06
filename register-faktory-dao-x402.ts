// register-faktory-dao-x402.ts
// Register the faktory-dao deploy endpoint with stx402.com registry
import { withPaymentInterceptor, privateKeyToAccount } from "x402-stacks";
import axios from "axios";
import dotenv from "dotenv";
import { deriveChildAccount } from "./test-utils";

dotenv.config();

async function registerEndpoint() {
  console.log("Registering faktory-dao x402 endpoint with stx402.com...\n");

  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) {
    throw new Error("MNEMONIC not set in .env");
  }

  const { address, key } = await deriveChildAccount("mainnet", mnemonic, 0);
  const account = privateKeyToAccount(key, "mainnet");
  console.log(`Payer address: ${address}`);

  const api = withPaymentInterceptor(
    axios.create({
      baseURL: "https://stx402.com",
      headers: { "Content-Type": "application/json" },
    }) as any,
    account
  );

  try {
    const response = await api.post("/registry/register", {
      url: "https://faktory-dao-be.vercel.app/api/aimemes/deploy-x402",
      name: "Faktory DAO Memecoin Deploy",
      description: "Deploy a memecoin on Stacks via x402 payment. Deploys prelaunch, token, bonus, pool, and DEX contracts with registration to faktory-core-v3. Costs 1 STX.",
      category: "defi",
      tags: ["memecoin", "token", "deploy", "faktory", "bonding-curve"],
    });

    console.log("\n✅ Registration successful!");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    if (error.response) {
      console.error("Error:", error.response.status, error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

registerEndpoint();
