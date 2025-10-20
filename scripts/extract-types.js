#!/usr/bin/env node

/**
 * TypeScript Type Extractor
 * 
 * Uses the TypeScript compiler API to extract interface definitions
 * and output them as JSON for consumption by the drift checker.
 */

const ts = require('typescript');
const path = require('path');
const fs = require('fs');

function extractTypesFromFile(filePath) {
  // Read the file
  const sourceCode = fs.readFileSync(filePath, 'utf8');
  
  // Create a TypeScript source file
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const extractedTypes = {};
  const extractedFunctions = [];
  const extractedEnums = {};

  function visit(node) {
    // Look for interface declarations
    if (ts.isInterfaceDeclaration(node)) {
      const interfaceName = node.name.text;
      const properties = [];

      // Extract properties from the interface
      for (const member of node.members) {
        if (ts.isPropertySignature(member)) {
          const propertyName = member.name?.text;
          const isOptional = !!member.questionToken;
          const typeText = member.type ? getTypeText(member.type) : 'unknown';

          if (propertyName) {
            properties.push({
              name: propertyName,
              optional: isOptional,
              type: typeText
            });
          }
        }
      }

      extractedTypes[interfaceName] = properties;
    }

    // Look for enum declarations
    if (ts.isEnumDeclaration(node)) {
      const enumName = node.name.text;
      const enumValues = [];

      for (const member of node.members) {
        if (member.name) {
          const memberName = member.name.text;
          let memberValue = memberName; // Default to member name
          
          // Check if there's an initializer (e.g., Checking = "checking")
          if (member.initializer && ts.isStringLiteral(member.initializer)) {
            memberValue = member.initializer.text;
          }
          
          enumValues.push({
            name: memberName,
            value: memberValue
          });
        }
      }

      extractedEnums[enumName] = enumValues;
    }

    // Look for function declarations with @endpoint comments (including exported functions)
    if (ts.isFunctionDeclaration(node) && node.name) {
      const functionInfo = extractFunctionInfo(node, sourceCode);
      if (functionInfo) {
        extractedFunctions.push(functionInfo);
      }
    }

    // Look for method declarations with @endpoint comments (class methods)
    if (ts.isMethodDeclaration(node) && node.name) {
      const methodInfo = extractFunctionInfo(node, sourceCode);
      if (methodInfo) {
        extractedFunctions.push(methodInfo);
      }
    }

    // Continue traversing child nodes
    ts.forEachChild(node, visit);
  }

  // Start the traversal
  visit(sourceFile);
  return { interfaces: extractedTypes, functions: extractedFunctions, enums: extractedEnums };
}

function getTypeText(typeNode) {
  // Simple type text extraction using TypeScript compiler API
  switch (typeNode.kind) {
    case ts.SyntaxKind.StringKeyword: return 'string';
    case ts.SyntaxKind.NumberKeyword: return 'number';
    case ts.SyntaxKind.BooleanKeyword: return 'boolean';
    case ts.SyntaxKind.AnyKeyword: return 'any';
    case ts.SyntaxKind.TypeReference:
      // Handle type references like Record<string, any>
      if (typeNode.typeName) {
        return typeNode.typeName.text || 'unknown';
      }
      return 'unknown';
    case ts.SyntaxKind.TypeLiteral:
      return 'object';
    case ts.SyntaxKind.UnionType:
      // Handle union types like 'checking' | 'savings'
      const unionTypes = typeNode.types.map(t => getTypeText(t));
      return unionTypes.join(' | ');
    case ts.SyntaxKind.LiteralType:
      // Handle literal types like 'checking'
      if (typeNode.literal && ts.isStringLiteral(typeNode.literal)) {
        return `'${typeNode.literal.text}'`;
      }
      return typeNode.getText ? typeNode.getText() : 'unknown';
    default:
      // For other types, try to get text representation
      return typeNode.getText ? typeNode.getText().replace(/\s+/g, ' ') : 'unknown';
  }
}

function extractFunctionInfo(node, sourceCode) {
  const functionName = node.name.text;
  
  // Look for @endpoint comment before this function
  const endpointInfo = extractEndpointComment(node, sourceCode);
  if (!endpointInfo) {
    return null; // Skip functions without @endpoint
  }

  // Extract function parameters
  const parameters = [];
  if (node.parameters) {
    for (const param of node.parameters) {
      const paramName = param.name?.text;
      const isOptional = !!param.questionToken;
      const typeText = param.type ? getTypeText(param.type) : 'unknown';
      
      if (paramName) {
        parameters.push({
          name: paramName,
          optional: isOptional,
          type: typeText
        });
      }
    }
  }

  return {
    functionName,
    endpoint: endpointInfo,
    parameters
  };
}

function extractEndpointComment(node, sourceCode) {
  // Get the full text and find JSDoc comment before this function
  const sourceFile = node.getSourceFile();
  const fullText = sourceFile.getFullText();
  
  // Find the position of this function  
  const functionStart = node.getFullStart();
  const functionPos = node.getStart();
  
  // Look for the immediate JSDoc comment block before this function
  // Extract the leading trivia (comments/whitespace) before the function
  const leadingTrivia = fullText.substring(functionStart, functionPos);
  
  // Find the last /** */ block in the leading trivia
  const commentMatch = leadingTrivia.match(/\/\*\*([\s\S]*?)\*\/(?:\s*)$/);
  
  if (commentMatch) {
    const commentContent = commentMatch[1];
    const endpointMatch = commentContent.match(/@endpoint\s+(\w+)\s+([^\s\*\r\n]+)/);
    
    if (endpointMatch) {
      return {
        method: endpointMatch[1].toUpperCase(),
        path: endpointMatch[2]
      };
    }
  }
  
  return null;
}

function main() {
  try {
    // Get file path from command line argument or default to bank_account.ts
    const filePath = process.argv[2] || path.join(__dirname, '../lib/internal/bank_account.ts');
    const extracted = extractTypesFromFile(filePath);

    // For now, just focus on filter interfaces
    const filterTypes = {};
    for (const [typeName, properties] of Object.entries(extracted.interfaces)) {
      if (typeName.includes('Filter') || typeName.includes('List')) {
        filterTypes[typeName] = properties;
      }
    }

    // Output the results as JSON
    const result = {
      file: path.basename(filePath),
      timestamp: new Date().toISOString(),
      filterInterfaces: filterTypes,
      interfaces: extracted.interfaces,
      functions: extracted.functions,
      enums: extracted.enums
    };

    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error extracting types:', error.message);
    process.exit(1);
  }
}

main();