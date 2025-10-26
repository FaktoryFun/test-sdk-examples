// test-pool-sbtc-sell.ts
import { FaktorySDK } from "@faktoryfun/core-sdk";
import {
  makeContractCall,
  broadcastTransaction,
  SignedContractCallOptions,
  contractPrincipalCV,
  uintCV,
  bufferCV,
  someCV,
  AnchorMode,
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

// Use the b-faktory-pool contract
const DEX_CONTRACT = "SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.b-faktory-pool";

const sdk = new FaktorySDK({
  network: "mainnet",
});

async function testPoolSellForSbtc() {
  try {
    // Get account details
    const { address, key } = await deriveChildAccount(
      "mainnet",
      process.env.MNEMONIC!,
      0
    );
    const networkObj = getNetwork("mainnet");
    const nonce = await getNextNonce("mainnet", address);

    // Amount of tokens to sell (25,571.01255830 in units)
    const tokenAmount = 25571.0125583;

    // Convert to micro units for logging clarity
    const tokenAmountInMicro = 2557101255830;

    console.log(
      `\nGetting quote for selling ${tokenAmount} tokens (${tokenAmountInMicro} microunits)...`
    );

    const sellQuote = await sdk.getPoolSellForSbtcQuote({
      dexContract: DEX_CONTRACT,
      inAmount: tokenAmount,
      senderAddress: address,
    });

    console.log("Quote:", {
      inAmount: sellQuote.inAmount,
      estimatedOut: sellQuote.estimatedOut,
      tokenSymbol: sellQuote.tokenSymbol,
    });

    // Get sell parameters from SDK
    console.log("\nGetting sell parameters...");
    const sellParams = await sdk.getPoolSellForSbtcParams({
      dexContract: DEX_CONTRACT,
      inAmount: tokenAmount,
      senderAddress: address,
      slippage: 15, // 15% slippage tolerance
    });

    // Get pool and token details
    const [poolAddress, poolName] = DEX_CONTRACT.split(".");

    // Create function args locally (avoiding compatibility issues)
    const functionArgs = [
      contractPrincipalCV(poolAddress, poolName),
      uintCV(tokenAmountInMicro),
      someCV(bufferCV(Buffer.from([0x01]))), // 0x01 for selling tokens
    ];

    // Build transaction options
    const txOptions: SignedContractCallOptions = {
      contractAddress: sellParams.contractAddress,
      contractName: sellParams.contractName,
      functionName: sellParams.functionName,
      functionArgs, // Use our local function args
      senderKey: key,
      validateWithAbi: true,
      network: networkObj,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow, // Use Allow mode to bypass post-condition issues
      postConditions: [], // Empty post conditions for testing
      fee: 30000,
      nonce,
    };

    console.log("\nCreating and broadcasting transaction...");
    const tx = await makeContractCall(txOptions);
    console.log("Transaction created successfully");

    const broadcastResponse = await broadcastTransaction(tx);
    console.log("Transaction broadcast response:", broadcastResponse);

    await logBroadcastResult(broadcastResponse, address);
  } catch (error) {
    console.error("Error in sBTC pool sell test:", error);
    if (error instanceof Error) {
      console.error("Details:", error.message);
      console.error("Stack trace:", error.stack);
    }
  }
}

// Run the test
testPoolSellForSbtc();
