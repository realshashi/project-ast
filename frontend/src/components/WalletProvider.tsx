import { FC, ReactNode, useMemo, createContext, useContext, useState, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useWallet as useSolanaWallet,
} from "@solana/wallet-adapter-react";
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
  const solanaWallet = useSolanaWallet();

  const value = useMemo<WalletState>(() => ({
    connecting,
    publicKey: solanaWallet.publicKey?.toString() || null,
  }), [connecting, solanaWallet.publicKey]);

  useEffect(() => {
    if (solanaWallet) {
      const connectHandler = () => setConnecting(true);
      const disconnectHandler = () => setConnecting(false);
      
      (solanaWallet as any).on('connect', connectHandler);
      (solanaWallet as any).on('disconnect', disconnectHandler);

      return () => {
        (solanaWallet as any).off('connect', connectHandler);
        (solanaWallet as any).off('disconnect', disconnectHandler);
      };
    }
  }, [solanaWallet]);

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
