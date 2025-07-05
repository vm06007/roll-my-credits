import { spawn, SpawnOptions } from "child_process";
import { HardhatResult } from "../types/index.js";
import { getCurrentProjectPath, DEFAULT_RPC_URL } from "../config/index.js";

export class ProcessRunner {

    static async runHardhatCommand(
        args: string[],
        options: {
            cwd?: string;
            env?: Record<string, string>;
            input?: string;
        } = {}
    ): Promise<HardhatResult> {
        return new Promise((resolve) => {
            const env = {
                ...process.env,
                ...(DEFAULT_RPC_URL && { HARDHAT_NETWORK: "localhost" }),
                ...options.env,
            };

            const spawnOptions: SpawnOptions = {
                cwd: options.cwd || getCurrentProjectPath(),
                env,
                stdio: ["pipe", "pipe", "pipe"],
            };

            const child = spawn("npx", ["hardhat", ...args], spawnOptions);

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

            if (options.input && child.stdin) {
                child.stdin.write(options.input);
                child.stdin.end();
            }

            child.on("close", (code) => {
                resolve({
                    stdout,
                    stderr,
                    exitCode: code || 0,
                });
            });
        });
    }

    static async runNpmCommand(
        args: string[],
        options: {
            cwd?: string;
            env?: Record<string, string>;
        } = {}
    ): Promise<HardhatResult> {
        return new Promise((resolve) => {
            const env = {
                ...process.env,
                ...options.env,
            };

            const spawnOptions: SpawnOptions = {
                cwd: options.cwd || getCurrentProjectPath(),
                env,
                stdio: ["pipe", "pipe", "pipe"],
            };

            const child = spawn("npm", args, spawnOptions);

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
                    stdout,
                    stderr,
                    exitCode: code || 0,
                });
            });
        });
    }
}