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

async function testAIBTCDevTestnetDeployment() {
  try {
    // Get account from mnemonic - using testnet
    const { address, key } = await deriveChildAccount(
      "testnet",
      process.env.MNEMONIC!,
      0
    );

    // Get token and dex contracts from testnet endpoint
    console.log("Getting contracts from AI BTC Dev testnet endpoint...");
    const response = await fetch(
      "https://faktory-testnet-be.vercel.app/api/aibtcdev/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.AIBTCDEV_API_KEY || "",
        },
        body: JSON.stringify({
          symbol: "ai9t",
          name: "ai9 Testnet",
          supply: 1,
          creatorAddress: address,
          originAddress: "STV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RJ5XDY2", // Added originAddress parameter
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

    const result = await response.json();
    if (!result.success) {
      throw new Error(`Failed to get contracts: ${result.error?.message}`);
    }

    const { token, dex } = result.data.contracts;

    // Rest of the code remains the same...
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
          symbol: "ai9t",
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

    const networkObj = getNetwork("testnet");
    const nonce = await getNextNonce("testnet", address);

    console.log("1. Deploying token contract to testnet...");
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

    console.log("Waiting 15 seconds before deploying pool...");
    await delay(5000);

    console.log("2. Deploying pool contract to testnet...");
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

    console.log("Waiting 15 seconds before deploying DEX...");
    await delay(5000);

    console.log("3. Deploying DEX contract to testnet...");
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

    console.log("All testnet deployments complete!");
  } catch (error) {
    console.error("Error in AI BTC Dev testnet deployment:", error);
  }
}

testAIBTCDevTestnetDeployment();
