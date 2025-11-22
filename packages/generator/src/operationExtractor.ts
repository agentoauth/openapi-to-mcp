import { OpenAPIV3 } from "openapi-types";
import { ApiOperation, ApiParameter, ParsedApi } from "./models";

export function extractOperationsFromSpec(
  spec: OpenAPIV3.Document
): ParsedApi {
  const operations: ApiOperation[] = [];
  const paths = spec.paths || {};

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem) continue;
    const pi = pathItem as OpenAPIV3.PathItemObject;

    const methods: Array<["get" | "post", OpenAPIV3.OperationObject | undefined]> = [
      ["get", pi.get],
      ["post", pi.post],
    ];

    for (const [method, op] of methods) {
      if (!op) continue;

      const id = op.operationId || generateOperationId(method, path);
      const parameters: ApiParameter[] = [];

      const allParams = [
        ...(pi.parameters || []),
        ...(op.parameters || []),
      ];

      for (const p of allParams) {
        // V0: assume non-$ref; we can add ref resolution later
        const param = p as OpenAPIV3.ParameterObject;
        if (!param.name || !param.in) continue;

        parameters.push({
          name: param.name,
          in: param.in as ApiParameter["in"],
          required: !!param.required,
          schema: param.schema,
          description: param.description,
        });
      }

      // Extract path parameters from the path string itself
      // This handles cases where the OpenAPI spec doesn't define them in the parameters array
      const pathParamNames = extractPathParametersFromPath(path);
      const existingPathParamNames = new Set(
        parameters.filter(p => p.in === "path").map(p => p.name)
      );

      for (const paramName of pathParamNames) {
        // Skip if already in parameters
        if (existingPathParamNames.has(paramName)) continue;

        // Try to find parameter definition in components/parameters
        let paramSchema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined;
        let paramDescription: string | undefined;

        if (spec.components?.parameters) {
          // Check for parameter definitions like #/components/parameters/Latitude
          const capitalizedName = paramName.charAt(0).toUpperCase() + paramName.slice(1);
          const possibleParamRef = spec.components.parameters[capitalizedName] || 
                                   spec.components.parameters[paramName];
          
          if (possibleParamRef && "$ref" in possibleParamRef) {
            // Resolve $ref (simplified - assumes it's in components/parameters)
            const refPath = possibleParamRef.$ref.replace(/^#\/components\/parameters\//, "");
            const resolvedParam = spec.components?.parameters?.[refPath] as OpenAPIV3.ParameterObject | undefined;
            if (resolvedParam) {
              paramSchema = resolvedParam.schema;
              paramDescription = resolvedParam.description;
            }
          } else if (possibleParamRef && "schema" in possibleParamRef) {
            const paramObj = possibleParamRef as OpenAPIV3.ParameterObject;
            paramSchema = paramObj.schema;
            paramDescription = paramObj.description;
          }
        }

        // If no schema found in components, infer type based on parameter name
        if (!paramSchema) {
          // Infer numeric types for common geographic/numeric parameter names
          const numericParams = ['latitude', 'longitude', 'x', 'y', 'sequence', 'limit', 'offset', 'page', 'size'];
          const isNumeric = numericParams.some(n => paramName.toLowerCase().includes(n.toLowerCase()));
          
          paramSchema = {
            type: isNumeric ? "number" : "string",
          } as OpenAPIV3.SchemaObject;

          // Add constraints for common parameters
          if (paramName.toLowerCase() === 'latitude') {
            (paramSchema as OpenAPIV3.SchemaObject).minimum = -90;
            (paramSchema as OpenAPIV3.SchemaObject).maximum = 90;
            paramDescription = "Latitude";
          } else if (paramName.toLowerCase() === 'longitude') {
            (paramSchema as OpenAPIV3.SchemaObject).minimum = -180;
            (paramSchema as OpenAPIV3.SchemaObject).maximum = 180;
            paramDescription = "Longitude";
          } else {
            paramDescription = `Path parameter "${paramName}"`;
          }
        }

        parameters.push({
          name: paramName,
          in: "path",
          required: true, // Path parameters are always required
          schema: paramSchema,
          description: paramDescription,
        });
      }

      const requestBodySchema = extractRequestBodySchema(op);
      const responseSchema = extractResponseSchema(op);

      operations.push({
        id,
        method,
        path,
        summary: op.summary,
        description: op.description,
        tags: op.tags || [],
        parameters,
        requestBodySchema,
        responseSchema,
      });
    }
  }

  return {
    operations,
    components: spec.components,
  };
}

/**
 * Extract path parameter names from a path string.
 * Handles patterns like:
 * - /{param} → ["param"]
 * - /{param1},{param2} → ["param1", "param2"]
 * - /{param1}/{param2} → ["param1", "param2"]
 */
function extractPathParametersFromPath(path: string): string[] {
  const params: string[] = [];
  // Match {param} patterns, including comma-separated ones like {param1},{param2}
  const paramPattern = /\{([^}]+)\}/g;
  let match;
  
  while ((match = paramPattern.exec(path)) !== null) {
    const paramSegment = match[1];
    // Handle comma-separated parameters like "latitude,longitude"
    if (paramSegment.includes(',')) {
      const commaSeparated = paramSegment.split(',').map(p => p.trim());
      params.push(...commaSeparated);
    } else {
      params.push(paramSegment);
    }
  }
  
  return params;
}

function generateOperationId(method: string, path: string): string {
  // e.g. "get_/v1/users/{id}" -> "get_v1_users_id"
  return (
    method.toLowerCase() +
    "_" +
    path
      .replace(/[{}]/g, "")
      .replace(/\//g, "_")
      .replace(/__+/g, "_")
      .replace(/^_+|_+$/g, "")
  );
}

function extractRequestBodySchema(
  op: OpenAPIV3.OperationObject
): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined {
  const rb = op.requestBody as OpenAPIV3.RequestBodyObject | undefined;
  if (!rb || !rb.content) return undefined;
  const json = rb.content["application/json"];
  if (!json || !json.schema) return undefined;
  return json.schema;
}

function extractResponseSchema(
  op: OpenAPIV3.OperationObject
): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined {
  const responses = op.responses || {};
  const codes = Object.keys(responses).sort();
  const successCode = codes.find((c) => c.startsWith("2"));
  if (!successCode) return undefined;

  const res = responses[successCode] as OpenAPIV3.ResponseObject;
  const json = res.content?.["application/json"];
  return json?.schema;
}

