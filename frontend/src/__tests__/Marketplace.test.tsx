import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WalletProvider } from "../components/WalletProvider";
import Marketplace from "../pages/Marketplace";
import { useWallet } from "@solana/wallet-adapter-react";

jest.mock("@solana/wallet-adapter-react", () => ({
  useWallet: jest.fn(),
}));

describe("Marketplace", () => {
  const mockConnected = true;

  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: mockConnected,
    });
  });

  it("renders the marketplace page with token listings", () => {
    render(
      <WalletProvider>
        <Marketplace />
      </WalletProvider>
    );

    expect(screen.getByText("Marketplace")).toBeInTheDocument();
    expect(screen.getByText("Doge Clone")).toBeInTheDocument();
    expect(screen.getByText("DOGE2")).toBeInTheDocument();
  });

  it("shows connect wallet message when wallet is not connected", () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: false,
    });

    render(
      <WalletProvider>
        <Marketplace />
      </WalletProvider>
    );

    expect(
      screen.getByText("Connect your wallet to trade")
    ).toBeInTheDocument();
  });

  it("selects a token and shows order form", () => {
    render(
      <WalletProvider>
        <Marketplace />
      </WalletProvider>
    );

    // Click on a token
    fireEvent.click(screen.getByText("Doge Clone"));

    // Check if order form is shown
    expect(screen.getByText("Place Order")).toBeInTheDocument();
    expect(screen.getByText("Buy")).toBeInTheDocument();
    expect(screen.getByText("Sell")).toBeInTheDocument();
  });

  it("switches between buy and sell orders", () => {
    render(
      <WalletProvider>
        <Marketplace />
      </WalletProvider>
    );

    // Select a token
    fireEvent.click(screen.getByText("Doge Clone"));

    // Check initial state (Buy selected)
    expect(screen.getByText("Buy").closest("button")).toHaveClass(
      "bg-green-500"
    );

    // Switch to Sell
    fireEvent.click(screen.getByText("Sell"));
    expect(screen.getByText("Sell").closest("button")).toHaveClass(
      "bg-red-500"
    );
  });

  it("calculates total order value", async () => {
    render(
      <WalletProvider>
        <Marketplace />
      </WalletProvider>
    );

    // Select a token
    fireEvent.click(screen.getByText("Doge Clone"));

    // Input amount and price
    fireEvent.change(screen.getByLabelText("Amount (DOGE2)"), {
      target: { value: "1000" },
    });
    fireEvent.change(screen.getByLabelText("Price (SOL)"), {
      target: { value: "0.001" },
    });

    // Check if total is calculated
    await waitFor(() => {
      expect(screen.getByText("Total: 1 SOL")).toBeInTheDocument();
    });
  });

  it("handles order submission", async () => {
    const consoleSpy = jest.spyOn(console, "log");

    render(
      <WalletProvider>
        <Marketplace />
      </WalletProvider>
    );

    // Select a token
    fireEvent.click(screen.getByText("Doge Clone"));

    // Fill order form
    fireEvent.change(screen.getByLabelText("Amount (DOGE2)"), {
      target: { value: "1000" },
    });
    fireEvent.change(screen.getByLabelText("Price (SOL)"), {
      target: { value: "0.001" },
    });

    // Submit order
    fireEvent.click(screen.getByText("Buy DOGE2"));

    // Check if order was logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Placing order:", {
        token: expect.any(String),
        type: "buy",
        amount: "1000",
        price: "0.001",
      });
    });

    consoleSpy.mockRestore();
  });

  it("validates order form inputs", async () => {
    render(
      <WalletProvider>
        <Marketplace />
      </WalletProvider>
    );

    // Select a token
    fireEvent.click(screen.getByText("Doge Clone"));

    // Try to submit without filling the form
    fireEvent.click(screen.getByText("Buy DOGE2"));

    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByLabelText("Amount (DOGE2)")).toBeInvalid();
      expect(screen.getByLabelText("Price (SOL)")).toBeInvalid();
    });
  });

  it("displays token price changes correctly", () => {
    render(
      <WalletProvider>
        <Marketplace />
      </WalletProvider>
    );

    // Check if price change is displayed with correct color
    const priceChange = screen.getByText("+5.2%");
    expect(priceChange).toHaveClass("text-green-500");
  });
});
