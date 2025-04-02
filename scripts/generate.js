#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

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
console.log(rootDir);
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
    
    const additionalProperties = {
      supportsES6: true,
      withInterfaces: true,
      npmName: `${path.basename(rootDir)}-client`,
      npmVersion: '1.0.0',
      apiDocs: "false",
      modelDocs: "false",
      apiTests: "false",
      modelTests: "false"
    }
    
    // Run OpenAPI Generator with disabled docs and tests
    execSync(`${openapiGenerator} generate \
      -g typescript-axios \
      -i ${specPath} \
      -o ${outputPath} \
      --skip-validate-spec \
      --enable-post-process-file \
      --ignore-file-override=${path.join(rootDir, '.openapi-generator-ignore')} \
      --additional-properties=${JSON.stringify(additionalProperties)}`, 
      { 
        stdio: 'inherit',
        env: {
          ...process.env,
          TS_POST_PROCESS_FILE: "prettier --write"
        }
      }
    );

    console.log(`TypeScript client successfully generated in ${outputPath}`);
  } catch (error) {
    console.error('Error generating client:', error);
    process.exit(1);
  }
}

// Function to generate server code using OpenAPI Generator
function generateServer(specPath, outputPath) {
  console.log(`Generating TypeScript Lambda server from ${specPath}...`);

  try {
    // Clean the output directory
    fs.emptyDirSync(outputPath);
    
    // Ensure OpenAPI Generator CLI is installed
    const openapiGenerator = path.join(rootDir, 'node_modules', '.bin', 'openapi-generator-cli');
    
    const additionalProperties = {
      supportsES6: true,
      npmName: `${path.basename(rootDir)}-server`,
      npmVersion: '1.0.0',
      apiDocs: "false",
      modelDocs: "false",
      apiTests: "false",
      modelTests: "false",
      // Lambda specific options
      useSingleRequestParameter: true,
      useObjectParameters: true,
      useExpress: true,
      useServerless: true
    }

    // Run OpenAPI Generator with Lambda-specific template
    execSync(`${openapiGenerator} generate \
      -g typescript-node \
      -i ${specPath} \
      -o ${outputPath} \
      --skip-validate-spec \
      --enable-post-process-file \
      --ignore-file-override=${path.join(rootDir, '.openapi-generator-ignore')} \
      --additional-properties=${JSON.stringify(additionalProperties)}`, 
      { 
        stdio: 'inherit',
        env: {
          ...process.env,
          TS_POST_PROCESS_FILE: "prettier --write"
        }
      }
    );

    // Add Lambda wrapper template
    const lambdaWrapperContent = `
import serverless from 'serverless-http';
import express from 'express';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { app } from './app';

// Create serverless handler
export const handler: APIGatewayProxyHandler = serverless(app);
`;

    fs.writeFileSync(
      path.join(outputPath, 'src', 'lambda.ts'),
      lambdaWrapperContent
    );
    
    // Add necessary dependencies to package.json
    const packageJsonPath = path.join(outputPath, 'package.json');
    const packageJson = require(packageJsonPath);
    packageJson.dependencies = {
      ...packageJson.dependencies,
      'serverless-http': '^3.1.1',
      '@types/aws-lambda': '^8.10.119'
    };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    console.log(`TypeScript Lambda server successfully generated in ${outputPath}`);
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