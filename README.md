# Favorite Color API Specifications

This repository contains the OpenAPI specifications for the Favorite Color API and tools to generate TypeScript client and server code using OpenAPI Generator.

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

## About OpenAPI Generator

This project uses [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator), which is a powerful tool that generates API client libraries, server stubs, and documentation from OpenAPI specifications.

### Available Generators

OpenAPI Generator supports numerous programming languages and frameworks for both client and server generation. For a complete list, visit the [official documentation](https://openapi-generator.tech/docs/generators/).

### Customizing Generation

You can customize the generation process by modifying the `generate.js` script and adding additional properties. For more information on customization options, refer to the [OpenAPI Generator documentation](https://openapi-generator.tech/docs/customization/). 