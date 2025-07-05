# CustomBIP39WordResolver - Testing and Deployment

This directory contains test and deployment scripts for the `CustomBIP39WordResolver` smart contract using Hardhat 3.0.

## Contract Overview

The `CustomBIP39WordResolver` contract allows users to:
- Send payments to the contract via the `pay()` function
- Track payment balances
- Allow the contract owner to withdraw accumulated funds
- Emit `PaymentReceived` events for payment tracking

## Test Files

### TypeScript Tests (`test/CustomBIP39WordResolver.ts`)
Uses Hardhat 3.0's viem integration for realistic blockchain simulation:

- **Deployment Test**: Verifies contract deploys successfully
- **Payment Test**: Tests payment acceptance and event emission
- **Withdrawal Test**: Tests owner withdrawal functionality
- **Balance Tracking**: Tests multiple payments and balance tracking

Run TypeScript tests:
```bash
npx hardhat test nodejs
```

### Solidity Tests (`contracts/CustomBIP39WordResolver.t.sol`)
Uses Foundry-style testing for fast, EVM-native unit tests:

- **Initial State**: Verifies contract deployment
- **Pay Function**: Tests payment acceptance
- **Event Emission**: Tests PaymentReceived event
- **Withdrawal**: Tests owner withdrawal
- **Access Control**: Tests only-owner withdrawal restriction
- **Multiple Payments**: Tests multiple user payments
- **Fuzz Testing**: Tests with random payment amounts

Run Solidity tests:
```bash
npx hardhat test solidity
```

## Deployment Scripts

### Manual Deployment (`scripts/deploy_CustomBIP39WordResolver.ts`)
Simple deployment script using viem:

```bash
npx hardhat run scripts/deploy_CustomBIP39WordResolver.ts
```

### Ignition Deployment (`ignition/modules/CustomBIP39WordResolver.ts`)
Declarative deployment using Hardhat Ignition:

```bash
npx hardhat ignition deploy ignition/modules/CustomBIP39WordResolver.ts
```

## Running All Tests

To run both TypeScript and Solidity tests:
```bash
npx hardhat test
```

## Contract Functions

- `pay()` - Accepts payments and emits PaymentReceived event
- `withdraw()` - Allows owner to withdraw all contract funds
- `balances[address]` - Mapping to track user payment balances

## Events

- `PaymentReceived(address from, uint256 amount)` - Emitted when payment is received

## Notes

- The contract uses `msg.sender` for access control on withdrawal
- All payments are tracked in the `balances` mapping
- The contract can receive ETH via the `pay()` function
- Only the contract owner can call `withdraw()`

## MCP Demo Screenshots

A set of demo screenshots is available in the [`hardhat-mcp-server/mcp-demo-screenshots`](../hardhat-mcp-server/mcp-demo-screenshots) folder. These images showcase the MCP server's UI and workflow, including contract deployment, payment flows, and batch processing features.

**To view the screenshots:**
- Open the `hardhat-mcp-server/mcp-demo-screenshots` directory in your file explorer.
- Example files:
    - `Screenshot 2025-07-06 at 1.21.34 AM.jpg`
    - `Screenshot 2025-07-06 at 1.21.49 AM.jpg`
    - `Screenshot 2025-07-06 at 1.21.57 AM.jpg`
    - `Screenshot 2025-07-06 at 1.22.59 AM.jpg`
    - `Screenshot 2025-07-06 at 1.23.20 AM.jpg`
    - `Screenshot 2025-07-06 at 1.25.19 AM.jpg`

These screenshots can be used for documentation, presentations, or to better understand the MCP server's capabilities and user interface.