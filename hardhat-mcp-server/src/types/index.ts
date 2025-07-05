import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export interface HardhatResult {
    stdout: string;
    stderr: string;
    exitCode: number;
}

export interface ProjectConfig {
    name: string;
    version: string;
    description: string;
    private: boolean;
    type: string;
    scripts: Record<string, string>;
    devDependencies: Record<string, string>;
}

export type ToolResponse = CallToolResult;