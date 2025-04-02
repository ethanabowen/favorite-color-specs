#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Check for required arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node generate.js <spec-file> <type>');
  console.error('where type is either "client" or "server"');
  process.exit(1);
}

const specFile = args[0];
const generationType = args[1].toLowerCase();

// Validate inputs
if (!fs.existsSync(specFile)) {
  console.error(`Error: Spec file "${specFile}" does not exist`);
  process.exit(1);
}

if (generationType !== 'client' && generationType !== 'server') {
  console.error('Error: Type must be either "client" or "server"');
  process.exit(1);
}

// Define output directories
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'generated', generationType);

// Create output directory if it doesn't exist
fs.ensureDirSync(outputDir);

// Get the local path to openapi-generator-cli
const openapiGenPath = path.join(rootDir, 'node_modules', '.bin', 'openapi-generator-cli');

// Function to generate TypeScript client
function generateClient(specPath, outputPath) {
  console.log(`Generating TypeScript client from ${specPath}...`);
  
  try {
    // Clean the output directory
    fs.emptyDirSync(outputPath);
    
    // Execute openapi-generator-cli to generate the TypeScript client
    const command = `${openapiGenPath} generate -i ${specPath} -g typescript-fetch -o ${outputPath} --additional-properties=typescriptThreePlus=true,supportsES6=true,npmName=favorite-color-api-client,npmVersion=1.0.0`;
    
    execSync(command, { stdio: 'inherit' });
    
    console.log(`TypeScript client successfully generated in ${outputPath}`);
  } catch (error) {
    console.error('Error generating client:', error);
    process.exit(1);
  }
}

// Function to generate TypeScript server
function generateServer(specPath, outputPath) {
  console.log(`Generating TypeScript server from ${specPath}...`);
  
  try {
    // Clean the output directory
    fs.emptyDirSync(outputPath);
    
    // Execute openapi-generator-cli to generate the TypeScript server
    const command = `${openapiGenPath} generate -i ${specPath} -g typescript-node -o ${outputPath} --additional-properties=npmName=favorite-color-api-server,npmVersion=1.0.0,supportsES6=true`;
    
    execSync(command, { stdio: 'inherit' });
    
    console.log(`TypeScript server successfully generated in ${outputPath}`);
  } catch (error) {
    console.error('Error generating server:', error);
    process.exit(1);
  }
}

// Execute the appropriate generation function based on type
if (generationType === 'client') {
  generateClient(specFile, outputDir);
} else {
  generateServer(specFile, outputDir);
} 