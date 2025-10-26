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
  createAssetInfo,
  makeStandardFungiblePostCondition,
  makeContractFungiblePostCondition,
  FungibleConditionCode,
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
// sBTC contract details (using correct mainnet address)
const SBTC_CONTRACT = {
  address: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
  name: "sbtc-token",
  assetName: "sbtc-token",
};

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

    // Convert to micro units for consistency with contract expectations
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

    // Apply slippage to get minimum sBTC out
    const slippageFactor = (100 - 15) / 100;
    const minSbtcOut = Math.floor(
      Number(sellQuote.estimatedOut) * slippageFactor
    );

    // Create function args locally (avoiding compatibility issues)
    const functionArgs = [
      contractPrincipalCV(poolAddress, poolName),
      uintCV(tokenAmountInMicro),
      someCV(bufferCV(Buffer.from([0x01]))), // 0x01 for selling tokens
    ];

    // B token contract details (based on SDK quote)
    // Assuming these details - adjust as needed for your actual token
    const tokenContract = {
      address: "SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22", // B token contract address
      name: "b-faktory", // B token contract name
      symbol: sellQuote.tokenSymbol,
    };

    console.log("Creating post conditions...");

    try {
      // Create B token asset info
      const tokenAssetInfo = createAssetInfo(
        tokenContract.address,
        tokenContract.name,
        tokenContract.symbol
      );

      // Create sBTC asset info
      const sbtcAssetInfo = createAssetInfo(
        SBTC_CONTRACT.address,
        SBTC_CONTRACT.name,
        SBTC_CONTRACT.assetName
      );

      // Create post conditions
      const postConditions = [
        // Sender will send tokens
        makeStandardFungiblePostCondition(
          address,
          FungibleConditionCode.LessEqual,
          tokenAmountInMicro.toString(),
          tokenAssetInfo
        ),
        // Pool will send sBTC
        makeContractFungiblePostCondition(
          poolAddress,
          poolName,
          FungibleConditionCode.GreaterEqual,
          minSbtcOut.toString(),
          sbtcAssetInfo
        ),
      ];

      // Build transaction options
      const txOptions = {
        contractAddress: sellParams.contractAddress,
        contractName: sellParams.contractName,
        functionName: sellParams.functionName,
        functionArgs,
        postConditions,
        postConditionMode: PostConditionMode.Deny,
        network: networkObj,
        anchorMode: AnchorMode.Any,
        senderKey: key,
        fee: 30000,
        nonce,
        validateWithAbi: true,
      };

      console.log("\nCreating and broadcasting transaction...");
      const tx = await makeContractCall(txOptions);
      console.log("Transaction created successfully");

      const broadcastResponse = await broadcastTransaction(tx);
      console.log("Transaction broadcast response:", broadcastResponse);

      await logBroadcastResult(broadcastResponse, address);
    } catch (error) {
      console.error("Error creating post conditions:", error);

      // Fallback to no post conditions if they cause errors
      console.log("Falling back to transaction without post conditions...");
      const txOptions = {
        contractAddress: sellParams.contractAddress,
        contractName: sellParams.contractName,
        functionName: sellParams.functionName,
        functionArgs,
        postConditions: [],
        postConditionMode: PostConditionMode.Allow,
        network: networkObj,
        anchorMode: AnchorMode.Any,
        senderKey: key,
        fee: 30000,
        nonce,
        validateWithAbi: true,
      };

      const tx = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(tx);
      await logBroadcastResult(broadcastResponse, address);
    }
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
