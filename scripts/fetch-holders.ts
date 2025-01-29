// scripts/fetch-holders.ts
import fs from "fs/promises";

interface HolderData {
  address: string;
  balance: string;
}

interface ApiResponse {
  limit: number;
  offset: number;
  total: number;
  total_supply: string;
  results: HolderData[];
}

async function fetchTokenHolders(tokenId: string): Promise<ApiResponse> {
  const url = `https://api.hiro.so/extended/v1/tokens/ft/${tokenId}/holders`;
  console.log("Fetching from:", url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = (await response.json()) as ApiResponse;
  return data;
}

async function writeHoldersToCSV(holders: HolderData[]): Promise<void> {
  // Create CSV content with just addresses
  const csvContent = holders.map((holder) => holder.address).join("\n");

  // Write to file
  await fs.writeFile("token_holders.csv", "address\n" + csvContent);
  console.log("CSV file has been created successfully");
  console.log("File location: ", process.cwd() + "/token_holders.csv");
}

async function main() {
  try {
    const tokenId = process.argv[2];

    if (!tokenId) {
      console.error("Please provide a token ID as an argument");
      console.error(
        "Example: ts-node fetch-holders.ts SP000000000000000000002Q6VF78.my-token"
      );
      process.exit(1);
    }

    console.log("Fetching holders for token:", tokenId);
    const holdersData = await fetchTokenHolders(tokenId);

    if (holdersData.results && holdersData.results.length > 0) {
      await writeHoldersToCSV(holdersData.results);
      console.log(`Total holders fetched: ${holdersData.results.length}`);
      console.log(`Total supply: ${holdersData.total_supply}`);
    } else {
      console.log("No holders found");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
