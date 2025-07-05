import { ProcessRunner } from "../utils/processRunner.js";
import { getCurrentProjectPath } from "../config/index.js";
import { ToolResponse } from "../types/index.js";

export class ContractHandlers {

    static async handleCompile(args: any): Promise<ToolResponse> {
        const { force = false } = args;
        const compileArgs = ["compile"];

        if (force) {
            compileArgs.push("--force");
        }

        const result = await ProcessRunner.runHardhatCommand(compileArgs);

        return {
            content: [
                {
                    type: "text",
                    text: `Compilation ${result.exitCode === 0 ? "successful" : "failed"}:\n${result.stdout}\n${result.stderr}`,
                },
            ],
        };
    }

    static async handleDeploy(args: any): Promise<ToolResponse> {
        const { modulePath = "./ignition/modules/Deploy.js", network = "hardhat", parameters } = args;

        const deployArgs = ["ignition", "deploy", modulePath];

        if (network !== "hardhat") {
            deployArgs.push("--network", network);
        }

        // TODO: Handle parameters properly
        if (parameters) {
            // This would require creating a parameters file
            console.log("Parameters passed but not yet implemented:", parameters);
        }

        const result = await ProcessRunner.runHardhatCommand(deployArgs);

        return {
            content: [
                {
                    type: "text",
                    text: `Deployment ${result.exitCode === 0 ? "successful" : "failed"}:\n${result.stdout}\n${result.stderr}`,
                },
            ],
        };
    }

    static async handleVerify(args: any): Promise<ToolResponse> {
        const { deploymentId, network } = args;

        if (!deploymentId) {
            throw new Error("deploymentId is required");
        }

        const verifyArgs = ["ignition", "verify", deploymentId];

        if (network) {
            verifyArgs.push("--network", network);
        }

        const result = await ProcessRunner.runHardhatCommand(verifyArgs);

        return {
            content: [
                {
                    type: "text",
                    text: `Verification ${result.exitCode === 0 ? "successful" : "failed"}:\n${result.stdout}\n${result.stderr}`,
                },
            ],
        };
    }

    static async handleTest(args: any): Promise<ToolResponse> {
        const { testFiles, grep, network = "hardhat" } = args;

        const testArgs = ["test"];

        if (testFiles && testFiles.length > 0) {
            testArgs.push(...testFiles);
        }

        if (grep) {
            testArgs.push("--grep", grep);
        }

        if (network !== "hardhat") {
            testArgs.push("--network", network);
        }

        const result = await ProcessRunner.runHardhatCommand(testArgs);

        return {
            content: [
                {
                    type: "text",
                    text: `Tests ${result.exitCode === 0 ? "passed" : "failed"}:\n${result.stdout}\n${result.stderr}`,
                },
            ],
        };
    }

    static async handleConsole(args: any): Promise<ToolResponse> {
        const { network = "hardhat", noCompile = false } = args;

        const consoleArgs = ["console"];

        if (network !== "hardhat") {
            consoleArgs.push("--network", network);
        }

        if (noCompile) {
            consoleArgs.push("--no-compile");
        }

        return {
            content: [
                {
                    type: "text",
                    text: `To open Hardhat console, run this command:\n\ncd ${getCurrentProjectPath()}\nnpx hardhat ${consoleArgs.join(" ")}`,
                },
            ],
        };
    }

    static async handleRunScript(args: any): Promise<ToolResponse> {
        const { scriptPath, network = "hardhat" } = args;

        if (!scriptPath) {
            throw new Error("scriptPath is required");
        }

        const runArgs = ["run", scriptPath];

        if (network !== "hardhat") {
            runArgs.push("--network", network);
        }

        const result = await ProcessRunner.runHardhatCommand(runArgs);

        return {
            content: [
                {
                    type: "text",
                    text: `Script execution ${result.exitCode === 0 ? "successful" : "failed"}:\n${result.stdout}\n${result.stderr}`,
                },
            ],
        };
    }

    static async handleClean(args: any): Promise<ToolResponse> {
        const result = await ProcessRunner.runHardhatCommand(["clean"]);

        return {
            content: [
                {
                    type: "text",
                    text: `Clean ${result.exitCode === 0 ? "successful" : "failed"}:\n${result.stdout}\n${result.stderr}`,
                },
            ],
        };
    }

    static async handleFlatten(args: any): Promise<ToolResponse> {
        const { contractPath } = args;

        if (!contractPath) {
            throw new Error("contractPath is required");
        }

        const result = await ProcessRunner.runHardhatCommand(["flatten", contractPath]);

        return {
            content: [
                {
                    type: "text",
                    text: `Flattened contract:\n${result.stdout}\n${result.stderr}`,
                },
            ],
        };
    }
}