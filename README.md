# AST Launchpad

A decentralized token launchpad and marketplace platform built on Solana, featuring a modern dark-themed UI.

## Features

- Token Creation and Management
- Token Launchpad with Fair Distribution
- Decentralized Marketplace
- Dark-themed Modern UI
- Comprehensive Test Suite

## Smart Contracts

### Token Factory

- Create new tokens with customizable parameters
- Mint and burn tokens
- Transfer tokens between accounts
- Comprehensive test coverage including edge cases

### Launchpad

- Create token launches with customizable parameters
- Fair distribution mechanism
- Time-based launch windows
- Contribution limits
- Edge case handling for invalid parameters

### Marketplace

- List tokens for sale
- Buy listed tokens
- Price discovery mechanism
- Secure escrow system

## Frontend

Built with React, TypeScript, and Tailwind CSS, featuring:

- Dark theme with modern UI components
- Responsive design
- Wallet integration
- Real-time updates

## Testing

The project includes a comprehensive test suite:

### Smart Contract Tests

- Unit tests for all program functionality
- Edge case testing for:
  - Token creation and management
  - Launchpad parameters and timing
  - Marketplace operations
- Integration tests for cross-program interactions

### Frontend Tests

- Component testing with React Testing Library
- Integration tests for user flows
- Wallet connection testing
- Form validation testing

## Getting Started

### Prerequisites

- Node.js 16+
- Rust 1.70+
- Solana CLI tools
- Anchor Framework

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ast-launchpad.git
cd ast-launchpad
```

2. Install dependencies:

```bash
# Install Rust dependencies
cargo build

# Install frontend dependencies
cd frontend
npm install
```

3. Start local validator:

```bash
solana-test-validator
```

4. Build and deploy programs:

```bash
anchor build
anchor deploy
```

5. Start frontend development server:

```bash
cd frontend
npm run dev
```

## Testing

Run the test suite:

```bash
# Run smart contract tests
anchor test

# Run frontend tests
cd frontend
npm test
```

## Security

- All smart contracts are thoroughly tested
- Edge cases are handled explicitly
- Secure token transfer mechanisms
- Time-locked operations
- Contribution limits

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
