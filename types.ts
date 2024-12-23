import { NetworkType } from "./network-types";

// types.ts
export interface FaktorySDKConfig {
  API_HOST: string;
  API_KEY: string;
  defaultAddress: string;
  network: NetworkType;
  hiroApiKey?: string;
}

// this Token.ts
export default interface Token {
  id: string;
  name: string;
  symbol: string;
  description: string;
  tokenContract: string;
  dexContract: string;
  txId: string | null;
  targetAmm: string;
  supply: number;
  decimals: number;
  targetStx: number;
  progress: number;
  price: number;
  price24hChanges: number | null;
  tradingVolume: number;
  holders: number;
  tokenToDex: string | null;
  tokenToDeployer: string | null;
  stxToDex: number | null;
  stxBuyFirstFee: number | null;
  logoUrl: string | null;
  mediaUrl: string | null;
  uri: string | null;
  twitter: string | null;
  website: string | null;
  telegram: string | null;
  discord: string | null;
  chatCount: number;
  txsCount: number;
  creatorAddress: string;
  deployedAt: string;
  // tokenHash: string;
  // tokenVerified: number;
  // dexHash: string;
  // dexVerified: number;
  // tokenVerifiedAt: string | null;
  // dexVerifiedAt: string | null;
  status: string;
  // tokenChainhookUuid: string | null;
}

export interface TokenCreationInput {
  symbol: string;
  name: string;
  description: string;
  supply: number;
  targetStx: number;
  creatorAddress: string;
  initialBuyAmount: number;
  targetAmm: string;
  decimals?: number;
  uri?: string;
  logoUrl?: string;
  mediaUrl?: string;
  twitter?: string;
  website?: string;
  telegram?: string;
  discord?: string;
}

export interface TokenCreationResponse {
  success: boolean;
  data: Token[];
  tokenTxId: string;
  dexTxId: string;
}

export interface ReadResponse {
  okay: boolean;
  result: string;
}

export interface VerifiedTokensResponse {
  count: number;
  next: string | null;
  results: Token[];
}

export interface TransferVerification {
  token_address: string;
  is_token_sent: boolean;
  tx_hash: string | null;
}
