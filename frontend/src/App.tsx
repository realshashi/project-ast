import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./components/WalletProvider";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CreateToken from "./pages/CreateToken";
import Launchpad from "./pages/Launchpad";
import Marketplace from "./pages/Marketplace";

function App() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-dark-primary text-dark-text">
        <Router>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateToken />} />
              <Route path="/launchpad" element={<Launchpad />} />
              <Route path="/marketplace" element={<Marketplace />} />
            </Routes>
          </main>
        </Router>
      </div>
    </WalletProvider>
  );
}

export default App;
