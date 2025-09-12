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
    
    const totalDrift = drift.newInApi.length + drift.missingFromApi.length;
    const forceUpdate = process.env.FORCE_UPDATE === 'true';
    
    if (totalDrift > 0 || forceUpdate) {
      console.log('🚨 API drift detected!');
      console.log(`   • ${drift.newInApi.length} new endpoints in API`);
      console.log(`   • ${drift.missingFromApi.length} SDK endpoints not in API`);
      
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
      
      endpoints.push({
        method: method.toUpperCase(),
        path: path,
        summary: operation.summary || 'No description',
        tags: operation.tags || [],
        operationId: operation.operationId
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
    
    // Extract @endpoint comments
    const endpointRegex = /\/\*\*[\s\S]*?@endpoint\s+(\w+)\s+([^\s\*\r\n]+)[\s\S]*?\*\/\s*(?:export\s+const\s+(\w+)|async\s+(\w+))/g;
    let match;
    
    while ((match = endpointRegex.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const path = match[2];
      const functionName = match[3] || match[4];
      
      if (functionName) {
        endpoints.push({
          method,
          path,
          functionName,
          file: file.replace(SDK_ROOT + '/', '')
        });
      }
    }
  }
  
  return endpoints.sort((a, b) => a.path.localeCompare(b.path));
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
  
  return { newInApi, missingFromApi };
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

  if (drift.newInApi.length === 0 && drift.missingFromApi.length === 0) {
    report += `## ✅ No Drift Detected

The JustiFi Node.js SDK is up-to-date with the latest API specification.

`;
  } else {
    const total = drift.newInApi.length + drift.missingFromApi.length;
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

  // Footer
  report += `---

**Next Steps:**
1. Add \`@endpoint\` JSDoc comments to new SDK methods
2. Implement missing API endpoints in the SDK
3. Review and update deprecated methods
4. Test new implementations thoroughly

*This report was generated automatically by the API Drift Monitor workflow.*
`;

  return report;
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

main();