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

dotenv.config();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function testAIBTCDevDeployment() {
  try {
    const tokenName = "ai3";
    const nameForContract = tokenName.toLowerCase().replace(/\s+/g, "-");

    // Get account from mnemonic
    const { address, key } = await deriveChildAccount(
      "mainnet",
      process.env.MNEMONIC!,
      0
    );

    // Get token and dex contracts
    console.log("Getting contracts from AI BTC Dev endpoint...");
    const response = await fetch(
      "https://faktory-be.vercel.app/api/aibtcdev/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.AIBTCDEV_API_KEY || "",
        },
        body: JSON.stringify({
          symbol: "ai",
          name: tokenName,
          supply: 1000000000, // cannot exceed 1B (1B is allowed)
          creatorAddress: address,
          uri: "https://example.com/metadata.json",
          // Optional fields:
          logoUrl: "https://example.com/logo.png",
          mediaUrl: "https://example.com/media.mp4",
          twitter: "https://twitter.com/example",
          website: "https://example.com",
          telegram: "https://t.me/example",
          discord: "https://discord.gg/example",
          description: "My AI Token Description",
        }),
      }
    );

    const result = await response.json();
    if (!result.success) {
      throw new Error(`Failed to get contracts: ${result.error?.message}`);
    }

    const { token, dex } = result.data.contracts;

    // Get pool contract
    console.log("Getting pool contract...");
    const poolResponse = await fetch(
      "https://faktory-be.vercel.app/api/aibtcdev/generate-pool",
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
        }),
      }
    );

    const poolResult = await poolResponse.json();
    if (!poolResult.success) {
      throw new Error(
        `Failed to get pool contract: ${poolResult.error?.message}`
      );
    }

    const { pool } = poolResult.data;

    // Setup network and nonce
    const networkObj = getNetwork("mainnet");
    const nonce = await getNextNonce("mainnet", address);

    // 1. Deploy Token
    console.log("1. Deploying token contract...");
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

    // Wait 30 seconds
    console.log("Waiting 30 seconds before deploying pool...");
    await delay(30000);

    // 2. Deploy Pool
    console.log("2. Deploying pool contract...");
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

    // Wait 30 seconds
    console.log("Waiting 30 seconds before deploying DEX...");
    await delay(30000);

    // 3. Deploy DEX
    console.log("3. Deploying DEX contract...");
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

    console.log("All deployments complete!");
  } catch (error) {
    console.error("Error in AI BTC Dev deployment:", error);
  }
}

testAIBTCDevDeployment();
