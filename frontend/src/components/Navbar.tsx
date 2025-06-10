import { FC } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Navbar: FC = () => {
  const { connected } = useWallet();

  return (
    <nav className="bg-dark-secondary border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-dark-accent">
              AST Launchpad
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/create"
                className="text-dark-text hover:text-dark-accent px-3 py-2 rounded-md"
              >
                Create Token
              </Link>
              <Link
                to="/launchpad"
                className="text-dark-text hover:text-dark-accent px-3 py-2 rounded-md"
              >
                Launchpad
              </Link>
              <Link
                to="/marketplace"
                className="text-dark-text hover:text-dark-accent px-3 py-2 rounded-md"
              >
                Marketplace
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <WalletMultiButton className="!bg-dark-accent hover:!bg-blue-600" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
