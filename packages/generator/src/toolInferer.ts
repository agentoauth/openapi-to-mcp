import { ParsedApi, McpTool } from "./models";
import { OperationOverrides } from "./types";
import {
  buildInputSchemaForOperation,
  buildToolDescription,
  normalizeToolName,
  openApiSchemaToJsonSchema,
} from "./schemaUtils";

export function inferToolsFromOperations(
  parsed: ParsedApi,
  overrides?: OperationOverrides
): McpTool[] {
  const { operations, components } = parsed;

  return operations.map((op) => {
    const inputSchema = buildInputSchemaForOperation(op, components);
    const outputSchema = op.responseSchema
      ? openApiSchemaToJsonSchema(op.responseSchema, components)
      : { type: "object" };

    // Apply overrides if available
    const override = overrides?.get(op.id);
    const toolName = override?.name || normalizeToolName(op.id);
    const toolDescription = override?.description || buildToolDescription(op);

    return {
      name: toolName,
      description: toolDescription,
      inputSchema,
      outputSchema,
      operation: op,
    };
  });
}


