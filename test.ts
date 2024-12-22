import { FaktorySDK, NetworkType } from "@faktory/core-sdk";
import dotenv from "dotenv";
import { promises as fs } from "fs";

dotenv.config();

console.log("\nEnvironment Configuration:");
console.log({
  NETWORK: process.env.NETWORK,
  STX_ADDRESS: process.env.STX_ADDRESS,
  FAK_API_URL: process.env.FAK_API_URL,
  HAS_MNEMONIC: !!process.env.MNEMONIC,
});

const sdk = new FaktorySDK({
  API_HOST: process.env.FAK_API_URL || "https://faktory-be.vercel.app/api",
  API_KEY: process.env.FAK_API_KEY || "dev-api-token",
  defaultAddress: process.env.STX_ADDRESS!,
  network: (process.env.NETWORK || "testnet") as NetworkType,
});

async function saveContracts(contracts: {
  tokenContract: string;
  dexContract: string;
}) {
  await fs.writeFile(
    "contracts.json",
    JSON.stringify({
      ...contracts,
      timestamp: new Date().toISOString(),
    })
  );
}

async function loadContracts() {
  try {
    const data = await fs.readFile("contracts.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.log("No existing contracts found");
    return null;
  }
}

// Helper function to wait for deployment
async function waitForDeployment(
  tokenContract: string,
  dexContract: string,
  maxAttempts = 30
) {
  console.log("\nWaiting for contract deployment...");

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await sdk.checkContractsDeployed(tokenContract, dexContract);
    console.log(`Attempt ${attempt + 1}/${maxAttempts}:`, status);

    if (status.token && status.dex) {
      console.log("Both contracts deployed successfully!");
      return true;
    }

    console.log("Waiting 10 seconds before next check...");
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
  }

  console.log("Maximum attempts reached. Contracts not fully deployed.");
  return false;
}

async function testTokenCreation() {
  try {
    console.log("\nTesting token creation...");
    const tokenInput = {
      symbol: "SEXYPEPE",
      name: "Sexy Pepe",
      description: "The sexiest Pepe you've ever seen",
      supply: 69000000,
      targetStx: 1,
      creatorAddress: process.env.STX_ADDRESS!,
      initialBuyAmount: 0,
      targetAmm: "SP2BN9JN4WEG02QYVX5Y21VMB2JWV3W0KNHPH9R4P",
    };

    console.log("Token Creation Parameters:", tokenInput);
    const createResponse = await sdk.createToken(tokenInput);
    console.log("\nToken Creation Result:", createResponse);

    if (createResponse.success) {
      const { tokenContract, dexContract } = createResponse.data[0];
      console.log("\nContract Addresses:");
      console.log("Token Contract:", tokenContract);
      console.log("DEX Contract:", dexContract);

      // Wait for deployment
      const deployed = await waitForDeployment(tokenContract, dexContract);
      if (deployed) {
        await saveContracts({ tokenContract, dexContract });
        return { tokenContract, dexContract };
      }
    }
  } catch (error) {
    console.error(
      "Error in test:",
      error instanceof Error ? error.message : error
    );
  }
  return null;
}

async function testTrading(dexContract: string) {
  try {
    console.log("\nChecking if market is open...");
    const isOpen = await sdk.getOpen(dexContract);
    console.log("Market open:", isOpen);

    if (isOpen) {
      console.log("\nTesting buy...");
      const buyResponse = await sdk.buy(
        dexContract,
        1100000,
        10000,
        0,
        process.env.MNEMONIC!
      );
      console.log("Buy Result:", buyResponse);
    } else {
      console.log("Market is not open yet");
    }
  } catch (error) {
    console.error(
      "Error in test:",
      error instanceof Error ? error.message : error
    );
  }
}

async function runTests() {
  const contracts = await loadContracts();

  if (contracts) {
    console.log("\nFound existing contracts:", contracts);
    const status = await sdk.checkContractsDeployed(
      contracts.tokenContract,
      contracts.dexContract
    );

    if (status.token && status.dex) {
      console.log("Using existing deployed contracts");
      await testTrading(contracts.dexContract);
    } else {
      console.log("Existing contracts not deployed, creating new ones...");
      const newContracts = await testTokenCreation();
      if (newContracts) {
        await testTrading(newContracts.dexContract);
      }
    }
  } else {
    console.log("\nNo existing contracts found, creating new ones...");
    const newContracts = await testTokenCreation();
    if (newContracts) {
      await testTrading(newContracts.dexContract);
    }
  }
}

runTests();
