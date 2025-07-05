#!/usr/bin/env node

import { spawn } from 'child_process';

const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
});

// Handle server output
server.stdout.on('data', (data) => {
    console.log('Server response:', data.toString());
});

server.stderr.on('data', (data) => {
    console.error('Server error:', data.toString());
});

// Send initialize request
const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
        protocolVersion: '2024-11-05',
        capabilities: {
            tools: {},
            resources: {}
        },
        clientInfo: {
            name: 'test-client',
            version: '1.0.0'
        }
    }
};

console.log('Sending initialize request...');
server.stdin.write(JSON.stringify(initRequest) + '\n');

// Send list tools request after a delay
setTimeout(() => {
    const listToolsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
    };

    console.log('Sending tools/list request...');
    server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

    // Close after another delay
    setTimeout(() => {
        console.log('Closing server...');
        server.stdin.end();
    }, 2000);
}, 1000);

server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
});