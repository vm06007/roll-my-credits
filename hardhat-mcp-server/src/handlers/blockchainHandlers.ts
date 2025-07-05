import { promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";
import { getCurrentProjectPath, PRIVATE_KEY } from "../config/index.js";
import { ProcessRunner } from "../utils/processRunner.js";
import { ToolResponse } from "../types/index.js";

export class BlockchainHandlers {

    static async handleEthCall(args: any): Promise<ToolResponse> {
        const { to, data, from, network = "hardhat" } = args;

        // Create a simple script and run it
        const script = `
const hre = require("hardhat");

async function main() {
    const provider = hre.ethers.provider;
    const result = await provider.call({
        to: "${to}",
        data: "${data}",
        ${from ? `from: "${from}",` : ""}
    });
    console.log(result);
}

main().catch(console.error);
`;

        const scriptPath = path.join(getCurrentProjectPath(), "temp_call_script.js");
        await fs.writeFile(scriptPath, script, "utf8");

        const result = await ProcessRunner.runHardhatCommand(["run", "temp_call_script.js", "--network", network]);

        // Clean up
        try {
            await fs.unlink(scriptPath);
        } catch (e) {
            // Ignore cleanup errors
        }

        return {
            content: [
                {
                    type: "text",
                    text: `Call result:\n${result.stdout}\n${result.stderr}`,
                },
            ],
        };
    }

    static async handleEthSendTransaction(args: any): Promise<ToolResponse> {
        const { to, data = "0x", value = "0", network = "hardhat" } = args;

        if (!PRIVATE_KEY) {
            throw new Error("PRIVATE_KEY environment variable is required for sending transactions");
        }

        // Create a script to send the transaction
        const script = `
const hre = require("hardhat");

async function main() {
    const wallet = new hre.ethers.Wallet("${PRIVATE_KEY}", hre.ethers.provider);

    const tx = await wallet.sendTransaction({
        to: "${to}",
        data: "${data}",
        value: "${value}",
    });

    console.log("Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
}

main().catch(console.error);
`;

        const scriptPath = path.join(getCurrentProjectPath(), "temp_send_script.js");
        await fs.writeFile(scriptPath, script, "utf8");

        const result = await ProcessRunner.runHardhatCommand(["run", "temp_send_script.js", "--network", network]);

        // Clean up
        try {
            await fs.unlink(scriptPath);
        } catch (e) {
            // Ignore cleanup errors
        }

        return {
            content: [
                {
                    type: "text",
                    text: `Transaction result:\n${result.stdout}\n${result.stderr}`,
                },
            ],
        };
    }

    static async handleEthGetBalance(args: any): Promise<ToolResponse> {
        const { address, network = "hardhat" } = args;

        const script = `
const hre = require("hardhat");

async function main() {
    const balance = await hre.ethers.provider.getBalance("${address}");
    console.log("Balance (wei):", balance.toString());
    console.log("Balance (ETH):", hre.ethers.formatEther(balance));
}

main().catch(console.error);
`;

        const scriptPath = path.join(getCurrentProjectPath(), "temp_balance_script.js");
        await fs.writeFile(scriptPath, script, "utf8");

        const result = await ProcessRunner.runHardhatCommand(["run", "temp_balance_script.js", "--network", network]);

        // Clean up
        try {
            await fs.unlink(scriptPath);
        } catch (e) {
            // Ignore cleanup errors
        }

        return {
            content: [
                {
                    type: "text",
                    text: `Balance result:\n${result.stdout}\n${result.stderr}`,
                },
            ],
        };
    }

    static async handleEthGetTransactionReceipt(args: any): Promise<ToolResponse> {
        const { txHash, network = "hardhat" } = args;

        const script = `
const hre = require("hardhat");

async function main() {
    const receipt = await hre.ethers.provider.getTransactionReceipt("${txHash}");
    console.log(JSON.stringify(receipt, null, 2));
}

main().catch(console.error);
`;

        const scriptPath = path.join(getCurrentProjectPath(), "temp_receipt_script.js");
        await fs.writeFile(scriptPath, script, "utf8");

        const result = await ProcessRunner.runHardhatCommand(["run", "temp_receipt_script.js", "--network", network]);

        // Clean up
        try {
            await fs.unlink(scriptPath);
        } catch (e) {
            // Ignore cleanup errors
        }

        return {
            content: [
                {
                    type: "text",
                    text: `Receipt result:\n${result.stdout}\n${result.stderr}`,
                },
            ],
        };
    }

    static async handleInstallDependency(args: any): Promise<ToolResponse> {
        const { packageName, dev = true } = args;

        const installArgs = ["install"];
        if (dev) {
            installArgs.push("--save-dev");
        }
        installArgs.push(packageName);

        return new Promise<ToolResponse>((resolve) => {
            const child = spawn("npm", installArgs, {
                cwd: getCurrentProjectPath(),
                stdio: ["pipe", "pipe", "pipe"],
            });

            let stdout = "";
            let stderr = "";

            if (child.stdout) {
                child.stdout.on("data", (data) => {
                    stdout += data.toString();
                });
            }

            if (child.stderr) {
                child.stderr.on("data", (data) => {
                    stderr += data.toString();
                });
            }

            child.on("close", (code) => {
                resolve({
                    content: [
                        {
                            type: "text",
                            text: `Package installation ${code === 0 ? "successful" : "failed"}:\n${stdout}\n${stderr}`,
                        },
                    ],
                });
            });
        });
    }
}