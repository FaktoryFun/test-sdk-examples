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

interface PoolResponse {
  success: boolean;
  data: {
    pool: {
      name: string;
      code: string;
      contract: string;
    };
  };
  error?: { message: string };
}

dotenv.config();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function testAIBTCDevDeployment() {
  try {
    // Get account from mnemonic
    const { address, key } = await deriveChildAccount(
      "testnet",
      process.env.MNEMONIC!,
      0
    );

    // Step 1: Generate all contracts (prelaunch, token, dex, pool) in one call
    console.log("1. Getting all contracts from AI BTC Dev endpoint...");
    const response = await fetch(
      "https://faktory-testnet-be.vercel.app/api/aibtcdev/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.AIBTCDEV_API_KEY || "",
        },
        body: JSON.stringify({
          symbol: "VISVASA1",
          name: "ai sbtc",
          supply: 1000000000,
          creatorAddress: address,
          originAddress: "STV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RJ5XDY2",
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

    // Step 2: Get pool contract - NO LONGER NEEDED!
    // console.log("2. Getting pool contract...");
    // const poolResponse = await fetch(...)
    // Pool is now included in the main response above!

    // Setup network and nonce
    const networkObj = getNetwork("testnet");
    const nonce = await getNextNonce("testnet", address);

    // Step 3: Deploy Prelaunch Contract
    console.log("3. Deploying prelaunch contract...");
    const prelaunchDeployTx = await makeContractDeploy({
      contractName: prelaunch.name,
      codeBody: prelaunch.code,
      senderKey: key,
      network: networkObj,
      postConditionMode: PostConditionMode.Allow,
      nonce,
      fee: 30000,
      anchorMode: AnchorMode.Any,
    });

    const prelaunchBroadcastResponse = await broadcastTransaction(
      prelaunchDeployTx
    );
    await logBroadcastResult(prelaunchBroadcastResponse, address);
    console.log(`Prelaunch contract deployed: ${prelaunch.contract}`);

    // Wait for prelaunch to be mined
    console.log("Waiting 10 seconds for prelaunch to confirm...");
    await delay(10000);

    // Step 4: Deploy Token
    console.log("4. Deploying token contract...");
    const tokenTx = await makeContractDeploy({
      contractName: token.name,
      codeBody: token.code,
      senderKey: key,
      network: networkObj,
      postConditionMode: PostConditionMode.Allow,
      nonce: nonce + 1,
      fee: 30000,
      anchorMode: AnchorMode.Any,
    });

    const tokenBroadcastResponse = await broadcastTransaction(tokenTx);
    await logBroadcastResult(tokenBroadcastResponse, address);
    console.log(`Token Contract: ${token.contract}`);

    // Wait 10 seconds
    console.log("Waiting 10 seconds before deploying pool...");
    await delay(10000);

    // Step 5: Deploy Pool
    console.log("5. Deploying pool contract...");
    const poolTx = await makeContractDeploy({
      contractName: pool.name,
      codeBody: pool.code,
      senderKey: key,
      network: networkObj,
      postConditionMode: PostConditionMode.Allow,
      nonce: nonce + 2,
      fee: 30000,
      anchorMode: AnchorMode.Any,
    });

    const poolBroadcastResponse = await broadcastTransaction(poolTx);
    await logBroadcastResult(poolBroadcastResponse, address);
    console.log(`Pool Contract: ${pool.contract}`);

    // Wait 10 seconds
    console.log("Waiting 10 seconds before deploying DEX...");
    await delay(10000);

    // Step 6: Deploy DEX
    console.log("6. Deploying DEX contract...");
    const dexTx = await makeContractDeploy({
      contractName: dex.name,
      codeBody: dex.code,
      senderKey: key,
      network: networkObj,
      postConditionMode: PostConditionMode.Allow,
      nonce: nonce + 3,
      fee: 30000,
      anchorMode: AnchorMode.Any,
    });

    const dexBroadcastResponse = await broadcastTransaction(dexTx);
    await logBroadcastResult(dexBroadcastResponse, address);
    console.log(`DEX Contract: ${dex.contract}`);

    console.log("\n🎉 All deployments complete!");
    console.log("=================================");
    console.log("Prelaunch Contract:", prelaunch.contract);
    console.log("Token Contract:", token.contract);
    console.log("Pool Contract:", pool.contract);
    console.log("DEX Contract:", dex.contract);
    console.log("=================================");
  } catch (error) {
    console.error("Error in AI BTC Dev deployment:", error);
  }
}

testAIBTCDevDeployment();
