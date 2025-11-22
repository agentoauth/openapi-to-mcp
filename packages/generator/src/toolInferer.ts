import { ParsedApi, McpTool } from "./models";
import {
  buildInputSchemaForOperation,
  buildToolDescription,
  normalizeToolName,
  openApiSchemaToJsonSchema,
} from "./schemaUtils";

export function inferToolsFromOperations(parsed: ParsedApi): McpTool[] {
  const { operations, components } = parsed;

  return operations.map((op) => {
    const inputSchema = buildInputSchemaForOperation(op, components);
    const outputSchema = op.responseSchema
      ? openApiSchemaToJsonSchema(op.responseSchema, components)
      : { type: "object" };

    return {
      name: normalizeToolName(op.id),
      description: buildToolDescription(op),
      inputSchema,
      outputSchema,
      operation: op,
    };
  });
}


