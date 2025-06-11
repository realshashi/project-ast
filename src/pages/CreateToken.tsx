import { FC, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const CreateToken: FC = () => {
  const { connected } = useWallet();
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    decimals: "9",
    totalSupply: "",
    imageUrl: "",
    description: "",
    website: "",
    twitter: "",
    telegram: "",
    initialPrice: "",
    curveType: "Linear" as const,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!connected) {
        throw new Error("Please connect your wallet first");
      }

      // Create token with metadata
      const tx = await program.methods
        .createMemecoin(
          formData.name,
          formData.symbol,
          Number(formData.decimals),
          new BN(formData.totalSupply),
          formData.imageUrl,
          formData.description || null
        )
        .rpc();

      // Create market listing with bonding curve
      await program.methods
        .createListing(
          new BN(formData.initialPrice),
          new BN(formData.totalSupply),
          formData.curveType,
          new BN(1) // Default k-value
        )
        .rpc();

      console.log("Token created successfully:", tx);
    } catch (err) {
      console.error("Error creating token:", err);
      setError(err instanceof Error ? err.message : "Failed to create token");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!connected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-dark-text mb-4">
          Connect your wallet to create a token
        </h2>
        <p className="text-dark-text-secondary">
          Please connect your Solana wallet to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-dark-text mb-8">
        Create New Token
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-dark-text mb-2">
            Token Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-dark-secondary border border-gray-700 rounded-md text-dark-text focus:outline-none focus:border-dark-accent"
            placeholder="e.g., My Awesome Token"
            required
          />
        </div>

        <div>
          <label htmlFor="symbol" className="block text-dark-text mb-2">
            Token Symbol
          </label>
          <input
            type="text"
            id="symbol"
            name="symbol"
            value={formData.symbol}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-dark-secondary border border-gray-700 rounded-md text-dark-text focus:outline-none focus:border-dark-accent"
            placeholder="e.g., MAT"
            required
          />
        </div>

        <div>
          <label htmlFor="decimals" className="block text-dark-text mb-2">
            Decimals
          </label>
          <input
            type="number"
            id="decimals"
            name="decimals"
            value={formData.decimals}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-dark-secondary border border-gray-700 rounded-md text-dark-text focus:outline-none focus:border-dark-accent"
            min="0"
            max="9"
            required
          />
        </div>

        <div>
          <label htmlFor="totalSupply" className="block text-dark-text mb-2">
            Total Supply
          </label>
          <input
            type="number"
            id="totalSupply"
            name="totalSupply"
            value={formData.totalSupply}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-dark-secondary border border-gray-700 rounded-md text-dark-text focus:outline-none focus:border-dark-accent"
            placeholder="e.g., 1000000000"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-dark-accent text-white py-3 rounded-md hover:bg-blue-600 transition-colors"
        >
          Create Token
        </button>
      </form>

      <div className="mt-8 p-4 bg-dark-secondary rounded-lg">
        <h3 className="text-lg font-semibold text-dark-text mb-2">
          Token Creation Tips
        </h3>
        <ul className="list-disc list-inside text-dark-text-secondary space-y-2">
          <li>Choose a unique and memorable name for your token</li>
          <li>Keep the symbol short and easy to remember</li>
          <li>Standard decimals for Solana tokens is 9</li>
          <li>
            Consider the total supply carefully as it cannot be changed later
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CreateToken;
