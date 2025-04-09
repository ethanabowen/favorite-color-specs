# typescript-specs-generator

This project manages OpenAPI specifications and generates TypeScript types/interfaces for both client and server components of the Any OpenAPI application.

## Project Structure

```
specs-generation/
├── generated/           # Generated TypeScript code
│   ├── client/         # Client-side TypeScript interfaces and API client
│   └── server/         # Server-side TypeScript interfaces and types
├── scripts/            # Code generation scripts
│   └── generate.js     # Main generation script
├── .openapi-generator-ignore  # OpenAPI generator ignore patterns
└── openapitools.json   # OpenAPI tools configuration
```

## Prerequisites

- Node.js 18.x
- OpenAPI Generator CLI (installed via npm)

## Installation

```bash
npm install
```

## Usage

### Generate Client Code

Generates TypeScript client code with Axios-based API client:

```bash
npm run generate:client openapi.yaml
```

This will generate:
- TypeScript interfaces for all models
- Axios-based API client
- Type-safe request and response handling
- ES6 module support

### Generate Server Code

Generates TypeScript server code with NestJS decorators:

```bash
npm run generate:server -- openapi.yaml
```

This will generate:
- TypeScript interfaces for all models
- NestJS service templates
- Request/response DTOs
- Type-safe parameter handling

## License

MIT
