import { promises as fs } from "fs";
import path from "path";
import { getCurrentProjectPath, setCurrentProjectPath } from "../config/index.js";
import { ToolResponse } from "../types/index.js";

export class ProjectHandlers {

    static async handleSetProjectPath(args: any): Promise<ToolResponse> {
        const { projectPath } = args;

        try {
            // Resolve the path
            const resolvedPath = path.resolve(projectPath);
            await fs.access(resolvedPath);

            // Update the global workspace path
            setCurrentProjectPath(resolvedPath);

            return {
                content: [
                    {
                        type: "text",
                        text: `Project path set to: ${resolvedPath}`,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error: Directory ${projectPath} does not exist`,
                    },
                ],
            };
        }
    }

    static async handleGetProjectInfo(args: any): Promise<ToolResponse> {
        const currentPath = getCurrentProjectPath();

        try {
            // Check if it's a Hardhat project
            const packageJsonPath = path.join(currentPath, "package.json");
            const configPaths = [
                path.join(currentPath, "hardhat.config.ts"),
                path.join(currentPath, "hardhat.config.js"),
            ];

            let hasPackageJson = false;
            let hasHardhatConfig = false;
            let packageInfo = {};

            try {
                const packageContent = await fs.readFile(packageJsonPath, "utf8");
                packageInfo = JSON.parse(packageContent);
                hasPackageJson = true;
            } catch {
                // No package.json
            }

            for (const configPath of configPaths) {
                try {
                    await fs.access(configPath);
                    hasHardhatConfig = true;
                    break;
                } catch {
                    // Continue checking
                }
            }

            const isHardhatProject = hasPackageJson && hasHardhatConfig;

            return {
                content: [
                    {
                        type: "text",
                        text: `Current project: ${currentPath}\nIs Hardhat project: ${isHardhatProject}\nHas package.json: ${hasPackageJson}\nHas Hardhat config: ${hasHardhatConfig}\nProject info: ${JSON.stringify(packageInfo, null, 2)}`,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error checking project: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    }
}