import { promises as fs } from "fs";
import path from "path";
import { getCurrentProjectPath } from "../config/index.js";
import { ToolResponse } from "../types/index.js";

export class FileHandlers {

    static async handleCreateContract(args: any): Promise<ToolResponse> {
        const { filename, content, directory = "" } = args;

        const contractsDir = path.join(getCurrentProjectPath(), "contracts", directory);
        await fs.mkdir(contractsDir, { recursive: true });

        const filePath = path.join(contractsDir, filename);
        await fs.writeFile(filePath, content, "utf8");

        return {
            content: [
                {
                    type: "text",
                    text: `Contract created at: ${path.relative(getCurrentProjectPath(), filePath)}`,
                },
            ],
        };
    }

    static async handleCreateTest(args: any): Promise<ToolResponse> {
        const { filename, content, type = "javascript" } = args;

        const testDir = path.join(getCurrentProjectPath(), "test");
        await fs.mkdir(testDir, { recursive: true });

        let extension = ".js";
        if (type === "typescript") extension = ".ts";
        if (type === "solidity") extension = ".sol";

        const finalFilename = filename.endsWith(extension) ? filename : filename + extension;
        const filePath = path.join(testDir, finalFilename);
        await fs.writeFile(filePath, content, "utf8");

        return {
            content: [
                {
                    type: "text",
                    text: `Test file created at: ${path.relative(getCurrentProjectPath(), filePath)}`,
                },
            ],
        };
    }

    static async handleCreateIgnitionModule(args: any): Promise<ToolResponse> {
        const { filename, content } = args;

        const ignitionDir = path.join(getCurrentProjectPath(), "ignition", "modules");
        await fs.mkdir(ignitionDir, { recursive: true });

        const filePath = path.join(ignitionDir, filename);
        await fs.writeFile(filePath, content, "utf8");

        return {
            content: [
                {
                    type: "text",
                    text: `Ignition module created at: ${path.relative(getCurrentProjectPath(), filePath)}`,
                },
            ],
        };
    }

    static async handleReadFile(args: any): Promise<ToolResponse> {
        const { filePath } = args;

        const fullPath = path.join(getCurrentProjectPath(), filePath);
        const content = await fs.readFile(fullPath, "utf8");

        return {
            content: [
                {
                    type: "text",
                    text: content,
                },
            ],
        };
    }

    static async handleListFiles(args: any): Promise<ToolResponse> {
        const { directory = ".", recursive = false } = args;

        const targetDir = path.join(getCurrentProjectPath(), directory);

        const listDir = async (dir: string, prefix = ""): Promise<string[]> => {
            const files: string[] = [];
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.join(prefix, entry.name);

                if (entry.isDirectory()) {
                    if (recursive) {
                        const subFiles = await listDir(fullPath, relativePath);
                        files.push(`${relativePath}/`, ...subFiles);
                    } else {
                        files.push(`${relativePath}/`);
                    }
                } else {
                    files.push(relativePath);
                }
            }

            return files;
        };

        const files = await listDir(targetDir);

        return {
            content: [
                {
                    type: "text",
                    text: files.join("\n"),
                },
            ],
        };
    }
}