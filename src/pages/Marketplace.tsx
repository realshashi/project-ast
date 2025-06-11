import { FC, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface Token {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
}

const Marketplace: FC = () => {
  const { connected } = useWallet();
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");

  // Mock data - replace with actual data from your backend
  const tokens: Token[] = [
    {
      id: "1",
      name: "Doge Clone",
      symbol: "DOGE2",
      price: 0.0001,
      change24h: 5.2,
      volume24h: 1000000,
    },
    // Add more mock tokens here
  ];

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken) return;
    // TODO: Implement order logic
    console.log("Placing order:", {
      token: selectedToken.id,
      type: orderType,
      amount,
      price,
    });
  };

  if (!connected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-dark-text mb-4">
          Connect your wallet to trade
        </h2>
        <p className="text-dark-text-secondary">
          Please connect your Solana wallet to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-dark-text mb-8">Marketplace</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-dark-secondary rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-primary">
                  <th className="px-6 py-3 text-left text-dark-text">Token</th>
                  <th className="px-6 py-3 text-right text-dark-text">Price</th>
                  <th className="px-6 py-3 text-right text-dark-text">
                    24h Change
                  </th>
                  <th className="px-6 py-3 text-right text-dark-text">
                    24h Volume
                  </th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => (
                  <tr
                    key={token.id}
                    className={`border-t border-gray-700 cursor-pointer hover:bg-gray-700 ${
                      selectedToken?.id === token.id ? "bg-gray-700" : ""
                    }`}
                    onClick={() => setSelectedToken(token)}
                  >
                    <td className="px-6 py-4 text-dark-text">
                      <div>
                        <div className="font-medium">{token.name}</div>
                        <div className="text-dark-text-secondary">
                          {token.symbol}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-dark-text">
                      {token.price.toFixed(8)} SOL
                    </td>
                    <td
                      className={`px-6 py-4 text-right ${
                        token.change24h >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {token.change24h >= 0 ? "+" : ""}
                      {token.change24h}%
                    </td>
                    <td className="px-6 py-4 text-right text-dark-text">
                      {token.volume24h.toLocaleString()} SOL
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-dark-secondary p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-dark-text mb-4">
            Place Order
          </h2>
          {selectedToken ? (
            <form onSubmit={handleOrder} className="space-y-4">
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-md ${
                    orderType === "buy"
                      ? "bg-green-500 text-white"
                      : "bg-dark-primary text-dark-text"
                  }`}
                  onClick={() => setOrderType("buy")}
                >
                  Buy
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-md ${
                    orderType === "sell"
                      ? "bg-red-500 text-white"
                      : "bg-dark-primary text-dark-text"
                  }`}
                  onClick={() => setOrderType("sell")}
                >
                  Sell
                </button>
              </div>

              <div>
                <label htmlFor="amount" className="block text-dark-text mb-2">
                  Amount ({selectedToken.symbol})
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-primary border border-gray-700 rounded-md text-dark-text focus:outline-none focus:border-dark-accent"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-dark-text mb-2">
                  Price (SOL)
                </label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-primary border border-gray-700 rounded-md text-dark-text focus:outline-none focus:border-dark-accent"
                  placeholder="Enter price"
                  required
                />
              </div>

              <div className="text-dark-text-secondary">
                <p>Total: {Number(amount) * Number(price)} SOL</p>
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-md text-white transition-colors ${
                  orderType === "buy"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {orderType === "buy" ? "Buy" : "Sell"} {selectedToken.symbol}
              </button>
            </form>
          ) : (
            <p className="text-dark-text-secondary">
              Select a token to place an order
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
