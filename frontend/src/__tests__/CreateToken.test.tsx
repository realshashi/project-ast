import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WalletProvider } from "../components/WalletProvider";
import CreateToken from "../pages/CreateToken";
import { useWallet } from "@solana/wallet-adapter-react";

// Mock the wallet adapter
jest.mock("@solana/wallet-adapter-react", () => ({
  useWallet: jest.fn(),
}));

describe("CreateToken", () => {
  const mockConnected = true;

  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: mockConnected,
    });
  });

  it("renders the create token form when wallet is connected", () => {
    render(
      <WalletProvider>
        <CreateToken />
      </WalletProvider>
    );

    expect(screen.getByText("Create New Token")).toBeInTheDocument();
    expect(screen.getByLabelText("Token Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Token Symbol")).toBeInTheDocument();
    expect(screen.getByLabelText("Decimals")).toBeInTheDocument();
    expect(screen.getByLabelText("Total Supply")).toBeInTheDocument();
  });

  it("shows connect wallet message when wallet is not connected", () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: false,
    });

    render(
      <WalletProvider>
        <CreateToken />
      </WalletProvider>
    );

    expect(
      screen.getByText("Connect your wallet to create a token")
    ).toBeInTheDocument();
  });

  it("handles form submission", async () => {
    const consoleSpy = jest.spyOn(console, "log");

    render(
      <WalletProvider>
        <CreateToken />
      </WalletProvider>
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText("Token Name"), {
      target: { value: "Test Token" },
    });
    fireEvent.change(screen.getByLabelText("Token Symbol"), {
      target: { value: "TEST" },
    });
    fireEvent.change(screen.getByLabelText("Decimals"), {
      target: { value: "9" },
    });
    fireEvent.change(screen.getByLabelText("Total Supply"), {
      target: { value: "1000000000" },
    });

    // Submit the form
    fireEvent.click(screen.getByText("Create Token"));

    // Check if the form data was logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Creating token:", {
        name: "Test Token",
        symbol: "TEST",
        decimals: "9",
        totalSupply: "1000000000",
      });
    });

    consoleSpy.mockRestore();
  });

  it("validates required fields", async () => {
    render(
      <WalletProvider>
        <CreateToken />
      </WalletProvider>
    );

    // Try to submit without filling the form
    fireEvent.click(screen.getByText("Create Token"));

    // Check if the form validation is working
    await waitFor(() => {
      expect(screen.getByLabelText("Token Name")).toBeInvalid();
      expect(screen.getByLabelText("Token Symbol")).toBeInvalid();
      expect(screen.getByLabelText("Total Supply")).toBeInvalid();
    });
  });
});
