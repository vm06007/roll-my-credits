# Hardhat 3 MCP Server

A Model Context Protocol (MCP) server that provides Hardhat 3 development capabilities for LLM assistants. This server enables AI assistants to interact with the Hardhat ecosystem for smart contract development, testing, and deployment.

## Features

### 🔗 Network Management
- Start and manage local Hardhat Network nodes
- Check node status
- Support for network forking (mainnet, testnets)

### 📝 Smart Contract Development
- Create and manage Solidity contracts
- Compile contracts with Hardhat 3's improved compiler
- Flatten contracts and dependencies
- Clean artifacts and cache

### 🧪 Testing
- Run JavaScript, TypeScript, and Solidity tests
- Support for Hardhat 3's new testing framework
- Filter tests with grep patterns
- Test on different networks

### 🚀 Deployment
- Deploy contracts using Hardhat Ignition
- Verify contracts on block explorers
- Support for deployment parameters
- Multi-network deployment

### 🔧 Development Tools
- Interactive Hardhat console
- Run custom scripts
- File management (create, read, list)
- NPM package installation

### 🌐 Blockchain Interaction
- Make read-only contract calls
- Send transactions (with private key)
- Get account balances
- Retrieve transaction receipts

---

## 📸 MCP Server in Action

Below is a screenshot of the Hardhat MCP server being used in a real workflow. The UI shows contract deployment, test execution, and blockchain interaction tools available to LLM assistants and developers:

![MCP Demo Screenshot](mcp-demo-screenshots/Screenshot%202025-07-06%20at%201.21.34%E2%80%AFAM.jpg)

*Example: The MCP server interface displaying available tools and a successful contract deployment.*

---

## Prerequisites

- **Node.js v18+**
- **Hardhat 3** (install globally or use npx)
- **Git** (for cloning)

## Installation

1. **Clone and build the server:**
```bash
git clone <repository-url>
cd hardhat3-mcp-server
npm install
npm run build
```

2. **Configure your MCP client (e.g., Claude Desktop):**

Update your client configuration file:

```json
{
  "mcpServers": {
    "hardhat3": {
      "command": "node",
      "args": [
        "/path/to/hardhat3-mcp-server/dist/index.js"
      ],
      "env": {
        "RPC_URL": "https://mainnet.infura.io/v3/your-key",
        "PRIVATE_KEY": "0x1234567890abcdef..."
      }
    }
  }
}
```

3. **Restart your MCP client** to load the server.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `RPC_URL` | Default RPC URL for network connections | Optional |
| `PRIVATE_KEY` | Private key for sending transactions | Optional* |

*Required only for transaction-sending operations. **WARNING:** Never use keys with mainnet funds. Use only for development/testing.

## Workspace

The server maintains a persistent Hardhat workspace at `~/.mcp-hardhat-workspace` for all Solidity files, tests, scripts, and deployments.

## Available Tools

### Network Management
- `hardhat_node_start` - Start a local Hardhat Network
- `hardhat_node_status` - Check if node is running

### Contract Operations
- `hardhat_compile` - Compile smart contracts
- `hardhat_deploy` - Deploy using Hardhat Ignition
- `hardhat_verify` - Verify contracts on explorers
- `hardhat_clean` - Clean artifacts and cache
- `hardhat_flatten` - Flatten contract dependencies

### Testing
- `hardhat_test` - Run tests
- `hardhat_console` - Open interactive console
- `hardhat_run_script` - Execute scripts

### File Management
- `create_contract` - Create Solidity contracts
- `create_test` - Create test files
- `create_ignition_module` - Create deployment modules
- `read_file` - Read workspace files
- `list_files` - List workspace contents

### Blockchain Interaction
- `eth_call` - Read-only contract calls
- `eth_send_transaction` - Send transactions
- `eth_get_balance` - Get account balances
- `eth_get_transaction_receipt` - Get transaction receipts

### Utilities
- `install_dependency` - Install npm packages

## Usage Examples

Once connected to your MCP client, you can use natural language to interact with Hardhat:

### Project Setup
```
"Create a new ERC20 token contract called MyToken with initial supply of 1 million tokens"
```

### Testing
```
"Run tests for the MyToken contract and show me the results"
```

### Deployment
```
"Deploy the MyToken contract to a local Hardhat network"
```

### Interaction
```
"Check the balance of address 0x123... on the local network"
```

### Advanced Operations
```
"Fork mainnet and test interactions with the USDC contract"
```

## Hardhat 3 Features Supported

This MCP server leverages Hardhat 3's new capabilities:

- **Solidity Tests**: Support for Foundry-compatible Solidity testing
- **Multi-chain Support**: Configure different chain types (Ethereum, OP Stack)
- **ESM Support**: Modern JavaScript modules
- **Build Profiles**: Different compilation settings for different tasks
- **Improved Performance**: Rust-powered components
- **Enhanced Plugin System**: Better extensibility

## Security Warnings

⚠️ **IMPORTANT SECURITY NOTES:**

1. **Never use private keys with mainnet funds** - LLMs can make mistakes or be manipulated
2. **Use only for development and testing** - This is not audited production software
3. **Review all transactions** before confirming in production environments
4. **Keep private keys secure** - Consider using encrypted storage for keys

## Project Structure

```
hardhat3-mcp-server/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Development

To develop and extend the server:

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- [Hardhat](https://hardhat.org/) - Ethereum development environment
- [Model Context Protocol](https://modelcontextprotocol.io/) - Protocol specification
- [Foundry MCP Server](https://github.com/PraneshASP/foundry-mcp-server) - Inspiration and reference

## Disclaimer

This software is provided as-is without warranty. Users assume all risks associated with smart contract development and blockchain interactions. Always review code and test thoroughly before deploying to production networks.