import { FC, ReactNode, useMemo, createContext, useContext, useState, useEffect } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

require("@solana/wallet-adapter-react-ui/styles.css");

interface Props {
  children: React.ReactNode;
}

interface WalletState {
  connecting: boolean;
  publicKey: string | null;
}

const WalletContext = createContext<WalletState>({
  connecting: false,
  publicKey: null,
});

export const useWalletContext = () => useContext(WalletContext);

const WalletProviderComponent: FC<Props> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const solanaWallet = useSolanaWallet();

  useEffect(() => {
    if (solanaWallet && !solanaWallet.publicKey) {
      setError('Wallet not connected');
    } else {
      setError(null);
    }
  }, [solanaWallet]);

  const value = useMemo<WalletState>(() => ({
    connecting,
    publicKey: solanaWallet.publicKey?.toString() || null,
  }), [connecting, solanaWallet.publicKey]);

  useEffect(() => {
    if (solanaWallet) {
      try {
        const connectHandler = () => setConnecting(true);
        const disconnectHandler = () => setConnecting(false);

        // Handle connect/disconnect events
        solanaWallet.on('connect', connectHandler);
        solanaWallet.on('disconnect', disconnectHandler);

        return () => {
          solanaWallet.off('connect', connectHandler);
          solanaWallet.off('disconnect', disconnectHandler);
        };
      } catch (error) {
        console.error('Error setting up wallet events:', error);
        setConnecting(false);
      }
    }
  }, [solanaWallet]);

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-dark-primary text-dark-text">
      <div className="text-center p-4">
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-red-500">{error}</p>
      </div>
    </div>;
  }

  return (
    <WalletContext.Provider value={value}>
      <ConnectionProvider endpoint={endpoint}>
        <SolanaWalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </SolanaWalletProvider>
      </ConnectionProvider>
    </WalletContext.Provider>
  );
};

export const useWallet = useSolanaWallet;
export { WalletProviderComponent as WalletProvider };
