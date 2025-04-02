# Favorite Color API Specifications

This repository contains the OpenAPI specifications for the Favorite Color API and tools to generate TypeScript client and server code.

## Structure

- `specs/`: OpenAPI specification files
- `generated/`: Generated client and server code
- `scripts/`: Code generation scripts

## Getting Started

### Installation

```bash
npm install
```

### Generating Code

To generate the TypeScript client:

```bash
npm run generate:client
```

To generate the TypeScript server:

```bash
npm run generate:server
```

To generate both client and server:

```bash
npm run generate:all
```

Alternatively, you can directly use the script:

```bash
node scripts/generate.js specs/color-service.yaml client
node scripts/generate.js specs/color-service.yaml server
```

## Generated Code

### Client

The generated client provides TypeScript interfaces and API client methods for all operations defined in the OpenAPI specification.

### Server

The generated server provides a basic Express.js server with route handlers based on the OpenAPI specification.

## Code Generation Tools

This project supports multiple code generation tools:

### OpenAPI Generator

When Java is installed on your system, the project uses [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator), which is a powerful tool that generates API client libraries, server stubs, and documentation from OpenAPI specifications.

### Fallback Mechanism

If Java is not available on your system, the script will automatically fall back to:

- [openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen) for client generation
- A custom server generator based on [openapi-typescript](https://github.com/drwpow/openapi-typescript) for server code generation

This ensures you can generate code regardless of whether Java is installed on your system.

## Customization

You can customize the generation process by modifying the `generate.js` script. The script supports various options for both OpenAPI Generator (when Java is available) and the fallback mechanisms.

## About OpenAPI Generator

This project uses [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator), which is a powerful tool that generates API client libraries, server stubs, and documentation from OpenAPI specifications.

### Available Generators

OpenAPI Generator supports numerous programming languages and frameworks for both client and server generation. For a complete list, visit the [official documentation](https://openapi-generator.tech/docs/generators/).

### Customizing Generation

You can customize the generation process by modifying the `generate.js` script and adding additional properties. For more information on customization options, refer to the [OpenAPI Generator documentation](https://openapi-generator.tech/docs/customization/). 