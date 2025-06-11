import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WalletProvider } from "../components/WalletProvider";
import Launchpad from "../pages/Launchpad";
import { useWallet } from "@solana/wallet-adapter-react";

jest.mock("@solana/wallet-adapter-react", () => ({
  useWallet: jest.fn(),
}));

describe("Launchpad", () => {
  const mockConnected = true;

  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: mockConnected,
    });
  });

  it("renders the launchpad page with active launches", () => {
    render(
      <WalletProvider>
        <Launchpad />
      </WalletProvider>
    );

    expect(screen.getByText("Active Launches")).toBeInTheDocument();
    expect(screen.getByText("Doge Clone")).toBeInTheDocument();
    expect(screen.getByText("DOGE2")).toBeInTheDocument();
  });

  it("shows connect wallet message when wallet is not connected", () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: false,
    });

    render(
      <WalletProvider>
        <Launchpad />
      </WalletProvider>
    );

    expect(
      screen.getByText("Connect your wallet to participate")
    ).toBeInTheDocument();
  });

  it("selects a launch and shows participation form", () => {
    render(
      <WalletProvider>
        <Launchpad />
      </WalletProvider>
    );

    // Click on a launch
    fireEvent.click(screen.getByText("Doge Clone"));

    // Check if participation form is shown
    expect(screen.getByText("Participate in Doge Clone")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount (SOL)")).toBeInTheDocument();
  });

  it("calculates token amount based on SOL input", async () => {
    render(
      <WalletProvider>
        <Launchpad />
      </WalletProvider>
    );

    // Select a launch
    fireEvent.click(screen.getByText("Doge Clone"));

    // Input SOL amount
    const amountInput = screen.getByLabelText("Amount (SOL)");
    fireEvent.change(amountInput, { target: { value: "1" } });

    // Check if token amount is calculated correctly
    await waitFor(() => {
      expect(
        screen.getByText(/You will receive: 10000 DOGE2/)
      ).toBeInTheDocument();
    });
  });

  it("handles participation submission", async () => {
    const consoleSpy = jest.spyOn(console, "log");

    render(
      <WalletProvider>
        <Launchpad />
      </WalletProvider>
    );

    // Select a launch
    fireEvent.click(screen.getByText("Doge Clone"));

    // Input amount and submit
    fireEvent.change(screen.getByLabelText("Amount (SOL)"), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByText("Participate"));

    // Check if participation was logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Participating in launch:",
        expect.any(String),
        "Amount:",
        "1"
      );
    });

    consoleSpy.mockRestore();
  });

  it("validates minimum and maximum participation amounts", async () => {
    render(
      <WalletProvider>
        <Launchpad />
      </WalletProvider>
    );

    // Select a launch
    fireEvent.click(screen.getByText("Doge Clone"));

    // Try to submit with invalid amount
    fireEvent.change(screen.getByLabelText("Amount (SOL)"), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByText("Participate"));

    // Check for validation message
    await waitFor(() => {
      expect(
        screen.getByText("Amount must be greater than 0")
      ).toBeInTheDocument();
    });
  });
});
