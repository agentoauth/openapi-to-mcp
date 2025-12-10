/**
 * Tests for scope checking in MCP Hub
 */

import { describe, it, expect } from "vitest";
import { checkScopes } from "../src/scopeStore";
import { ToolDescriptor } from "../../../packages/core/src/index";
import { ScopeGrant } from "../src/types";

describe("Scope Checking", () => {
  it("should allow execution when scopes are granted", () => {
    const tool: ToolDescriptor = {
      name: "listCharges",
      description: "List charges",
      inputSchema: { type: "object" },
      auth: {
        requiredScopes: ["charges:read"],
      },
    };

    const grants: ScopeGrant[] = [
      {
        clientId: "client1",
        providerId: "stripe",
        scopes: ["charges:read", "payments:write"],
      },
    ];

    const result = checkScopes("client1", tool, grants);
    expect(result.ok).toBe(true);
  });

  it("should deny execution when scopes are missing", () => {
    const tool: ToolDescriptor = {
      name: "listCharges",
      description: "List charges",
      inputSchema: { type: "object" },
      auth: {
        requiredScopes: ["charges:read", "payments:write"],
      },
    };

    const grants: ScopeGrant[] = [
      {
        clientId: "client1",
        providerId: "stripe",
        scopes: ["charges:read"],
      },
    ];

    const result = checkScopes("client1", tool, grants);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.missing).toContain("payments:write");
    }
  });

  it("should allow execution when no scopes are required", () => {
    const tool: ToolDescriptor = {
      name: "publicEndpoint",
      description: "Public endpoint",
      inputSchema: { type: "object" },
    };

    const grants: ScopeGrant[] = [];

    const result = checkScopes("client1", tool, grants);
    expect(result.ok).toBe(true);
  });

  it("should only check grants for the specific client", () => {
    const tool: ToolDescriptor = {
      name: "listCharges",
      description: "List charges",
      inputSchema: { type: "object" },
      auth: {
        requiredScopes: ["charges:read"],
      },
    };

    const grants: ScopeGrant[] = [
      {
        clientId: "client1",
        providerId: "stripe",
        scopes: ["charges:read"],
      },
      {
        clientId: "client2",
        providerId: "stripe",
        scopes: ["other:scope"],
      },
    ];

    const result1 = checkScopes("client1", tool, grants);
    expect(result1.ok).toBe(true);

    const result2 = checkScopes("client2", tool, grants);
    expect(result2.ok).toBe(false);
  });
});

