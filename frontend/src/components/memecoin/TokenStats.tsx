import { FC } from "react";
import { BN } from "@project-serum/anchor";

interface TokenStatsProps {
  marketCap: BN;
  holders: number;
  price: BN;
  volume24h: BN;
  isGraduated: boolean;
}

export const TokenStats: FC<TokenStatsProps> = ({
  marketCap,
  holders,
  price,
  volume24h,
  isGraduated,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-dark-secondary rounded-lg">
      <div className="text-center">
        <p className="text-sm text-dark-text-secondary">Market Cap</p>
        <p className="text-xl font-bold text-memecoin-accent">
          {marketCap.toString()} SOL
        </p>
      </div>
      <div className="text-center">
        <p className="text-sm text-dark-text-secondary">Holders</p>
        <p className="text-xl font-bold text-memecoin-primary">{holders}</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-dark-text-secondary">Price</p>
        <p className="text-xl font-bold text-memecoin-secondary">
          {price.toString()} SOL
        </p>
      </div>
      <div className="text-center">
        <p className="text-sm text-dark-text-secondary">24h Volume</p>
        <p className="text-xl font-bold text-memecoin-accent">
          {volume24h.toString()} SOL
        </p>
      </div>
      {isGraduated && (
        <div className="col-span-2 md:col-span-4 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-memecoin-success/10 text-memecoin-success">
            🎓 Graduated to Raydium
          </span>
        </div>
      )}
    </div>
  );
};
