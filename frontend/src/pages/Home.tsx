import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TokenStats, PriceCurve, SocialLinks } from "../components/memecoin";
import { MemeToken } from "../types";
import { BN } from "@project-serum/anchor";

const Home: FC = () => {
  const [trendingTokens, setTrendingTokens] = useState<MemeToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call to fetch trending tokens
    const fetchTrendingTokens = async () => {
      try {
        // Mock data for now
        const mockTokens: MemeToken[] = [
          {
            authority: "abc123",
            mint: "def456",
            name: "PEPE SOL",
            symbol: "PSOL",
            decimals: 9,
            totalSupply: 1000000000,
            imageUrl: "https://example.com/pepe.png",
            createdAt: Date.now(),
            marketCap: 500000,
            isGraduated: true,
            liquidityPool: "ghi789",
            raydiumPool: "jkl012",
          },
          // Add more mock tokens here
        ];
        setTrendingTokens(mockTokens);
      } catch (error) {
        console.error("Error fetching trending tokens:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingTokens();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-memecoin-primary via-memecoin-secondary to-memecoin-accent bg-clip-text text-transparent animate-gradient">
          Launch Your Memecoin on Solana 🚀
        </h1>
        <p className="text-xl text-dark-text-secondary mb-8 max-w-2xl mx-auto">
          Create, launch, and trade memecoins instantly. Join the
          fastest-growing memecoin community on Solana.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/create"
            className="px-8 py-3 bg-gradient-to-r from-memecoin-primary to-memecoin-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Create Token
          </Link>
          <Link
            to="/marketplace"
            className="px-8 py-3 bg-dark-secondary text-white rounded-lg font-medium hover:bg-dark-primary transition-colors"
          >
            Start Trading
          </Link>
        </div>
      </div>

      {/* Trending Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-dark-text">
          🔥 Trending Memecoins
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingTokens.map((token) => (
            <div
              key={token.mint}
              className="bg-dark-secondary rounded-lg p-6 hover:transform hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={token.imageUrl}
                  alt={token.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-xl font-bold text-dark-text">
                    {token.name}
                  </h3>
                  <p className="text-dark-text-secondary">${token.symbol}</p>
                </div>
              </div>
              <TokenStats
                marketCap={new BN(token.marketCap)}
                holders={156} // Mock data
                price={new BN(token.marketCap / token.totalSupply)}
                volume24h={new BN(token.marketCap * 0.1)} // Mock 10% volume
                isGraduated={token.isGraduated}
              />
              <div className="mt-4">
                <SocialLinks
                  website="https://example.com"
                  twitter="@example"
                  telegram="example"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-dark-secondary p-6 rounded-lg">
          <div className="text-3xl mb-4">🛠️</div>
          <h3 className="text-xl font-bold text-memecoin-primary mb-2">
            Easy Creation
          </h3>
          <p className="text-dark-text-secondary">
            Launch your memecoin in minutes with zero technical knowledge
            required.
          </p>
        </div>
        <div className="bg-dark-secondary p-6 rounded-lg">
          <div className="text-3xl mb-4">📈</div>
          <h3 className="text-xl font-bold text-memecoin-secondary mb-2">
            Smart Pricing
          </h3>
          <p className="text-dark-text-secondary">
            Automatic price discovery with bonding curves and liquidity pools.
          </p>
        </div>
        <div className="bg-dark-secondary p-6 rounded-lg">
          <div className="text-3xl mb-4">🎓</div>
          <h3 className="text-xl font-bold text-memecoin-accent mb-2">
            Token Graduation
          </h3>
          <p className="text-dark-text-secondary">
            Successful tokens can graduate to Raydium for enhanced trading.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-dark-secondary rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-dark-text mb-8">
          Platform Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-3xl font-bold text-memecoin-primary">
              1.2M+
            </div>
            <div className="text-dark-text-secondary">Total Tokens</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-memecoin-secondary">
              50K+
            </div>
            <div className="text-dark-text-secondary">Daily Trades</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-memecoin-accent">100K+</div>
            <div className="text-dark-text-secondary">Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-memecoin-success">250+</div>
            <div className="text-dark-text-secondary">Graduated Tokens</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
