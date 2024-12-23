// // test-fak-sdk/utils/network.ts

// import { StacksMainnet, StacksTestnet } from "@stacks/network";
// import { TransactionVersion } from "@stacks/common";
// import type { AddressNonces } from "@stacks/stacks-blockchain-api-types";

// export type NetworkType = "mainnet" | "testnet" | "devnet" | "mocknet";

// export function getNetwork(network: string) {
//   switch (network) {
//     case "mainnet":
//       return new StacksMainnet();
//     case "testnet":
//       return new StacksTestnet();
//     default:
//       return new StacksTestnet();
//   }
// }

// export function getApiUrl(network: string) {
//   switch (network) {
//     case "mainnet":
//       return "https://api.hiro.so";
//     case "testnet":
//       return "https://api.testnet.hiro.so";
//     default:
//       return "https://api.testnet.hiro.so";
//   }
// }

// export async function getNonces(network: string, address: string) {
//   const apiUrl = getApiUrl(network);
//   const response = await fetch(
//     `${apiUrl}/extended/v1/address/${address}/nonces`
//   );
//   if (!response.ok) {
//     throw new Error(`Failed to get nonce: ${response.statusText}`);
//   }
//   const data = await response.json();
//   return data as AddressNonces;
// }

// export async function getNextNonce(network: string, address: string) {
//   const nonces = await getNonces(network, address);
//   const nextNonce = nonces.possible_next_nonce;
//   return nextNonce;
// }
