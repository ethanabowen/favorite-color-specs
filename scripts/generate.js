#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');
const { 
  serverPackageJsonContent, 
  tsconfigContent 
} = require('./configs');

// Check for required arguments
// Get command line arguments, excluding the first two (node executable and script path)
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node generate.js <type> <spec-file>');
  console.error('where type is either "client" or "server"');
  process.exit(1);
}

const specFile = args[1];
const generationType = args[0].toLowerCase();

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

// Function to generate TypeScript client using OpenAPI Generator
function generateClient(specPath, outputPath) {
  console.log(`Generating TypeScript client from ${specPath}...`);

  try {
    // Clean the output directory
    fs.emptyDirSync(outputPath);
    
    // Ensure OpenAPI Generator CLI is installed
    const openapiGenerator = path.join(rootDir, 'node_modules', '.bin', 'openapi-generator-cli');
    
    // Run OpenAPI Generator
    execSync(`${openapiGenerator} generate \
      -g typescript-axios \
      -i ${specPath} \
      -o ${outputPath} \
      --additional-properties=supportsES6=true,withInterfaces=true,npmName="${path.basename(rootDir)}-client",npmVersion=1.0.0`, 
      { stdio: 'inherit' }
    );

    console.log(`TypeScript client successfully generated in ${outputPath}`);
  } catch (error) {
    console.error('Error generating client:', error);
    process.exit(1);
  }
}

// Function to generate server code using OpenAPI Generator
function generateServer(specPath, outputPath) {
  console.log(`Generating TypeScript server from ${specPath}...`);

  try {
    // Clean the output directory
    fs.emptyDirSync(outputPath);
    
    // Ensure OpenAPI Generator CLI is installed
    const openapiGenerator = path.join(rootDir, 'node_modules', '.bin', 'openapi-generator-cli');
    
    // Run OpenAPI Generator
    execSync(`${openapiGenerator} generate \
      -g typescript-node \
      -i ${specPath} \
      -o ${outputPath} \
      --additional-properties=supportsES6=true,npmName="${path.basename(rootDir)}-server",npmVersion=1.0.0`, 
      { stdio: 'inherit' }
    );
    
    // Create or update tsconfig.json for the server
    const tsconfigPath = path.join(outputPath, 'tsconfig.json');
    fs.writeFileSync(tsconfigPath, tsconfigContent);
    
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