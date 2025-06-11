export interface MemeToken {
  authority: string;
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  imageUrl: string;
  createdAt: number;
  marketCap: number;
  isGraduated: boolean;
  liquidityPool?: string;
  raydiumPool?: string;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  imageUrl: string;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
}

export interface MarketListing {
  seller: string;
  mint: string;
  price: number;
  amount: number;
  createdAt: number;
  curveType: "Linear" | "Exponential" | "Sigmoid" | "Custom";
  kValue: number;
}

export interface LaunchpadInfo {
  authority: string;
  mint: string;
  price: number;
  totalSupply: number;
  remainingSupply: number;
  startTime: number;
  endTime: number;
  minContribution: number;
  maxContribution: number;
  marketCapTarget: number;
  followersCount: number;
  autoGraduateThreshold: number;
}

export interface UserProfile {
  user: string;
  following: string[];
  followers: string[];
  createdTokens: string[];
  trustedStatus: boolean;
  reputationScore: number;
}
