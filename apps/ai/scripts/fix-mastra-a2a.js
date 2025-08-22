#!/usr/bin/env node

/**
 * Fix for Mastra A2A bundler issue
 * 
 * The Mastra bundler creates a virtual module that imports 'A2AError',
 * but @mastra/core/dist/a2a/index.js only exports 'MastraA2AError'.
 * This script adds the missing export alias.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const a2aFilePath = path.join(__dirname, '../node_modules/@mastra/core/dist/a2a/index.js');

try {
  // Read the file
  let content = fs.readFileSync(a2aFilePath, 'utf8');
  
  // Check if already patched
  if (content.includes('A2AError };')) {
    console.log('✓ @mastra/core A2A module already patched');
    process.exit(0);
  }
  
  // Replace the export statement
  content = content.replace(
    'export { MastraA2AError };',
    'export { MastraA2AError, MastraA2AError as A2AError };'
  );
  
  // Write back
  fs.writeFileSync(a2aFilePath, content, 'utf8');
  console.log('✓ Patched @mastra/core A2A module to add A2AError export');
} catch (error) {
  if (error.code === 'ENOENT') {
    console.warn('⚠ @mastra/core not installed yet, skipping patch');
    process.exit(0);
  }
  console.error('✗ Failed to patch @mastra/core:', error.message);
  process.exit(1);
}