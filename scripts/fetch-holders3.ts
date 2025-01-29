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

async function fetchTokenHoldersPage(
  tokenId: string,
  offset: number,
  limit: number = 200
): Promise<ApiResponse> {
  const url = `https://api.hiro.so/extended/v1/tokens/ft/${tokenId}/holders?offset=${offset}&limit=${limit}`;
  console.log(`Fetching page with offset ${offset}...`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as ApiResponse;
}

async function fetchAllTokenHolders(tokenId: string): Promise<HolderData[]> {
  // Get first page to get total count
  const firstPage = await fetchTokenHoldersPage(tokenId, 0);
  const totalHolders = firstPage.total;
  const limit = 200; // Maximum limit allowed by API

  console.log(`Total holders found: ${totalHolders}`);
  let allHolders = [...firstPage.results];

  // Calculate remaining pages
  const remainingPages = Math.ceil((totalHolders - limit) / limit);

  // Fetch remaining pages
  for (let i = 1; i <= remainingPages; i++) {
    const offset = i * limit;
    const page = await fetchTokenHoldersPage(tokenId, offset);
    allHolders = [...allHolders, ...page.results];
    console.log(`Fetched ${allHolders.length} holders so far...`);
  }

  return allHolders;
}

async function writeHoldersToJSON(holders: HolderData[]): Promise<void> {
  // Create array of holders with just address and balance
  const holdersData = holders.map((holder) => ({
    address: holder.address,
    balance: holder.balance,
  }));

  // Write to file with pretty formatting
  await fs.writeFile(
    "token_holders.json",
    JSON.stringify(holdersData, null, 2)
  );
  console.log("JSON file has been created successfully");
  console.log("File location: ", process.cwd() + "/token_holders.json");
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

    console.log("Fetching all holders for token:", tokenId);
    const holders = await fetchAllTokenHolders(tokenId);

    if (holders.length > 0) {
      await writeHoldersToJSON(holders);
      console.log(`Total holders written to file: ${holders.length}`);
    } else {
      console.log("No holders found");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
