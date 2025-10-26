// test-pool-sbtc-buy.ts
import { FaktorySDK } from "@faktoryfun/core-sdk";
import {
  makeContractCall,
  broadcastTransaction,
  SignedContractCallOptions,
  contractPrincipalCV,
  uintCV,
  bufferCV,
  someCV,
  createAssetInfo,
  makeStandardSTXPostCondition,
  makeStandardFungiblePostCondition,
  makeContractFungiblePostCondition,
  FungibleConditionCode,
  PostConditionMode,
} from "@stacks/transactions";
import {
  deriveChildAccount,
  getNetwork,
  getNextNonce,
  logBroadcastResult,
} from "./test-utils";
import dotenv from "dotenv";

dotenv.config();

const DEX_CONTRACT = "SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.b-faktory-pool";
// Use correct mainnet sBTC contract
const SBTC_CONTRACT = {
  address: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
  name: "sbtc-token",
  assetName: "sbtc-token",
};

const sdk = new FaktorySDK({
  network: "mainnet",
});

async function testPoolBuyWithSbtc() {
  try {
    // Get account details
    const { address, key } = await deriveChildAccount(
      "mainnet",
      process.env.MNEMONIC!,
      0
    );
    const networkObj = getNetwork("mainnet");
    const nonce = await getNextNonce("mainnet", address);

    // Amount of sBTC to use (2,000 sats)
    const sbtcAmount = 0.00002;
    const satoshis = Math.floor(sbtcAmount * 100000000);

    // Get quote from SDK
    console.log(
      `\nGetting quote for ${sbtcAmount} sBTC buy (${satoshis} sats)...`
    );
    const buyQuote = await sdk.getPoolBuyWithSbtcQuote({
      dexContract: DEX_CONTRACT,
      inAmount: sbtcAmount,
      senderAddress: address,
    });
    console.log("Quote:", {
      estimatedOut: buyQuote.estimatedOut,
      tokenSymbol: buyQuote.tokenSymbol,
    });

    // Get buy parameters from SDK
    const buyParams = await sdk.getPoolBuyWithSbtcParams({
      dexContract: DEX_CONTRACT,
      inAmount: sbtcAmount,
      senderAddress: address,
      slippage: 4,
    });

    // Get pool and token details
    const [poolAddress, poolName] = DEX_CONTRACT.split(".");

    // Create function args locally (avoiding compatibility issues)
    const functionArgs = [
      contractPrincipalCV(poolAddress, poolName),
      uintCV(satoshis),
      someCV(bufferCV(Buffer.from([0x00]))),
    ];

    // Apply slippage to get min tokens
    const slippageFactor = (100 - 15) / 100;
    const minTokensOut = Math.floor(
      Number(buyQuote.estimatedOut) * slippageFactor
    );

    console.log("\nCreating transaction without post conditions...");

    // Use no post conditions for simplicity
    // This is a simpler approach to avoid address format issues
    const txOptions = {
      contractAddress: buyParams.contractAddress,
      contractName: buyParams.contractName,
      functionName: buyParams.functionName,
      functionArgs,
      postConditions: [], // Empty post conditions
      postConditionMode: PostConditionMode.Allow, // Allow any changes
      network: networkObj,
      anchorMode: buyParams.anchorMode,
      senderKey: key,
      fee: 30000,
      nonce,
      validateWithAbi: true,
    };

    console.log("Creating and broadcasting transaction...");
    const tx = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(tx);
    await logBroadcastResult(broadcastResponse, address);
  } catch (error) {
    console.error("Error in sBTC pool buy test:", error);
    if (error instanceof Error) {
      console.error("Details:", error.message);
      console.error("Stack trace:", error.stack);
    }
  }
}

testPoolBuyWithSbtc();
