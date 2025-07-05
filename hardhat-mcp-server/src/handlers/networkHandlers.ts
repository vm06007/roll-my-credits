import { getCurrentProjectPath } from "../config/index.js";
import { ToolResponse } from "../types/index.js";

export class NetworkHandlers {

    static async handleNodeStart(args: any): Promise<ToolResponse> {
        const { port = 8545, hostname = "127.0.0.1", fork, forkBlockNumber } = args;

        const nodeArgs = ["node", "--hostname", hostname, "--port", port.toString()];

        if (fork) {
            nodeArgs.push("--fork", fork);
            if (forkBlockNumber) {
                nodeArgs.push("--fork-block-number", forkBlockNumber.toString());
            }
        }

        return {
            content: [
                {
                    type: "text",
                    text: `To start Hardhat Network, run this command in a separate terminal:\n\ncd ${getCurrentProjectPath()}\nnpx hardhat ${nodeArgs.join(" ")}\n\nThis will start the node on ${hostname}:${port}`,
                },
            ],
        };
    }

    static async handleNodeStatus(args: any): Promise<ToolResponse> {
        try {
            // Try to connect to the node
            const response = await fetch("http://127.0.0.1:8545", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "eth_blockNumber",
                    params: [],
                    id: 1,
                }),
            });

            if (response.ok) {
                const data = await response.json() as { result: string };
                return {
                    content: [
                        {
                            type: "text",
                            text: `Hardhat Network is running. Current block: ${data.result}`,
                        },
                    ],
                };
            }
        } catch (error) {
            // Node is not running
        }

        return {
            content: [
                {
                    type: "text",
                    text: "Hardhat Network is not running",
                },
            ],
        };
    }
}