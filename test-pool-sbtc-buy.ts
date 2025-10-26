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
  standardPrincipalCV,
  createAssetInfo,
  makeStandardFungiblePostCondition,
  makeContractFungiblePostCondition,
  FungibleConditionCode,
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

const DEX_CONTRACT = "SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.b-faktory-pool";

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

    // sBTC contract details (using correct mainnet address)
    const sbtcContract = {
      address: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
      name: "sbtc-token",
      assetName: "sbtc-token",
    };

    // B token contract details (based on DEX_CONTRACT)
    const tokenContract = {
      address: "SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22", // Actual B token contract
      name: "b-faktory", // Actual token contract name
      symbol: buyQuote.tokenSymbol, // Symbol from quote
    };

    console.log("Creating post conditions...");

    try {
      // Create sBTC asset info
      const sbtcAssetInfo = createAssetInfo(
        sbtcContract.address,
        sbtcContract.name,
        sbtcContract.assetName
      );

      // Create B token asset info
      const tokenAssetInfo = createAssetInfo(
        tokenContract.address,
        tokenContract.name,
        tokenContract.symbol
      );

      // Create post conditions
      const postConditions = [
        makeStandardFungiblePostCondition(
          address,
          FungibleConditionCode.LessEqual,
          satoshis,
          sbtcAssetInfo
        ),
        makeContractFungiblePostCondition(
          poolAddress,
          poolName,
          FungibleConditionCode.GreaterEqual,
          minTokensOut,
          tokenAssetInfo
        ),
      ];

      // Build transaction options
      const txOptions = {
        contractAddress: buyParams.contractAddress,
        contractName: buyParams.contractName,
        functionName: buyParams.functionName,
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
      const broadcastResponse = await broadcastTransaction(tx);
      await logBroadcastResult(broadcastResponse, address);
    } catch (error) {
      console.error("Error creating post conditions:", error);

      // Fallback to no post conditions if they cause errors
      console.log("Falling back to transaction without post conditions...");
      const txOptions = {
        contractAddress: buyParams.contractAddress,
        contractName: buyParams.contractName,
        functionName: buyParams.functionName,
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
    console.error("Error in sBTC pool buy test:", error);
    if (error instanceof Error) {
      console.error("Details:", error.message);
      console.error("Stack trace:", error.stack);
    }
  }
}

testPoolBuyWithSbtc();
