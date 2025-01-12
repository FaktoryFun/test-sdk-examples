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
  network: "testnet", // Changed to testnet
});

// Use testnet address
const FAKTORY_FEE_ADDRESS = "STQM5S86GFM1731EBZE192PNMMP8844R30E8WDPB";

async function testManualTokenCreation() {
  try {
    const tokenName = "testtoken"; // Base name
    const nameForContract = tokenName.toLowerCase().replace(/\s+/g, "-");
    const contractName = `${nameForContract}-faktory`;

    // Get account from testnet mnemonic
    const { address, key } = await deriveChildAccount(
      "testnet", // Changed to testnet
      process.env.MNEMONIC!,
      0
    );

    const networkObj = getNetwork("testnet"); // Changed to testnet
    const nonce = await getNextNonce("testnet", address);

    const initialBuyAmount = 0.1; // STX
    console.log("Getting deployment parameters...");
    const params = await sdk.getTokenDeployParams({
      symbol: "TEST",
      name: tokenName,
      description: "Test token on testnet",
      supply: 69000000,
      targetStx: 1,
      creatorAddress: address,
      initialBuyAmount,
      targetAmm: "ST28MP1HQDJWQAFSQJN2HBAXBVP7H7THD1Y83JDEY", // Testnet AMM
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
