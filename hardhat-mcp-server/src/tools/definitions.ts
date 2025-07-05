import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const TOOL_DEFINITIONS: Tool[] = [
    // Project Management
    {
        name: "set_project_path",
        description: "Set the path to the Hardhat project directory",
        inputSchema: {
            type: "object",
            properties: {
                projectPath: {
                    type: "string",
                    description: "Path to the Hardhat project directory",
                },
            },
            required: ["projectPath"],
        },
    },
    {
        name: "get_project_info",
        description: "Get information about the current Hardhat project",
        inputSchema: {
            type: "object",
            properties: {},
        },
    },

    // Network Management
    {
        name: "hardhat_node_start",
        description: "Start a local Hardhat Network node",
        inputSchema: {
            type: "object",
            properties: {
                port: {
                    type: "number",
                    description: "Port to run the node on",
                    default: 8545,
                },
                hostname: {
                    type: "string",
                    description: "Hostname to bind to",
                    default: "127.0.0.1",
                },
                fork: {
                    type: "string",
                    description: "Fork from a network (e.g., mainnet, sepolia)",
                },
                forkBlockNumber: {
                    type: "number",
                    description: "Block number to fork from",
                },
            },
        },
    },
    {
        name: "hardhat_node_status",
        description: "Check if Hardhat Network node is running",
        inputSchema: {
            type: "object",
            properties: {},
        },
    },

    // Contract Operations
    {
        name: "hardhat_compile",
        description: "Compile smart contracts",
        inputSchema: {
            type: "object",
            properties: {
                force: {
                    type: "boolean",
                    description: "Force recompilation",
                    default: false,
                },
            },
        },
    },
    {
        name: "hardhat_deploy",
        description: "Deploy contracts using Hardhat Ignition",
        inputSchema: {
            type: "object",
            properties: {
                modulePath: {
                    type: "string",
                    description: "Path to the Ignition module",
                    default: "./ignition/modules/Deploy.js",
                },
                network: {
                    type: "string",
                    description: "Network to deploy to",
                    default: "hardhat",
                },
                parameters: {
                    type: "object",
                    description: "Parameters to pass to the module",
                },
            },
        },
    },
    {
        name: "hardhat_verify",
        description: "Verify contracts on block explorers",
        inputSchema: {
            type: "object",
            properties: {
                deploymentId: {
                    type: "string",
                    description: "Deployment ID to verify",
                },
                network: {
                    type: "string",
                    description: "Network where contracts are deployed",
                },
            },
        },
    },

    // Testing
    {
        name: "hardhat_test",
        description: "Run tests",
        inputSchema: {
            type: "object",
            properties: {
                testFiles: {
                    type: "array",
                    items: { type: "string" },
                    description: "Specific test files to run",
                },
                grep: {
                    type: "string",
                    description: "Only run tests matching this pattern",
                },
                network: {
                    type: "string",
                    description: "Network to run tests on",
                    default: "hardhat",
                },
            },
        },
    },

    // Console and Scripts
    {
        name: "hardhat_console",
        description: "Get command to open Hardhat console",
        inputSchema: {
            type: "object",
            properties: {
                network: {
                    type: "string",
                    description: "Network to connect to",
                    default: "hardhat",
                },
                noCompile: {
                    type: "boolean",
                    description: "Skip compilation",
                    default: false,
                },
            },
        },
    },
    {
        name: "hardhat_run_script",
        description: "Run a Hardhat script",
        inputSchema: {
            type: "object",
            properties: {
                scriptPath: {
                    type: "string",
                    description: "Path to the script file",
                },
                network: {
                    type: "string",
                    description: "Network to run script on",
                    default: "hardhat",
                },
            },
        },
    },

    // File Management
    {
        name: "create_contract",
        description: "Create or update a Solidity contract in the workspace",
        inputSchema: {
            type: "object",
            properties: {
                filename: {
                    type: "string",
                    description: "Name of the contract file (with .sol extension)",
                },
                content: {
                    type: "string",
                    description: "Solidity contract content",
                },
                directory: {
                    type: "string",
                    description: "Directory within contracts/ to place the file",
                    default: "",
                },
            },
            required: ["filename", "content"],
        },
    },
    {
        name: "create_test",
        description: "Create a test file",
        inputSchema: {
            type: "object",
            properties: {
                filename: {
                    type: "string",
                    description: "Name of the test file",
                },
                content: {
                    type: "string",
                    description: "Test content",
                },
                type: {
                    type: "string",
                    enum: ["javascript", "typescript", "solidity"],
                    description: "Type of test file",
                    default: "javascript",
                },
            },
            required: ["filename", "content"],
        },
    },
    {
        name: "create_ignition_module",
        description: "Create a Hardhat Ignition deployment module",
        inputSchema: {
            type: "object",
            properties: {
                filename: {
                    type: "string",
                    description: "Name of the module file",
                },
                content: {
                    type: "string",
                    description: "Ignition module content",
                },
            },
            required: ["filename", "content"],
        },
    },
    {
        name: "read_file",
        description: "Read a file from the workspace",
        inputSchema: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "Path to the file relative to workspace root",
                },
            },
            required: ["filePath"],
        },
    },
    {
        name: "list_files",
        description: "List files in the workspace",
        inputSchema: {
            type: "object",
            properties: {
                directory: {
                    type: "string",
                    description: "Directory to list (relative to workspace root)",
                    default: ".",
                },
                recursive: {
                    type: "boolean",
                    description: "List files recursively",
                    default: false,
                },
            },
        },
    },

    // Network Interaction
    {
        name: "eth_call",
        description: "Make a read-only call to a contract",
        inputSchema: {
            type: "object",
            properties: {
                to: {
                    type: "string",
                    description: "Contract address",
                },
                data: {
                    type: "string",
                    description: "Encoded function call data",
                },
                from: {
                    type: "string",
                    description: "Sender address",
                },
                network: {
                    type: "string",
                    description: "Network to use",
                    default: "hardhat",
                },
            },
            required: ["to", "data"],
        },
    },
    {
        name: "eth_send_transaction",
        description: "Send a transaction (requires PRIVATE_KEY)",
        inputSchema: {
            type: "object",
            properties: {
                to: {
                    type: "string",
                    description: "Recipient address",
                },
                data: {
                    type: "string",
                    description: "Transaction data",
                },
                value: {
                    type: "string",
                    description: "Value to send (in wei)",
                    default: "0",
                },
                network: {
                    type: "string",
                    description: "Network to use",
                    default: "hardhat",
                },
            },
            required: ["to"],
        },
    },
    {
        name: "eth_get_balance",
        description: "Get ETH balance of an address",
        inputSchema: {
            type: "object",
            properties: {
                address: {
                    type: "string",
                    description: "Address to check balance for",
                },
                network: {
                    type: "string",
                    description: "Network to use",
                    default: "hardhat",
                },
            },
            required: ["address"],
        },
    },
    {
        name: "eth_get_transaction_receipt",
        description: "Get transaction receipt",
        inputSchema: {
            type: "object",
            properties: {
                txHash: {
                    type: "string",
                    description: "Transaction hash",
                },
                network: {
                    type: "string",
                    description: "Network to use",
                    default: "hardhat",
                },
            },
            required: ["txHash"],
        },
    },

    // Utilities
    {
        name: "install_dependency",
        description: "Install an npm dependency",
        inputSchema: {
            type: "object",
            properties: {
                packageName: {
                    type: "string",
                    description: "Name of the package to install",
                },
                dev: {
                    type: "boolean",
                    description: "Install as dev dependency",
                    default: true,
                },
            },
            required: ["packageName"],
        },
    },
    {
        name: "hardhat_clean",
        description: "Clean artifacts and cache",
        inputSchema: {
            type: "object",
            properties: {},
        },
    },
    {
        name: "hardhat_flatten",
        description: "Flatten a contract and its dependencies",
        inputSchema: {
            type: "object",
            properties: {
                contractPath: {
                    type: "string",
                    description: "Path to the contract to flatten",
                },
            },
            required: ["contractPath"],
        },
    },
];