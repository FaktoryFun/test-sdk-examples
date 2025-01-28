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

async function deployPoolForExistingToken() {
  try {
    // Get account from mnemonic
    const { address, key } = await deriveChildAccount(
      "testnet",
      process.env.MNEMONIC!,
      0
    );

    // Get pool contract from testnet endpoint
    console.log("Getting pool contract...");
    const poolResponse = await fetch(
      "https://faktory-testnet-be.vercel.app/api/aibtcdev/generate-pool",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.AIBTCDEV_API_KEY || "",
        },
        body: JSON.stringify({
          tokenContract:
            "STV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RJ5XDY2.pctest-faktory",
          dexContract:
            "STV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RJ5XDY2.pctest-faktory-dex",
          senderAddress: address,
          symbol: "pctest",
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
    const networkObj = getNetwork("testnet");
    const nonce = await getNextNonce("testnet", address);

    // Deploy Pool
    console.log("Deploying pool contract...");
    const poolTx = await makeContractDeploy({
      contractName: pool.name,
      codeBody: pool.code,
      senderKey: key,
      network: networkObj,
      postConditionMode: PostConditionMode.Allow,
      nonce,
      fee: 30000,
      anchorMode: AnchorMode.Any,
    });

    const poolBroadcastResponse = await broadcastTransaction(poolTx);
    await logBroadcastResult(poolBroadcastResponse, address);
    console.log(`Pool Contract: ${pool.contract}`);

    console.log("Pool deployment complete!");
  } catch (error) {
    console.error("Error in pool deployment:", error);
  }
}

deployPoolForExistingToken();
