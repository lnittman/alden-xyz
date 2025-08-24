#!/usr/bin/env node

/**
 * Convex Project Initialization Script for Alden
 * This script automates the Convex project setup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Initializing Convex for Alden...\n');

// Check if we're in the right directory
if (!fs.existsSync('convex.json')) {
  console.error('❌ Error: convex.json not found. Make sure you\'re in packages/backend/');
  process.exit(1);
}

// Check if .env.local already exists with Convex URL
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  if (envContent.includes('CONVEX_DEPLOYMENT') && envContent.includes('prod:')) {
    console.log('✅ Convex project already configured!');
    console.log('📝 Your Convex URL is in .env.local');
    process.exit(0);
  }
}

console.log('📦 Installing Convex CLI if needed...');
try {
  execSync('npx convex --version', { stdio: 'ignore' });
} catch {
  console.log('Installing Convex CLI...');
  execSync('npm install -g convex', { stdio: 'inherit' });
}

console.log('\n🔧 Creating Convex project...');
console.log('Project name: alden-backend');
console.log('Team: personal (or select your team)\n');

// Create the project programmatically
const projectName = 'alden-backend-' + Date.now();
console.log(`Creating project: ${projectName}`);

try {
  // This will create a new project and generate the .env.local file
  execSync(`npx convex dev --once --configure=new --project=${projectName}`, {
    stdio: 'inherit',
    env: { ...process.env, CONVEX_DEPLOY_KEY: process.env.CONVEX_DEPLOY_KEY }
  });
} catch (error) {
  console.log('\n⚠️  If the automatic setup failed, run manually:');
  console.log('npx convex dev');
  console.log('\nThen follow the prompts to create a new project.');
}

// Check if .env.local was created
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const convexUrl = envContent.match(/CONVEX_DEPLOYMENT="([^"]+)"/)?.[1];
  
  if (convexUrl) {
    console.log('\n✅ Convex project created successfully!');
    console.log(`📝 Your Convex deployment: ${convexUrl}`);
    
    // Extract the URL
    const url = `https://${convexUrl.replace('prod:', '')}.convex.cloud`;
    console.log(`🔗 Your Convex URL: ${url}`);
    
    console.log('\n📋 Next steps:');
    console.log('1. Add this to apps/app/.env.local:');
    console.log(`   NEXT_PUBLIC_CONVEX_URL=${url}`);
    console.log('\n2. Add this to apps/ai/.env.local:');
    console.log(`   CONVEX_URL=${url}`);
    console.log('\n3. Configure Clerk in Convex Dashboard:');
    console.log('   https://dashboard.convex.dev/deployment/settings/environment-variables');
    console.log('   Add CLERK_ISSUER_URL from https://dashboard.clerk.com');
    console.log('\n4. Deploy to production:');
    console.log('   npx convex deploy');
  }
} else {
  console.log('\n⚠️  .env.local not created. Please run:');
  console.log('npx convex dev');
  console.log('And follow the prompts to set up your project.');
}