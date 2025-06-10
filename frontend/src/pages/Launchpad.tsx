import { FC, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface Launch {
  id: string;
  name: string;
  symbol: string;
  price: number;
  totalSupply: number;
  remainingSupply: number;
  startTime: number;
  endTime: number;
}

const Launchpad: FC = () => {
  const { connected } = useWallet();
  const [selectedLaunch, setSelectedLaunch] = useState<Launch | null>(null);
  const [amount, setAmount] = useState("");

  // Mock data - replace with actual data from your backend
  const launches: Launch[] = [
    {
      id: "1",
      name: "Doge Clone",
      symbol: "DOGE2",
      price: 0.0001,
      totalSupply: 1000000000,
      remainingSupply: 750000000,
      startTime: Date.now(),
      endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
    },
    // Add more mock launches here
  ];

  const handleParticipate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLaunch) return;
    // TODO: Implement participation logic
    console.log(
      "Participating in launch:",
      selectedLaunch.id,
      "Amount:",
      amount
    );
  };

  if (!connected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-dark-text mb-4">
          Connect your wallet to participate
        </h2>
        <p className="text-dark-text-secondary">
          Please connect your Solana wallet to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-dark-text mb-8">
        Active Launches
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {launches.map((launch) => (
            <div
              key={launch.id}
              className={`p-6 rounded-lg cursor-pointer transition-colors ${
                selectedLaunch?.id === launch.id
                  ? "bg-dark-accent"
                  : "bg-dark-secondary hover:bg-gray-700"
              }`}
              onClick={() => setSelectedLaunch(launch)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-dark-text">
                    {launch.name} ({launch.symbol})
                  </h3>
                  <p className="text-dark-text-secondary mt-1">
                    Price: {launch.price} SOL
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-dark-text-secondary">
                    Remaining: {launch.remainingSupply.toLocaleString()}
                  </p>
                  <p className="text-dark-text-secondary">
                    Total: {launch.totalSupply.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedLaunch && (
          <div className="bg-dark-secondary p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-dark-text mb-4">
              Participate in {selectedLaunch.name}
            </h2>
            <form onSubmit={handleParticipate} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-dark-text mb-2">
                  Amount (SOL)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-primary border border-gray-700 rounded-md text-dark-text focus:outline-none focus:border-dark-accent"
                  placeholder="Enter amount in SOL"
                  required
                />
              </div>
              <div className="text-dark-text-secondary">
                <p>
                  You will receive: {Number(amount) / selectedLaunch.price}{" "}
                  {selectedLaunch.symbol}
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-dark-accent text-white py-3 rounded-md hover:bg-blue-600 transition-colors"
              >
                Participate
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Launchpad;
