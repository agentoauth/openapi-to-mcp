/**
 * Tests for JSON Schema 2020-12 support and defaults
 */

import { describe, it, expect } from "vitest";
import { buildInputSchemaForOperation } from "../src/schemaUtils";
import { JSON_SCHEMA_2020_12 } from "../../core/src/index";
import { ApiOperation } from "../src/models";
import { OpenAPIV3 } from "openapi-types";

describe("JSON Schema 2020-12 Support", () => {
  it("should include $schema field with 2020-12 dialect", () => {
    const op: ApiOperation = {
      id: "test",
      method: "get",
      path: "/test",
      tags: [],
      parameters: [],
    };

    const schema = buildInputSchemaForOperation(op, undefined);
    expect(schema.$schema).toBe(JSON_SCHEMA_2020_12);
  });

  it("should propagate default values from path parameters", () => {
    const op: ApiOperation = {
      id: "test",
      method: "get",
      path: "/test/{id}",
      tags: [],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
            default: "default-id",
          } as OpenAPIV3.SchemaObject,
        },
      ],
    };

    const schema = buildInputSchemaForOperation(op, undefined);
    expect(schema.properties?.id?.default).toBe("default-id");
  });

  it("should propagate default values from query parameters", () => {
    const op: ApiOperation = {
      id: "test",
      method: "get",
      path: "/test",
      tags: [],
      parameters: [
        {
          name: "limit",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            default: 10,
          } as OpenAPIV3.SchemaObject,
          default: 10,
        },
      ],
    };

    const schema = buildInputSchemaForOperation(op, undefined);
    expect(schema.properties?.limit?.default).toBe(10);
  });
});

