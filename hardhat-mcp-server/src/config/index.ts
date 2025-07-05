import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables
export const DEFAULT_RPC_URL = process.env.RPC_URL || "";
export const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
export const PROJECT_PATH = process.env.HARDHAT_PROJECT_PATH ||
    path.join(path.dirname(path.dirname(__dirname)), "hardhat-example");

// Global state for dynamic project path
let currentProjectPath = PROJECT_PATH;

export function getCurrentProjectPath(): string {
    return (global as any).HARDHAT_PROJECT_PATH || currentProjectPath;
}

export function setCurrentProjectPath(newPath: string): void {
    currentProjectPath = newPath;
    (global as any).HARDHAT_PROJECT_PATH = newPath;
}