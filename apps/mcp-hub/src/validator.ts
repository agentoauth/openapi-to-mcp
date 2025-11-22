import { OpenAPIV3 } from "openapi-types";

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  pathCount?: number;
  operationCount?: number;
}

export function validateOpenAPISpec(spec: OpenAPIV3.Document): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Check for missing operationIDs and count paths/operations
  const paths = spec.paths || {};
  let operationCount = 0;
  
  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem) continue;
    const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;
    for (const method of methods) {
      const operation = (pathItem as any)[method];
      if (operation) {
        operationCount++;
        if (!operation.operationId) {
          warnings.push(`Operation ${method.toUpperCase()} ${path} is missing operationId (will be auto-generated)`);
        }
      }
    }
  }
  
  // Check for invalid $ref references
  const components = spec.components || {};
  const schemas = components.schemas || {};
  const schemaNames = new Set(Object.keys(schemas));
  
  function checkRefs(obj: any, path: string = ''): void {
    if (typeof obj !== 'object' || obj === null) return;
    
    if (obj.$ref) {
      const refPath = obj.$ref;
      if (refPath.startsWith('#/components/schemas/')) {
        const schemaName = refPath.replace('#/components/schemas/', '');
        if (!schemaNames.has(schemaName)) {
          errors.push(`Invalid $ref at ${path || 'root'}: ${obj.$ref} (schema "${schemaName}" not found)`);
        }
      }
    }
    
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        value.forEach((item, idx) => checkRefs(item, path ? `${path}.${key}[${idx}]` : `${key}[${idx}]`));
      } else if (typeof value === 'object' && value !== null) {
        checkRefs(value, path ? `${path}.${key}` : key);
      }
    }
  }
  
  checkRefs(spec);
  
  // Check for unsupported auth flows
  const securitySchemes = components.securitySchemes || {};
  for (const [name, scheme] of Object.entries(securitySchemes)) {
    const s = scheme as any;
    if (s.type === 'oauth2' && s.flows) {
      // Check for flows we don't support
      if (s.flows.implicit || s.flows.authorizationCode) {
        warnings.push(`OAuth2 flow "${name}" uses unsupported flow type (only "clientCredentials" and "password" are supported)`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    warnings,
    errors,
    pathCount: Object.keys(paths).length,
    operationCount,
  };
}

