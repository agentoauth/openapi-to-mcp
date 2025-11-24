/**
 * Lightweight reference to an OpenAPI operation.
 * Extracted early in the pipeline before full parameter extraction.
 */
export type OperationRef = {
  path: string;
  method: "get" | "post" | "put" | "patch" | "delete";
  operationId: string;
  tags: string[];
  summary?: string;
};

/**
 * Configuration for transforming/filtering operations before code generation.
 */
export type TransformConfig = {
  /**
   * Include only operations with these tags.
   * If specified, operations must have at least one matching tag.
   */
  includeTags?: string[];

  /**
   * Exclude operations with these tags.
   * Operations with any matching tag will be filtered out.
   */
  excludeTags?: string[];

  /**
   * Include only operations matching these path patterns.
   * Supports exact paths or patterns (e.g., "/api/v1/*").
   */
  includePaths?: string[];

  /**
   * Exclude operations matching these path patterns.
   * Supports exact paths or patterns (e.g., "/api/v1/*").
   */
  excludePaths?: string[];

  /**
   * Per-operation overrides.
   * Key is the operationId.
   */
  tools?: {
    [operationId: string]: {
      /**
       * Enable or disable this operation.
       * If false, the operation will be excluded.
       */
      enabled?: boolean;

      /**
       * Override the generated tool name.
       * If not provided, tool name is auto-generated from operationId.
       */
      name?: string;

      /**
       * Override the tool description.
       * If not provided, description is auto-generated from operation summary/description.
       */
      description?: string;
    };
  };
};

/**
 * Map of operationId to name/description overrides.
 * Created by applyTransforms() from TransformConfig.
 */
export type OperationOverrides = Map<
  string,
  {
    name?: string;
    description?: string;
  }
>;


