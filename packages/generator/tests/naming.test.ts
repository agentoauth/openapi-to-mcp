/**
 * Tests for MCP-compliant tool naming
 */

import { describe, it, expect } from "vitest";
import { normalizeToolName, isValidToolName, TOOL_NAME_MAX_LENGTH } from "../../core/src/index";

describe("Tool Name Normalization", () => {
  it("should normalize simple operation IDs", () => {
    expect(normalizeToolName("getUserById")).toBe("getuserbyid");
    expect(normalizeToolName("createOrder")).toBe("createorder");
  });

  it("should handle path-like inputs", () => {
    expect(normalizeToolName("/v1/customers/{id}:update")).toBe("customers_update");
    expect(normalizeToolName("v1/customers/create")).toBe("customers_create");
  });

  it("should remove invalid characters", () => {
    expect(normalizeToolName("get-user@domain")).toBe("get_user_domain");
    expect(normalizeToolName("test#method")).toBe("test_method");
  });

  it("should handle empty or invalid inputs", () => {
    expect(normalizeToolName("")).toBe("tool");
    expect(normalizeToolName("___")).toBe("tool");
  });

  it("should enforce max length", () => {
    const longName = "a".repeat(200);
    const normalized = normalizeToolName(longName);
    expect(normalized.length).toBeLessThanOrEqual(TOOL_NAME_MAX_LENGTH);
  });
});

describe("Tool Name Validation", () => {
  it("should validate compliant names", () => {
    expect(isValidToolName("getuser")).toBe(true);
    expect(isValidToolName("create_order")).toBe(true);
    expect(isValidToolName("tool.v1")).toBe(true);
  });

  it("should reject names with spaces", () => {
    expect(isValidToolName("get user")).toBe(false);
  });

  it("should reject names with special characters", () => {
    expect(isValidToolName("tool@name")).toBe(false);
    expect(isValidToolName("tool#name")).toBe(false);
  });

  it("should reject names that are too long", () => {
    const longName = "a".repeat(TOOL_NAME_MAX_LENGTH + 1);
    expect(isValidToolName(longName)).toBe(false);
  });

  it("should reject empty names", () => {
    expect(isValidToolName("")).toBe(false);
  });
});

