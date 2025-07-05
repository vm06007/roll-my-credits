#!/usr/bin/env node
import { HardHatMCPServer } from './server/HardHatMCPServer.js';

const server = new HardHatMCPServer();
server.run().catch(console.error);