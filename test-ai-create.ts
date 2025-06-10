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

// Type definitions for API responses
interface PrelaunchResponse {
  success: boolean;
  data: {
    contract: {
      name: string;
      code: string;
      hash: string;
      contract: string;
    };
    txId: string;
    dbRecord: any;
  };
  error?: { message: string };
}

interface GenerateResponse {
  success: boolean;
  data: {
    contracts: {
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

    // Step 0: Create prelaunch contract
    console.log("0. Creating prelaunch contract...");
    const prelaunchResponse = await fetch(
      "https://faktory-testnet-be.vercel.app/api/aibtcdev/prelaunch",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.AIBTCDEV_API_KEY || "",
        },
        body: JSON.stringify({
          symbol: "SIMPLE18",
          name: "ai sbtc",
          supply: 1000000000, // cannot exceed 1B (1B is allowed)
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

    const prelaunchResult =
      (await prelaunchResponse.json()) as PrelaunchResponse;
    if (!prelaunchResult.success) {
      throw new Error(
        `Failed to create prelaunch: ${prelaunchResult.error?.message}`
      );
    }

    console.log("Prelaunch contract created successfully!");
    console.log("Prelaunch Contract:", prelaunchResult.data.contract.contract);
    console.log("Prelaunch TX ID:", prelaunchResult.data.txId);

    // Wait for prelaunch to be mined
    console.log("Waiting 10 seconds for prelaunch to confirm...");
    await delay(10000);

    // Step 1: Generate token and dex contracts
    console.log("1. Getting contracts from AI BTC Dev endpoint...");
    const response = await fetch(
      "https://faktory-testnet-be.vercel.app/api/aibtcdev/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.AIBTCDEV_API_KEY || "",
        },
        body: JSON.stringify({
          symbol: "SIMPLE18",
          name: "ai sbtc",
          supply: 1000000000, // cannot exceed 1B (1B is allowed)
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

    const { token, dex } = result.data.contracts;

    // Step 2: Get pool contract
    console.log("2. Getting pool contract...");
    const poolResponse = await fetch(
      "https://faktory-testnet-be.vercel.app/api/aibtcdev/generate-pool",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.AIBTCDEV_API_KEY || "",
        },
        body: JSON.stringify({
          tokenContract: token.contract,
          dexContract: dex.contract,
          senderAddress: address,
          symbol: "SIMPLE18",
        }),
      }
    );

    const poolResult = (await poolResponse.json()) as PoolResponse;
    if (!poolResult.success) {
      throw new Error(
        `Failed to get pool contract: ${poolResult.error?.message}`
      );
    }

    const { pool } = poolResult.data;

    // Setup network and nonce
    const networkObj = getNetwork("testnet");
    const nonce = await getNextNonce("testnet", address);

    // Step 3: Deploy Token
    console.log("3. Deploying token contract...");
    const tokenTx = await makeContractDeploy({
      contractName: token.name,
      codeBody: token.code,
      senderKey: key,
      network: networkObj,
      postConditionMode: PostConditionMode.Allow,
      nonce,
      fee: 30000,
      anchorMode: AnchorMode.Any,
    });

    const tokenBroadcastResponse = await broadcastTransaction(tokenTx);
    await logBroadcastResult(tokenBroadcastResponse, address);
    console.log(`Token Contract: ${token.contract}`);

    // Wait 10 seconds
    console.log("Waiting 10 seconds before deploying pool...");
    await delay(10000);

    // Step 4: Deploy Pool
    console.log("4. Deploying pool contract...");
    const poolTx = await makeContractDeploy({
      contractName: pool.name,
      codeBody: pool.code,
      senderKey: key,
      network: networkObj,
      postConditionMode: PostConditionMode.Allow,
      nonce: nonce + 1,
      fee: 30000,
      anchorMode: AnchorMode.Any,
    });

    const poolBroadcastResponse = await broadcastTransaction(poolTx);
    await logBroadcastResult(poolBroadcastResponse, address);
    console.log(`Pool Contract: ${pool.contract}`);

    // Wait 10 seconds
    console.log("Waiting 10 seconds before deploying DEX...");
    await delay(10000);

    // Step 5: Deploy DEX
    console.log("5. Deploying DEX contract...");
    const dexTx = await makeContractDeploy({
      contractName: dex.name,
      codeBody: dex.code,
      senderKey: key,
      network: networkObj,
      postConditionMode: PostConditionMode.Allow,
      nonce: nonce + 2,
      fee: 30000,
      anchorMode: AnchorMode.Any,
    });

    const dexBroadcastResponse = await broadcastTransaction(dexTx);
    await logBroadcastResult(dexBroadcastResponse, address);
    console.log(`DEX Contract: ${dex.contract}`);

    console.log("\n🎉 All deployments complete!");
    console.log("=================================");
    console.log("Prelaunch Contract:", prelaunchResult.data.contract.contract);
    console.log("Token Contract:", token.contract);
    console.log("Pool Contract:", pool.contract);
    console.log("DEX Contract:", dex.contract);
    console.log("=================================");
  } catch (error) {
    console.error("Error in AI BTC Dev deployment:", error);
  }
}

testAIBTCDevDeployment();
