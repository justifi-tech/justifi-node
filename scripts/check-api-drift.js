#!/usr/bin/env node

/**
 * JustiFi API Drift Checker
 * 
 * Simple script that:
 * 1. Fetches JustiFi OpenAPI spec
 * 2. Extracts SDK endpoints from @endpoint JSDoc comments
 * 3. Compares and creates GitHub issue if drift found
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const OPENAPI_SPEC_URL = 'https://docs.justifi.tech/redocusaurus/plugin-redoc-0.yaml';
const SDK_ROOT = path.join(__dirname, '..');

async function main() {
  try {
    console.log('🔍 Checking API drift...');
    
    // Step 1: Fetch OpenAPI spec
    console.log('📥 Fetching OpenAPI specification...');
    const apiSpec = await fetchOpenApiSpec();
    const apiEndpoints = extractApiEndpoints(apiSpec);
    console.log(`✅ Found ${apiEndpoints.length} API endpoints`);
    
    // Step 2: Extract SDK endpoints
    console.log('🔎 Extracting SDK endpoints...');
    const sdkEndpoints = extractSdkEndpoints();
    console.log(`✅ Found ${sdkEndpoints.length} SDK endpoints with @endpoint comments`);
    
    // Step 3: Compare and generate report
    console.log('⚖️  Comparing SDK vs API...');
    const drift = compareEndpoints(apiEndpoints, sdkEndpoints);
    
    const totalDrift = drift.newInApi.length + drift.missingFromApi.length + drift.parameterMismatches.length;
    const forceUpdate = process.env.FORCE_UPDATE === 'true';
    
    if (totalDrift > 0 || forceUpdate) {
      console.log('🚨 API drift detected!');
      console.log(`   • ${drift.newInApi.length} new endpoints in API`);
      console.log(`   • ${drift.missingFromApi.length} SDK endpoints not in API`);
      console.log(`   • ${drift.parameterMismatches.length} parameter mismatches`);
      
      const report = generateDriftReport(drift, apiEndpoints.length, sdkEndpoints.length);
      fs.writeFileSync('drift-report.md', report);
      
      console.log('::set-output name=drift_detected::true');
    } else {
      console.log('✅ No API drift detected - SDK is up to date!');
      console.log('::set-output name=drift_detected::false');
    }
    
  } catch (error) {
    console.error('💥 Error checking API drift:', error.message);
    
    // Create error report for GitHub issue
    const errorReport = `# API Drift Check Error

An error occurred while checking for API drift:

\`\`\`
${error.message}
\`\`\`

**Timestamp:** ${new Date().toISOString()}

Please check the workflow logs for more details.
`;
    
    fs.writeFileSync('drift-report.md', errorReport);
    console.log('::set-output name=drift_detected::true');
    process.exit(1);
  }
}

async function fetchOpenApiSpec() {
  const response = await fetch(OPENAPI_SPEC_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
  }
  
  const specText = await response.text();
  const spec = yaml.load(specText);
  
  if (!spec.paths) {
    throw new Error('Invalid OpenAPI spec - missing paths');
  }
  
  return spec;
}

function extractApiEndpoints(spec) {
  const endpoints = [];
  
  for (const [path, pathObj] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(pathObj)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) {
        continue;
      }
      
      // Extract parameters from OpenAPI spec
      const parameters = [];
      
      // Query parameters
      if (operation.parameters) {
        for (const param of operation.parameters) {
          if (param.in === 'query') {
            parameters.push({
              name: param.name,
              type: 'query',
              required: param.required || false,
              schema: param.schema
            });
          }
        }
      }
      
      // Request body parameters (for POST/PUT/PATCH)
      if (operation.requestBody && operation.requestBody.content) {
        const content = operation.requestBody.content;
        if (content['application/json'] && content['application/json'].schema) {
          const schema = content['application/json'].schema;
          if (schema.properties) {
            for (const [propName, propSchema] of Object.entries(schema.properties)) {
              parameters.push({
                name: propName,
                type: 'body',
                required: schema.required?.includes(propName) || false,
                schema: propSchema
              });
            }
          }
        }
      }
      
      endpoints.push({
        method: method.toUpperCase(),
        path: path,
        summary: operation.summary || 'No description',
        tags: operation.tags || [],
        operationId: operation.operationId,
        parameters: parameters
      });
    }
  }
  
  return endpoints.sort((a, b) => a.path.localeCompare(b.path));
}

function extractSdkEndpoints() {
  const endpoints = [];
  
  // Read all TypeScript files in lib/internal
  const libDir = path.join(SDK_ROOT, 'lib');
  const files = getAllTsFiles(libDir);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Extract @endpoint comments and associated function signatures
    const endpointRegex = /\/\*\*[\s\S]*?@endpoint\s+(\w+)\s+([^\s\*\r\n]+)[\s\S]*?\*\/\s*(?:export\s+const\s+(\w+)|async\s+(\w+))\s*[=:]?\s*(?:\(([^)]*)\)|.*?\(([^)]*)\))/g;
    let match;
    
    while ((match = endpointRegex.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const path = match[2];
      const functionName = match[3] || match[4];
      const params = match[5] || match[6] || '';
      
      if (functionName) {
        // Parse function parameters
        const parameters = parseTypeScriptParameters(params);
        
        endpoints.push({
          method,
          path,
          functionName,
          file: file.replace(SDK_ROOT + '/', ''),
          parameters: parameters
        });
      }
    }
  }
  
  return endpoints.sort((a, b) => a.path.localeCompare(b.path));
}

function parseTypeScriptParameters(paramString) {
  const parameters = [];
  
  if (!paramString || paramString.trim() === '') {
    return parameters;
  }
  
  // Split parameters by comma, but be careful with nested types
  const params = splitParameters(paramString);
  
  for (const param of params) {
    const trimmed = param.trim();
    if (trimmed === '' || trimmed.startsWith('token:')) {
      continue; // Skip empty params and auth tokens
    }
    
    // Parse parameter: name[?]: Type
    const paramMatch = trimmed.match(/([^:?]+)(\?)?:\s*([^,=]+)(?:\s*=\s*(.+))?/);
    if (paramMatch) {
      const name = paramMatch[1].trim();
      const optional = !!paramMatch[2];
      const type = paramMatch[3].trim();
      const defaultValue = paramMatch[4];
      
      // Determine if this is a query parameter, body parameter, etc.
      const paramType = inferParameterType(name, type);
      
      parameters.push({
        name,
        type: paramType,
        required: !optional && !defaultValue,
        tsType: type
      });
    }
  }
  
  return parameters;
}

function splitParameters(paramString) {
  const params = [];
  let current = '';
  let depth = 0;
  
  for (let i = 0; i < paramString.length; i++) {
    const char = paramString[i];
    
    if (char === '(' || char === '<' || char === '{' || char === '[') {
      depth++;
    } else if (char === ')' || char === '>' || char === '}' || char === ']') {
      depth--;
    } else if (char === ',' && depth === 0) {
      params.push(current);
      current = '';
      continue;
    }
    
    current += char;
  }
  
  if (current.trim()) {
    params.push(current);
  }
  
  return params;
}

function inferParameterType(name, type) {
  // Simple heuristics to determine parameter type
  if (name.toLowerCase().includes('filter') || name.toLowerCase().includes('query') || 
      name.toLowerCase() === 'status' || name.toLowerCase().includes('id')) {
    return 'query';
  }
  if (name.toLowerCase().includes('payload') || name.toLowerCase().includes('data') ||
      type.includes('Payload') || type.includes('Request')) {
    return 'body';
  }
  return 'unknown';
}

function getAllTsFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function compareEndpoints(apiEndpoints, sdkEndpoints) {
  // Create lookup maps using method:path as key
  const sdkLookup = new Map();
  const apiLookup = new Map();
  
  for (const endpoint of sdkEndpoints) {
    const key = `${endpoint.method}:${normalizePath(endpoint.path)}`;
    sdkLookup.set(key, endpoint);
  }
  
  for (const endpoint of apiEndpoints) {
    const key = `${endpoint.method}:${normalizePath(endpoint.path)}`;
    apiLookup.set(key, endpoint);
  }
  
  // Find new endpoints in API
  const newInApi = [];
  for (const endpoint of apiEndpoints) {
    const key = `${endpoint.method}:${normalizePath(endpoint.path)}`;
    if (!sdkLookup.has(key)) {
      newInApi.push(endpoint);
    }
  }
  
  // Find SDK endpoints missing from API
  const missingFromApi = [];
  for (const endpoint of sdkEndpoints) {
    const key = `${endpoint.method}:${normalizePath(endpoint.path)}`;
    if (!apiLookup.has(key)) {
      missingFromApi.push(endpoint);
    }
  }
  
  // Find parameter mismatches for matching endpoints
  const parameterMismatches = [];
  for (const apiEndpoint of apiEndpoints) {
    const key = `${apiEndpoint.method}:${normalizePath(apiEndpoint.path)}`;
    const sdkEndpoint = sdkLookup.get(key);
    
    if (sdkEndpoint) {
      const mismatch = compareParameters(apiEndpoint, sdkEndpoint);
      if (mismatch) {
        parameterMismatches.push(mismatch);
      }
    }
  }
  
  return { newInApi, missingFromApi, parameterMismatches };
}

function compareParameters(apiEndpoint, sdkEndpoint) {
  const apiParams = apiEndpoint.parameters || [];
  const sdkParams = sdkEndpoint.parameters || [];
  
  const missingInSdk = [];
  const extraInSdk = [];
  const typeMismatches = [];
  
  // Create lookup maps for parameters
  const apiParamMap = new Map();
  const sdkParamMap = new Map();
  
  for (const param of apiParams) {
    apiParamMap.set(param.name, param);
  }
  
  for (const param of sdkParams) {
    sdkParamMap.set(param.name, param);
  }
  
  // Find missing parameters in SDK
  for (const apiParam of apiParams) {
    const sdkParam = sdkParamMap.get(apiParam.name);
    if (!sdkParam) {
      missingInSdk.push(apiParam);
    } else {
      // Check for type/requirement mismatches
      if (apiParam.required !== sdkParam.required) {
        typeMismatches.push({
          name: apiParam.name,
          issue: `Required mismatch: API=${apiParam.required}, SDK=${sdkParam.required}`
        });
      }
    }
  }
  
  // Find extra parameters in SDK (might be deprecated)
  for (const sdkParam of sdkParams) {
    if (!apiParamMap.has(sdkParam.name)) {
      extraInSdk.push(sdkParam);
    }
  }
  
  // Return mismatch data if any issues found
  if (missingInSdk.length > 0 || extraInSdk.length > 0 || typeMismatches.length > 0) {
    return {
      endpoint: `${apiEndpoint.method} ${apiEndpoint.path}`,
      functionName: sdkEndpoint.functionName,
      file: sdkEndpoint.file,
      missingInSdk,
      extraInSdk,
      typeMismatches
    };
  }
  
  return null;
}

function normalizePath(path) {
  // Normalize path parameters to {id} format and remove /v1 prefix
  return path.replace(/\{[^}]+\}/g, '{id}')
             .replace(/\/v1\//, '/')
             .replace(/^\//, '');
}

function generateDriftReport(drift, apiCount, sdkCount) {
  const date = new Date().toLocaleDateString();
  const timestamp = new Date().toISOString();
  
  let report = `# API Drift Report - ${date}

**Detection Time:** ${timestamp}  
**API Endpoints:** ${apiCount}  
**SDK Endpoints:** ${sdkCount}

`;

  if (drift.newInApi.length === 0 && drift.missingFromApi.length === 0 && drift.parameterMismatches.length === 0) {
    report += `## ✅ No Drift Detected

The JustiFi Node.js SDK is up-to-date with the latest API specification.

`;
  } else {
    const total = drift.newInApi.length + drift.missingFromApi.length + drift.parameterMismatches.length;
    report += `## ⚠️ API Drift Detected

Found ${total} differences between the SDK and API specification:

`;
  }

  // New endpoints section
  if (drift.newInApi.length > 0) {
    report += `## 🆕 New Endpoints in API (Missing from SDK)

The following endpoints are available in the API but not implemented in the SDK:

| Method | Path | Summary | Tags |
|--------|------|---------|------|
`;
    
    for (const endpoint of drift.newInApi) {
      const tags = endpoint.tags.join(', ') || 'N/A';
      report += `| ${endpoint.method} | \`${endpoint.path}\` | ${endpoint.summary} | ${tags} |\n`;
    }
    
    report += `

**Action Required:** These endpoints should be implemented in the SDK to provide complete API coverage.

`;
  }

  // Missing endpoints section
  if (drift.missingFromApi.length > 0) {
    report += `## ❓ SDK Endpoints Not in API

The following SDK methods don't match any API endpoints:

| SDK Method | Method | Path | File |
|------------|--------|------|------|
`;
    
    for (const endpoint of drift.missingFromApi) {
      report += `| \`${endpoint.functionName}\` | ${endpoint.method} | \`${endpoint.path}\` | ${endpoint.file} |\n`;
    }
    
    report += `

**Action Required:** Review these methods - they may be deprecated or incorrectly documented.

`;
  }

  // Parameter mismatches section
  if (drift.parameterMismatches.length > 0) {
    report += `## 🔧 Parameter Mismatches

The following endpoints have parameter differences between the API and SDK:

| Endpoint | SDK Method | File | Issue |
|----------|------------|------|-------|
`;
    
    for (const mismatch of drift.parameterMismatches) {
      // Missing parameters in SDK
      for (const missing of mismatch.missingInSdk) {
        const required = missing.required ? 'required' : 'optional';
        report += `| \`${mismatch.endpoint}\` | \`${mismatch.functionName}\` | ${mismatch.file} | Missing ${required} parameter: \`${missing.name}\` |\n`;
      }
      
      // Extra parameters in SDK
      for (const extra of mismatch.extraInSdk) {
        report += `| \`${mismatch.endpoint}\` | \`${mismatch.functionName}\` | ${mismatch.file} | Extra parameter: \`${extra.name}\` (not in API) |\n`;
      }
      
      // Type mismatches
      for (const typeMismatch of mismatch.typeMismatches) {
        report += `| \`${mismatch.endpoint}\` | \`${mismatch.functionName}\` | ${mismatch.file} | \`${typeMismatch.name}\`: ${typeMismatch.issue} |\n`;
      }
    }
    
    report += `

**Action Required:** Update SDK method signatures to match API parameter definitions.

`;
  }

  // Footer
  report += `---

**Next Steps:**
1. Add \`@endpoint\` JSDoc comments to new SDK methods
2. Implement missing API endpoints in the SDK
3. Update SDK parameters to match API specifications
4. Review and update deprecated methods
5. Test new implementations thoroughly

*This report was generated automatically by the API Drift Monitor workflow.*
`;

  return report;
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

main();