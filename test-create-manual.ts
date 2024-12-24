import { FaktorySDK } from "@faktoryfun/core-sdk";
import {
  makeContractDeploy,
  broadcastTransaction,
  FungibleConditionCode,
  makeStandardSTXPostCondition,
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

const sdk = new FaktorySDK({
  network: "mainnet",
});

const FAKTORY_FEE_ADDRESS = "SMH8FRN30ERW1SX26NJTJCKTDR3H27NRJ6W75WQE";

async function testManualTokenCreation() {
  try {
    // Get account from mnemonic
    const { address, key } = await deriveChildAccount(
      "mainnet",
      process.env.MNEMONIC!,
      0
    );

    const networkObj = getNetwork("mainnet");
    const nonce = await getNextNonce("mainnet", address);

    const initialBuyAmount = 0.1; // STX
    console.log("Getting deployment parameters...");
    const params = await sdk.getTokenDeployParams({
      symbol: "BUSH",
      name: "MAN Magic",
      description: "Much bush, such pepe",
      supply: 69000000,
      targetStx: 1,
      creatorAddress: address,
      initialBuyAmount,
      targetAmm: "SP3DX9KDA8AMX5BHW5QJ68W39V7YHZE696PHXFR20", // Velar production
    });

    // Calculate total STX needed for token contract
    // - 1 STX fixed fee
    // - 50% of initialBuyAmount as premium
    const totalTokenStx =
      1_000_000 + // 1 STX fixed fee
      initialBuyAmount * 1_000_000;

    console.log("Deploying token contract...");
    console.log(
      "Total STX for token contract:",
      totalTokenStx / 1_000_000,
      "STX"
    );

    const contractName = `magic-faktory`;
    const tokenTx = await makeContractDeploy({
      contractName,
      codeBody: params.tokenCode,
      senderKey: key,
      network: networkObj,
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        makeStandardSTXPostCondition(
          address,
          FungibleConditionCode.LessEqual,
          totalTokenStx
        ),
      ],
      nonce,
      fee: 30000,
      anchorMode: AnchorMode.Any,
    });

    const tokenBroadcastResponse = await broadcastTransaction(tokenTx);
    await logBroadcastResult(tokenBroadcastResponse, address);

    console.log("Deploying DEX contract...");
    const dexTx = await makeContractDeploy({
      contractName: `${contractName}-dex`,
      codeBody: params.dexCode,
      senderKey: key,
      network: networkObj,
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        makeStandardSTXPostCondition(
          address,
          FungibleConditionCode.LessEqual,
          1_000_000 // 1 STX fixed fee
        ),
      ],
      nonce: nonce + 1,
      fee: 30000,
      anchorMode: AnchorMode.Any,
    });

    const dexBroadcastResponse = await broadcastTransaction(dexTx);
    await logBroadcastResult(dexBroadcastResponse, address);

    console.log("Deployment complete!");
    console.log(`Token Contract: ${address}.${contractName}`);
    console.log(`DEX Contract: ${address}.${contractName}-dex`);
  } catch (error) {
    console.error("Error in manual token creation:", error);
  }
}

testManualTokenCreation();
