#!/bin/bash

# Build script for Hardhat 3 MCP Server

set -e

echo "🔨 Building Hardhat 3 MCP Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or later."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or later is required. Current version: $(node -v)"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🏗️  Compiling TypeScript..."
npm run build

# Make the executable file executable
chmod +x dist/index.js

echo "✅ Build completed successfully!"
echo ""
echo "📖 Next steps:"
echo "1. Add the server to your MCP client configuration"
echo "2. Set environment variables (RPC_URL, PRIVATE_KEY) if needed"
echo "3. Restart your MCP client"
echo ""
echo "🚀 Server ready at: $(pwd)/dist/index.js"