import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    CallToolRequest,
    CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from "fs";

import { TOOL_DEFINITIONS } from "../tools/definitions.js";
import { ProjectHandlers } from "../handlers/projectHandlers.js";
import { NetworkHandlers } from "../handlers/networkHandlers.js";
import { ContractHandlers } from "../handlers/contractHandlers.js";
import { FileHandlers } from "../handlers/fileHandlers.js";
import { BlockchainHandlers } from "../handlers/blockchainHandlers.js";
import { getCurrentProjectPath } from "../config/index.js";

export class HardHatMCPServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: "hardhat-mcp-server",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupToolHandlers();
        this.initializeWorkspace();
    }

    private async initializeWorkspace(): Promise<void> {
        try {
            await fs.access(getCurrentProjectPath());
            // Project directory exists, check if it's a Hardhat project
            try {
                const packageJsonPath = getCurrentProjectPath() + "/package.json";
                await fs.access(packageJsonPath);
                // It's an existing project
            } catch {
                // Directory exists but no package.json, might need initialization
            }
        } catch {
            // Project directory doesn't exist, we can create it if needed
        }
    }

    private setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: TOOL_DEFINITIONS,
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest): Promise<CallToolResult> => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    // Project Management
                    case "set_project_path":
                        return await ProjectHandlers.handleSetProjectPath(args || {});
                    case "get_project_info":
                        return await ProjectHandlers.handleGetProjectInfo(args || {});

                    // Network Management
                    case "hardhat_node_start":
                        return await NetworkHandlers.handleNodeStart(args || {});
                    case "hardhat_node_status":
                        return await NetworkHandlers.handleNodeStatus(args || {});

                    // Contract Operations
                    case "hardhat_compile":
                        return await ContractHandlers.handleCompile(args || {});
                    case "hardhat_deploy":
                        return await ContractHandlers.handleDeploy(args || {});
                    case "hardhat_verify":
                        return await ContractHandlers.handleVerify(args || {});
                    case "hardhat_test":
                        return await ContractHandlers.handleTest(args || {});
                    case "hardhat_console":
                        return await ContractHandlers.handleConsole(args || {});
                    case "hardhat_run_script":
                        return await ContractHandlers.handleRunScript(args || {});
                    case "hardhat_clean":
                        return await ContractHandlers.handleClean(args || {});
                    case "hardhat_flatten":
                        return await ContractHandlers.handleFlatten(args || {});

                    // File Management
                    case "create_contract":
                        return await FileHandlers.handleCreateContract(args || {});
                    case "create_test":
                        return await FileHandlers.handleCreateTest(args || {});
                    case "create_ignition_module":
                        return await FileHandlers.handleCreateIgnitionModule(args || {});
                    case "read_file":
                        return await FileHandlers.handleReadFile(args || {});
                    case "list_files":
                        return await FileHandlers.handleListFiles(args || {});

                    // Blockchain Interaction
                    case "eth_call":
                        return await BlockchainHandlers.handleEthCall(args || {});
                    case "eth_send_transaction":
                        return await BlockchainHandlers.handleEthSendTransaction(args || {});
                    case "eth_get_balance":
                        return await BlockchainHandlers.handleEthGetBalance(args || {});
                    case "eth_get_transaction_receipt":
                        return await BlockchainHandlers.handleEthGetTransactionReceipt(args || {});
                    case "install_dependency":
                        return await BlockchainHandlers.handleInstallDependency(args || {});

                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}