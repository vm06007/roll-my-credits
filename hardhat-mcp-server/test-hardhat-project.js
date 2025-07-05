#!/usr/bin/env node

import { spawn } from 'child_process';

const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
});

let requestId = 0;
const pendingRequests = new Map();

// Handle server output
server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
        try {
            const response = JSON.parse(line);
            console.log('\n📥 Server response:', JSON.stringify(response, null, 2));

            const resolver = pendingRequests.get(response.id);
            if (resolver) {
                resolver(response);
                pendingRequests.delete(response.id);
            }
        } catch (e) {
            // Not JSON, ignore
        }
    });
});

server.stderr.on('data', (data) => {
    console.error('❌ Server error:', data.toString());
});

// Helper to send request and wait for response
function sendRequest(method, params = {}) {
    return new Promise((resolve) => {
        const id = ++requestId;
        const request = {
            jsonrpc: '2.0',
            id,
            method,
            params
        };

        console.log(`\n📤 Sending ${method} request...`);
        pendingRequests.set(id, resolve);
        server.stdin.write(JSON.stringify(request) + '\n');
    });
}

// Main test sequence
async function runTests() {
    try {
        // 1. Initialize
        console.log('🚀 Initializing MCP server...');
        await sendRequest('initialize', {
            protocolVersion: '2024-11-05',
            capabilities: {
                tools: {},
                resources: {}
            },
            clientInfo: {
                name: 'test-client',
                version: '1.0.0'
            }
        });

        // 2. Set project path
        console.log('\n📁 Setting project path to hardhat-example...');
        const projectPath = '/Users/vm06007/Development/roll-the-credits/hardhat-example';
        await sendRequest('tools/call', {
            name: 'set_project_path',
            arguments: {
                projectPath: projectPath
            }
        });

        // 3. Get project info
        console.log('\n📊 Getting project info...');
        await sendRequest('tools/call', {
            name: 'get_project_info',
            arguments: {}
        });

        // 4. Compile contracts
        console.log('\n🔨 Compiling Solidity contracts...');
        await sendRequest('tools/call', {
            name: 'hardhat_compile',
            arguments: {
                force: false
            }
        });

        // 5. Run tests
        console.log('\n🧪 Running TypeScript tests...');
        await sendRequest('tools/call', {
            name: 'hardhat_test',
            arguments: {}
        });

        // Wait a bit for final responses
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('\n✅ All tests completed!');
        server.stdin.end();

    } catch (error) {
        console.error('❌ Error:', error);
        server.stdin.end();
    }
}

// Start the test sequence
runTests();

server.on('close', (code) => {
    console.log(`\n🛑 Server exited with code ${code}`);
    process.exit(code);
});