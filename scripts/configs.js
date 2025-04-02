// Server package.json template
const path = require('path');

/* Configurations are semi-static, so we can generate them here and shove them into the generated code */
exports.serverPackageJsonContent = (specPath) => {
  // Extract a project name from the spec file path
  const fileName = path.basename(specPath, path.extname(specPath));
  const projectName = fileName.replace(/-/g, ' ').replace(/_/g, ' ');
  const formattedProjectName = projectName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return `
{
  "name": "${fileName}-lambda-handler",
  "version": "1.0.0",
  "description": "Generated Lambda handler for ${formattedProjectName} API",
  "main": "index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "aws-lambda": "^1.0.7",
    "openapi-backend": "^5.10.0",
    "js-yaml": "^4.1.0"
  },
  "devDependencies": {
    "@types/aws-lambda": "^8.10.119",
    "typescript": "^5.2.2",
    "ts-node": "^10.9.1",
    "openapi-typescript": "^6.2.0"
  }
}
`;
};

// Client generation options for hey-api/openapi-ts
exports.clientOptions = () => {
  return {
    // Input will be set dynamically in generate.js
    input: '',
    
    // Output configuration - can be a string or an object
    output: {
      path: '', // Will be set dynamically in generate.js
      clean: true,
      format: 'prettier', // Format output with prettier
    },
    
    // Plugins - core functionality extensions
    plugins: [
      '@hey-api/client-axios' // Use Axios client plugin
    ],
    
    // Optional lifecycle hooks
    hooks: {
      'pre:generate': () => console.log('Starting client generation...'),
      'post:generate': () => console.log('Client generation completed!')
    }
  };
};

// Consolidated Lambda handler template
exports.consolidatedLambdaHandler = (spec) => {
  // Generate route handlers
  const routeHandlers = [];
  
  Object.keys(spec.paths).forEach(pathKey => {
    const pathObj = spec.paths[pathKey];
    Object.keys(pathObj).forEach(method => {
      if (method === 'options') return;
      
      const operation = pathObj[method];
      const operationId = operation.operationId || 
        `${method}${pathKey.replace(/\//g, '_').replace(/[{}]/g, '')}`;
      
      // Create normalized path for matching
      const normalizedPath = pathKey
        .replace(/{([^}]+)}/g, ':$1') // Convert {param} to :param for easier matching
        .replace(/^\//, '');           // Remove leading slash
      
      routeHandlers.push({
        method: method.toUpperCase(),
        path: normalizedPath,
        operationId,
        statusCode: method.toLowerCase() === 'post' ? 201 : 200
      });
    });
  });
  
  // Generate the handler function
  return `
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { components } from './types/schema';

// Router configuration
const routes = [
${routeHandlers.map(handler => `  {
    method: '${handler.method}',
    path: '${handler.path}',
    handler: handle${handler.operationId.charAt(0).toUpperCase() + handler.operationId.slice(1)},
    statusCode: ${handler.statusCode}
  }`).join(',\n')}
];

// Main handler function
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Extract path and method from the event
    const path = event.path.replace(/^\\/*/, '');
    const method = event.httpMethod;
    
    // Find matching route
    const route = findRoute(path, method);
    
    if (route) {
      // Handle the request with the appropriate handler
      return await route.handler(event, route.pathParams);
    }
    
    // No matching route found
    return {
      statusCode: 404,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        statusCode: 404,
        message: \`Route not found: \${method} \${path}\`
      })
    };
  } catch (error) {
    console.error('Error handling request:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        statusCode: 500,
        message: 'Internal server error'
      })
    };
  }
};

// Helper function to find matching route and extract path parameters
function findRoute(path: string, method: string) {
  for (const route of routes) {
    if (route.method !== method) continue;
    
    const routePathSegments = route.path.split('/');
    const requestPathSegments = path.split('/');
    
    // Skip if segment lengths don't match
    if (routePathSegments.length !== requestPathSegments.length) continue;
    
    const pathParams: Record<string, string> = {};
    let match = true;
    
    for (let i = 0; i < routePathSegments.length; i++) {
      const routeSegment = routePathSegments[i];
      const requestSegment = requestPathSegments[i];
      
      // Parameter segment (starts with :)
      if (routeSegment.startsWith(':')) {
        const paramName = routeSegment.substring(1);
        pathParams[paramName] = requestSegment;
        continue;
      }
      
      // Exact match segment
      if (routeSegment !== requestSegment) {
        match = false;
        break;
      }
    }
    
    if (match) {
      return { ...route, pathParams };
    }
  }
  
  return null;
}

// Helper function for CORS headers
function getCorsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  };
}

${routeHandlers.map(handler => `
// Handler for ${handler.method} ${handler.path}
async function handle${handler.operationId.charAt(0).toUpperCase() + handler.operationId.slice(1)}(
  event: APIGatewayProxyEvent, 
  pathParams: Record<string, string>
): Promise<APIGatewayProxyResult> {
  try {
    // TODO: Implement ${handler.operationId} logic
    ${handler.method === 'GET' ? `
    // Sample response
    const response = [];` : `
    // Parse the incoming request body
    const requestBody = event.body ? JSON.parse(event.body) : {};
    
    // Sample response
    const response = {};`}
    
    return {
      statusCode: ${handler.statusCode},
      headers: getCorsHeaders(),
      body: JSON.stringify({ 
        statusCode: ${handler.statusCode}, 
        data: response
      })
    };
  } catch (error) {
    console.error(\`Error in handle${handler.operationId.charAt(0).toUpperCase() + handler.operationId.slice(1)}:\`, error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ 
        statusCode: 500, 
        message: 'Internal server error'
      })
    };
  }
}
`).join('\n')}
`;
};

// tsconfig.json template
exports.tsconfigContent = `
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
`; 