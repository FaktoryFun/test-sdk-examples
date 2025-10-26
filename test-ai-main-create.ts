import {
  makeContractDeploy,
  broadcastTransaction,
  PostConditionMode,
  AnchorMode,
} from "@stacks/transactions";
import {
  deriveChildAccount,
  getNetwork,
  getNextNonce,
  logBroadcastResult,
} from "./test-utils";
import dotenv from "dotenv";

// Updated type definition for consolidated response
interface GenerateResponse {
  success: boolean;
  data: {
    contracts: {
      prelaunch: {
        name: string;
        code: string;
        hash: string;
        contract: string;
      };
      token: {
        name: string;
        code: string;
        hash: string;
        contract: string;
      };
      dex: {
        name: string;
        code: string;
        hash: string;
        contract: string;
      };
      pool: {
        name: string;
        code: string;
        contract: string;
      };
    };
    dbRecord: any;
  };
  error?: { message: string };
}

dotenv.config();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function mainnetAIBTCDevDeployment() {
  try {
    // Get account from mnemonic - using mainnet
    const { address, key } = await deriveChildAccount(
      "mainnet",
      process.env.MNEMONIC!,
      0
    );

    // Step 1: Generate all contracts (prelaunch, token, dex, pool) in one call
    console.log("1. Getting all contracts from AI BTC Dev endpoint...");
    const response = await fetch(
      "https://faktory-be.vercel.app/api/aibtcdev/generate", // Mainnet endpoint
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.AIBTCDEV_API_KEY || "",
        },
        body: JSON.stringify({
          symbol: "GRANUI1",
          name: "ai sbtc",
          supply: 1000000000,
          creatorAddress: address,
          originAddress: "SP3N41Z9P8E9BM715R6V6189R3RK6FVVXWAGNP8P6", // Example mainnet address
          tweetOrigin: "1883607431143723149",
          uri: "https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/tokens/60360b67-5f2e-4dfb-adc4-f8bf7c9aab85.json",
          // Optional fields:
          logoUrl:
            "https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/tokens/60360b67-5f2e-4dfb-adc4-f8bf7c9aab85.png",
          mediaUrl: "",
          twitter: "https://x.com/historyinmemes/status/1783783324789416343",
          website: "https://x.com/historyinmemes/status/1783783324789416343",
          telegram: "https://x.com/historyinmemes/status/1783783324789416343",
          discord: "https://x.com/historyinmemes/status/1783783324789416343",
          description: "totally with you David. Love you. RIP < 3",
        }),
      }
    );

    const result = (await response.json()) as GenerateResponse;
    if (!result.success) {
      throw new Error(`Failed to get contracts: ${result.error?.message}`);
    }

    const { prelaunch, token, dex, pool } = result.data.contracts;

    // Setup network and nonce - using mainnet
    const networkObj = getNetwork("mainnet");
    const nonce = await getNextNonce("mainnet", address);

    // Step 2: Deploy Prelaunch Contract
    console.log("2. Deploying prelaunch contract...");
    const prelaunchDeployTx = await makeContractDeploy({
      contractName: prelaunch.name,
      codeBody: prelaunch.code,
      senderKey: key,
      network: networkObj,
      postConditionMode: PostConditionMode.Allow,
      nonce,
      fee: 30000, // Increased fee for mainnet
      anchorMode: AnchorMode.Any,
    });

    const prelaunchBroadcastResponse = await broadcastTransaction(
      prelaunchDeployTx
    );
    await logBroadcastResult(prelaunchBroadcastResponse, address);
    console.log(`Prelaunch contract deployed: ${prelaunch.contract}`);

    // Wait longer for mainnet confirmation
    console.log("Waiting 30 seconds for prelaunch to confirm...");
    await delay(10000);

    // Step 3: Deploy Token
    console.log("3. Deploying token contract...");
    const tokenTx = await makeContractDeploy({
      contractName: token.name,
      codeBody: token.code,
      senderKey: key,
      network: networkObj,
      postConditionMode: PostConditionMode.Allow,
      nonce: nonce + 1,
      fee: 30000, // Increased fee for mainnet
      anchorMode: AnchorMode.Any,
    });

    const tokenBroadcastResponse = await broadcastTransaction(tokenTx);
    await logBroadcastResult(tokenBroadcastResponse, address);
    console.log(`Token Contract: ${token.contract}`);

    // Wait longer for mainnet confirmation
    console.log("Waiting 30 seconds before deploying pool...");
    await delay(10000);

    // Step 4: Deploy Pool
    console.log("4. Deploying pool contract...");
    const poolTx = await makeContractDeploy({
      contractName: pool.name,
      codeBody: pool.code,
      senderKey: key,
      network: networkObj,
      postConditionMode: PostConditionMode.Allow,
      nonce: nonce + 2,
      fee: 30000, // Increased fee for mainnet
      anchorMode: AnchorMode.Any,
    });

    const poolBroadcastResponse = await broadcastTransaction(poolTx);
    await logBroadcastResult(poolBroadcastResponse, address);
    console.log(`Pool Contract: ${pool.contract}`);

    // Wait longer for mainnet confirmation
    console.log("Waiting 30 seconds before deploying DEX...");
    await delay(10000);

    // Step 5: Deploy DEX
    console.log("5. Deploying DEX contract...");
    const dexTx = await makeContractDeploy({
      contractName: dex.name,
      codeBody: dex.code,
      senderKey: key,
      network: networkObj,
      postConditionMode: PostConditionMode.Allow,
      nonce: nonce + 3,
      fee: 30000, // Increased fee for mainnet
      anchorMode: AnchorMode.Any,
    });

    const dexBroadcastResponse = await broadcastTransaction(dexTx);
    await logBroadcastResult(dexBroadcastResponse, address);
    console.log(`DEX Contract: ${dex.contract}`);

    console.log("\n🎉 All mainnet deployments complete!");
    console.log("=================================");
    console.log("Prelaunch Contract:", prelaunch.contract);
    console.log("Token Contract:", token.contract);
    console.log("Pool Contract:", pool.contract);
    console.log("DEX Contract:", dex.contract);
    console.log("=================================");
  } catch (error) {
    console.error("Error in mainnet AI BTC Dev deployment:", error);
  }
}

mainnetAIBTCDevDeployment();
