import Ajv from "ajv";
import { McpTool } from "../../../packages/generator/src/models";

export interface SchemaValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateToolSchemas(tools: McpTool[]): SchemaValidationResult {
  // Suppress console warnings temporarily to avoid cluttering output with format warnings
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const msg = args.join(' ');
    // Ignore "unknown format" warnings from Ajv - these are expected for OpenAPI formats
    // We register these formats below, but Ajv still logs warnings during compilation
    if (msg.includes('unknown format') && msg.includes('ignored in schema')) {
      return; // Suppress these warnings
    }
    originalWarn(...args);
  };

  try {
    const ajv = new Ajv({ 
      allErrors: true, 
      strict: false,
    });
    
    // Register common OpenAPI formats to prevent "unknown format" warnings
    // We use true to indicate the format is recognized (validation happens at runtime, not here)
    ajv.addFormat('uri', true);
    ajv.addFormat('date', true);
    ajv.addFormat('date-time', true);
    ajv.addFormat('email', true);
    ajv.addFormat('hostname', true);
    ajv.addFormat('ipv4', true);
    ajv.addFormat('ipv6', true);
    ajv.addFormat('int32', true);
    ajv.addFormat('int64', true);
    ajv.addFormat('float', true);
    ajv.addFormat('double', true);
    ajv.addFormat('byte', true);
    ajv.addFormat('binary', true);
    ajv.addFormat('password', true);
    ajv.addFormat('uuid', true);
    
    const errors: string[] = [];

    for (const tool of tools) {
      if (tool.inputSchema) {
        try {
          ajv.compile(tool.inputSchema);
        } catch (e: any) {
          errors.push(`Tool "${tool.name}" has invalid inputSchema: ${e.message}`);
        }
      }
      
      if (tool.outputSchema) {
        try {
          ajv.compile(tool.outputSchema);
        } catch (e: any) {
          errors.push(`Tool "${tool.name}" has invalid outputSchema: ${e.message}`);
        }
      }
    }

    return {
      ok: errors.length === 0,
      errors,
    };
  } finally {
    // Restore original console.warn
    console.warn = originalWarn;
  }
}


