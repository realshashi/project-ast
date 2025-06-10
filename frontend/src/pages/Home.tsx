import { FC } from "react";
import { Link } from "react-router-dom";

const Home: FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-dark-text mb-4">
          Welcome to AST Launchpad
        </h1>
        <p className="text-xl text-dark-text-secondary mb-8">
          Create, launch, and trade memecoins on Solana
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="bg-dark-secondary p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-dark-accent mb-4">
            Create Token
          </h2>
          <p className="text-dark-text-secondary mb-4">
            Launch your own memecoin in minutes with our easy-to-use token
            creation tool.
          </p>
          <Link
            to="/create"
            className="inline-block bg-dark-accent text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Get Started
          </Link>
        </div>

        <div className="bg-dark-secondary p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-dark-accent mb-4">
            Launchpad
          </h2>
          <p className="text-dark-text-secondary mb-4">
            Participate in token launches and be among the first to get new
            memecoins.
          </p>
          <Link
            to="/launchpad"
            className="inline-block bg-dark-accent text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            View Launches
          </Link>
        </div>

        <div className="bg-dark-secondary p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-dark-accent mb-4">
            Marketplace
          </h2>
          <p className="text-dark-text-secondary mb-4">
            Trade memecoins in our decentralized marketplace with real-time
            price updates.
          </p>
          <Link
            to="/marketplace"
            className="inline-block bg-dark-accent text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Start Trading
          </Link>
        </div>
      </div>

      <div className="mt-16 bg-dark-secondary p-8 rounded-lg">
        <h2 className="text-2xl font-semibold text-dark-accent mb-4">
          Why Choose AST?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-medium text-dark-text mb-2">
              Easy Token Creation
            </h3>
            <p className="text-dark-text-secondary">
              Create your memecoin in minutes with our user-friendly interface.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-dark-text mb-2">
              Secure Trading
            </h3>
            <p className="text-dark-text-secondary">
              Trade with confidence using our secure and decentralized
              marketplace.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-dark-text mb-2">
              Fair Launches
            </h3>
            <p className="text-dark-text-secondary">
              Participate in fair token launches with transparent distribution.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium text-dark-text mb-2">
              Community Driven
            </h3>
            <p className="text-dark-text-secondary">
              Join a vibrant community of memecoin enthusiasts and traders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
