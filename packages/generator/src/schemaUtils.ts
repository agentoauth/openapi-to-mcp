import { OpenAPIV3 } from "openapi-types";
import { ApiOperation, JsonSchema, ParsedApi } from "./models";
import { JSON_SCHEMA_2020_12 } from "../../core/src/index";

type ComponentsObject = OpenAPIV3.ComponentsObject | undefined;

export function mapOpenApiTypeToJsonType(schema: OpenAPIV3.SchemaObject | undefined): string {
  switch (schema?.type) {
    case "integer":
      return "integer";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      return "array";
    case "object":
      return "object";
    default:
      return "string";
  }
}

// VERY lightweight ref resolver + schema normalizer (good enough for V0)
export function openApiSchemaToJsonSchema(
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined,
  components: ComponentsObject
): JsonSchema {
  if (!schema) return { type: "string" };

  if ("$ref" in schema) {
    const resolved = resolveRef(schema.$ref, components);
    return openApiSchemaToJsonSchema(resolved, components);
  }

  const s = schema as OpenAPIV3.SchemaObject;

  // arrays
  if (s.type === "array" && s.items) {
    return {
      type: "array",
      items: openApiSchemaToJsonSchema(
        s.items as OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
        components
      ),
    };
  }

  // objects
  if (s.type === "object" || s.properties) {
    const props: Record<string, JsonSchema> = {};
    const required = s.required || [];
    for (const [k, v] of Object.entries(s.properties || {})) {
      props[k] = openApiSchemaToJsonSchema(
        v as OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
        components
      );
    }
    const result: JsonSchema = {
      type: "object",
      properties: props,
    };
    if (required.length) result.required = required;
    if (s.description) result.description = s.description;
    // Propagate default from OpenAPI schema if present
    if (s.default !== undefined) {
      result.default = s.default;
    }
    return result;
  }

  // enums
  if (s.enum) {
    const result: JsonSchema = {
      type: s.type || "string",
      enum: s.enum,
    };
    if (s.description) result.description = s.description;
    // Propagate default from OpenAPI schema if present
    if (s.default !== undefined) {
      result.default = s.default;
    }
    return result;
  }

  // primitive
  const base: JsonSchema = {
    type: mapOpenApiTypeToJsonType(s),
  };
  if (s.format) base.format = s.format;
  if (s.description) base.description = s.description;
  // Propagate default from OpenAPI schema if present
  if (s.default !== undefined) {
    base.default = s.default;
  }
  return base;
}

function resolveRef(
  ref: string,
  components: ComponentsObject
): OpenAPIV3.SchemaObject | undefined {
  if (!components) return undefined;
  // assumes #/components/schemas/Foo
  const parts = ref.replace(/^#\//, "").split("/");
  let cur: any = { components }; // root shim
  for (const part of parts) {
    cur = cur[part];
    if (!cur) break;
  }
  return cur as OpenAPIV3.SchemaObject | undefined;
}

// --- Input schema builder ---

export function buildInputSchemaForOperation(
  op: ApiOperation,
  components: ComponentsObject
): JsonSchema {
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  const pathParams = op.parameters.filter((p) => p.in === "path");
  const queryParams = op.parameters.filter((p) => p.in === "query");

  // Path params – usually required
  for (const p of pathParams) {
    const name = p.name;
    const paramSchemaObj = p.schema as OpenAPIV3.SchemaObject | undefined;
    const paramSchema: JsonSchema = {
      type: mapOpenApiTypeToJsonType(paramSchemaObj),
      description: p.description ?? `Path parameter "${p.name}"`,
    };
    // Propagate default value if present (from parameter default or schema default)
    if (p.default !== undefined) {
      paramSchema.default = p.default;
    } else if (paramSchemaObj?.default !== undefined) {
      paramSchema.default = paramSchemaObj.default;
    }
    properties[name] = paramSchema;
    if (p.required !== false) {
      required.push(name);
    }
  }

  // Query params – optional by default
  for (const p of queryParams) {
    let name = p.name;
    if (properties[name]) {
      name = `query_${name}`;
    }
    const paramSchema: JsonSchema = {
      type: mapOpenApiTypeToJsonType(p.schema as OpenAPIV3.SchemaObject),
      description: p.description ?? `Query parameter "${p.name}"`,
    };
    // Propagate default value if present
    if (p.default !== undefined) {
      paramSchema.default = p.default;
    }
    properties[name] = paramSchema;
    if (p.required) {
      required.push(name);
    }
  }

  // Request body – inline small objects, else single `body` field
  if ((op.method === "post" || op.method === "put" || op.method === "patch") && op.requestBodySchema) {
    const bodySchema = openApiSchemaToJsonSchema(op.requestBodySchema, components);

    const isInlineableObject =
      bodySchema.type === "object" &&
      bodySchema.properties &&
      Object.keys(bodySchema.properties).length <= 5;

    if (isInlineableObject) {
      const bodyProps = bodySchema.properties || {};
      const bodyRequired = new Set<string>(bodySchema.required || []);
      for (const [propName, propSchema] of Object.entries(bodyProps)) {
        let name = propName;
        if (properties[name]) {
          name = `body_${name}`;
        }
        properties[name] = {
          ...(propSchema as JsonSchema),
          description:
            (propSchema as any).description ??
            `Body field "${propName}" for ${op.id}`,
        };
        if (bodyRequired.has(propName)) {
          required.push(name);
        }
      }
    } else {
      // fallback: single `body` object
      properties["body"] = bodySchema;
      required.push("body");
    }
  }

  return {
    $schema: JSON_SCHEMA_2020_12,
    type: "object",
    properties,
    required: Array.from(new Set(required)),
    additionalProperties: false,
  };
}

// --- Tool metadata helpers ---

export function buildToolDescription(op: ApiOperation): string {
  const base = op.summary || op.description;
  const methodPath = `${op.method.toUpperCase()} ${op.path}`;
  if (base) return `${base} (calls ${methodPath})`;
  return `Call the ${methodPath} API endpoint.`;
}

// normalizeToolName is now imported from core
export { normalizeToolName } from "../../core/src/index";


