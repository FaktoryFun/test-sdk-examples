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

async function testAIBTCDevTokenCreation() {
  try {
    const tokenName = "ai1";
    const nameForContract = tokenName.toLowerCase().replace(/\s+/g, "-");

    // Get account from mnemonic
    const { address, key } = await deriveChildAccount(
      "mainnet",
      process.env.MNEMONIC!,
      0
    );

    // Get contracts from AI BTC Dev endpoint
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
          symbol: "ai1",
          name: tokenName,
          supply: 69000000,
          creatorAddress: address,
          uri: "https://example.com/metadata.json",
        }),
      }
    );

    const result = await response.json();
    if (!result.success) {
      throw new Error(`Failed to get contracts: ${result.error?.message}`);
    }

    const { token, dex } = result.data.contracts;

    // Setup network and nonce
    const networkObj = getNetwork("mainnet");
    const nonce = await getNextNonce("mainnet", address);

    console.log("Deploying token contract...");
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

    console.log("Deploying DEX contract...");
    const dexTx = await makeContractDeploy({
      contractName: dex.name,
      codeBody: dex.code,
      senderKey: key,
      network: networkObj,
      postConditionMode: PostConditionMode.Allow,
      nonce: nonce + 1,
      fee: 30000,
      anchorMode: AnchorMode.Any,
    });

    const dexBroadcastResponse = await broadcastTransaction(dexTx);
    await logBroadcastResult(dexBroadcastResponse, address);

    console.log("Deployment complete!");
    console.log(`Token Contract: ${token.contract}`);
    console.log(`Token Hash: ${token.hash}`);
    console.log(`DEX Contract: ${dex.contract}`);
    console.log(`DEX Hash: ${dex.hash}`);
  } catch (error) {
    console.error("Error in AI BTC Dev token creation:", error);
  }
}

testAIBTCDevTokenCreation();
