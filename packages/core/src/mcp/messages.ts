/**
 * MCP 2025 message types and capabilities
 * 
 * Defines the extended message types for MCP 2025 including
 * URL elicitation, tasks, and sampling.
 */

/**
 * URL elicitation result
 * Used to request user consent via a URL
 */
export interface UrlElicitationResult {
  type: "mcp/elicitation";
  mode: "url";
  url: string;
  reason?: string;
}

/**
 * Task started notification
 */
export interface TaskStarted {
  type: "mcp/task-started";
  taskId: string;
  estimatedSeconds?: number;
}

/**
 * Task status update
 */
export interface TaskStatus {
  type: "mcp/task-status";
  taskId: string;
  status: "pending" | "running" | "succeeded" | "failed";
  result?: unknown;
  error?: string;
}

/**
 * Sampling message
 */
export interface SamplingMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Sampling request
 * Requests the model to generate text
 */
export interface SamplingRequest {
  type: "mcp/sampling-request";
  model?: string;
  messages: SamplingMessage[];
}

/**
 * Sampling response
 * Contains generated text from the model
 */
export interface SamplingResponse {
  type: "mcp/sampling-response";
  content: string;
}

/**
 * Sampling client interface
 * 
 * Allows tools to request LLM sampling from the client.
 * The Hub implements this to forward requests to the connected client.
 */
export interface SamplingClient {
  sample(req: SamplingRequest): Promise<SamplingResponse>;
}

/**
 * Hub capabilities
 * Describes what MCP 2025 features the Hub supports
 */
export interface HubCapabilities {
  supportsUrlElicitation: boolean;
  supportsSampling: boolean;
  supportsTasks: boolean;
  schemaDialect: string;
}

