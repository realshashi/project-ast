import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { WalletProvider, useWalletContext } from "./components/WalletProvider";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CreateToken from "./pages/CreateToken";
import Launchpad from "./pages/Launchpad";
import Marketplace from "./pages/Marketplace";
import ErrorBoundary from "./components/ErrorBoundary";
import Loading from "./components/Loading";


interface RouteConfig {
  path: string;
  component: JSX.Element;
  requiresWallet: boolean;
}

const routes: RouteConfig[] = [
  { path: "/", component: <Home />, requiresWallet: false },
  { path: "/create-token", component: <CreateToken />, requiresWallet: true },
  { path: "/launchpad", component: <Launchpad />, requiresWallet: true },
  { path: "/marketplace", component: <Marketplace />, requiresWallet: true },
];

function App() {
  const { connecting, publicKey } = useWalletContext();
  const location = useLocation();

  if (connecting) return <Loading />;

  return (
    <Router>
      <div className="min-h-screen bg-dark-primary text-dark-text">
        <ErrorBoundary>
          <WalletProvider>
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                {routes.map(({ path, component }) => (
                  <Route key={path} path={path} element={<ErrorBoundary>{component}</ErrorBoundary>} />
                ))}
              </Routes>
            </main>
          </WalletProvider>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
