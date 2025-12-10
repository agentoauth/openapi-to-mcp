/**
 * Tests for scope extraction from OpenAPI
 */

import { describe, it, expect } from "vitest";
import { inferToolsFromOperations } from "../src/toolInferer";
import { ParsedApi, ApiOperation } from "../src/models";
import { OpenAPIV3 } from "openapi-types";

describe("Scope Extraction", () => {
  it("should extract scopes from operation security requirements", () => {
    const op: ApiOperation = {
      id: "listCharges",
      method: "get",
      path: "/charges",
      tags: [],
      parameters: [],
      security: [
        {
          oauth2: ["charges:read", "payments:write"],
        },
      ],
    };

    const parsed: ParsedApi = {
      operations: [op],
    };

    const tools = inferToolsFromOperations(parsed);
    expect(tools).toHaveLength(1);
    expect(tools[0].auth?.requiredScopes).toEqual(["charges:read", "payments:write"]);
  });

  it("should handle operations without security requirements", () => {
    const op: ApiOperation = {
      id: "publicEndpoint",
      method: "get",
      path: "/public",
      tags: [],
      parameters: [],
    };

    const parsed: ParsedApi = {
      operations: [op],
    };

    const tools = inferToolsFromOperations(parsed);
    expect(tools).toHaveLength(1);
    expect(tools[0].auth).toBeUndefined();
  });

  it("should deduplicate scopes from multiple security requirements", () => {
    const op: ApiOperation = {
      id: "multiAuth",
      method: "get",
      path: "/test",
      tags: [],
      parameters: [],
      security: [
        {
          oauth2: ["read:users", "write:users"],
        },
        {
          oauth2: ["read:users", "read:posts"],
        },
      ],
    };

    const parsed: ParsedApi = {
      operations: [op],
    };

    const tools = inferToolsFromOperations(parsed);
    expect(tools).toHaveLength(1);
    const scopes = tools[0].auth?.requiredScopes || [];
    expect(scopes).toContain("read:users");
    expect(scopes).toContain("write:users");
    expect(scopes).toContain("read:posts");
    // Should deduplicate
    expect(scopes.filter(s => s === "read:users")).toHaveLength(1);
  });
});

