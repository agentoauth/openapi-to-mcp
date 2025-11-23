import React, { useState, useEffect } from "react";
import "./App.css";

interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

interface GenerateResponse {
  ok: boolean;
  outDir?: string;
  projectId?: string; // For public mode downloads
  mcpUrl?: string; // Only in local mode after deploy
  envVarName?: string; // Only in local mode
  error?: string;
  validation?: ValidationResult;
  manifest?: {
    serviceName: string;
    toolCount: number;
    tools: Array<{
      name: string;
      description: string;
      hasRequestBody: boolean;
      path: string;
      method: string;
    }>;
  };
  schemaValidation?: {
    ok: boolean;
    errors: string[];
  };
}

interface DeployResponse {
  ok: boolean;
  mcpUrl?: string;
  envVarName?: string;
  error?: string;
}

interface StatusStep {
  step: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  message?: string;
  timestamp?: Date;
  startTime?: Date;
  duration?: number; // Duration in milliseconds
}

interface McpTool {
  name: string;
  description: string;
  inputSchema: any;
}

function App() {
  const [mode, setMode] = useState<"public" | "local">("public");
  const [capabilities, setCapabilities] = useState<{ deployEnabled: boolean } | null>(null);
  const [openapiUrl, setOpenapiUrl] = useState("");
  const [openapiInputMode, setOpenapiInputMode] = useState<"url" | "text">("url");
  const [openapiText, setOpenapiText] = useState("");
  const [serviceName, setServiceName] = useState("weather");
  const [authType, setAuthType] = useState<"none" | "apiKey" | "bearer">("none");
  const [authHeader, setAuthHeader] = useState("");

  // Detect mode and capabilities on mount
  useEffect(() => {
    fetch("/api/mode")
      .then((r) => r.json())
      .then((data) => {
        console.log("[App] Mode detected:", data.mode);
        setMode(data.mode);
      })
      .catch((err) => {
        console.error("[App] Failed to fetch mode:", err);
        setMode("public");
      });

    fetch("/api/capabilities")
      .then((r) => r.json())
      .then((data) => {
        console.log("[App] Capabilities:", data);
        setCapabilities(data);
      })
      .catch((err) => {
        console.error("[App] Failed to fetch capabilities:", err);
        setCapabilities({ deployEnabled: false });
      });
  }, []);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusSteps, setStatusSteps] = useState<StatusStep[]>([]);
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [deploymentTime, setDeploymentTime] = useState<number | null>(null);
  const [mcpTools, setMcpTools] = useState<McpTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [toolSearchQuery, setToolSearchQuery] = useState<string>("");
  const [showToolDropdown, setShowToolDropdown] = useState<boolean>(false);
  const [toolArgs, setToolArgs] = useState<Record<string, any>>({});
  const [toolResult, setToolResult] = useState<any>(null);
  const [isExecutingTool, setIsExecutingTool] = useState(false);
  const [isLoadingTools, setIsLoadingTools] = useState(false);
  const [toolsError, setToolsError] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<DeployResponse | null>(null);
  const [showCliCommands, setShowCliCommands] = useState(false);
  const [deployStartTime, setDeployStartTime] = useState<Date | null>(null);
  const [deployTime, setDeployTime] = useState<number | null>(null);
  const [deployStatusSteps, setDeployStatusSteps] = useState<StatusStep[]>([]);
  const [deployProgress, setDeployProgress] = useState(0);
  
  // Transform UI state (Phase 3)
  const [operations, setOperations] = useState<Array<{
    path: string;
    method: string;
    operationId: string;
    tags: string[];
    summary?: string;
  }>>([]);
  const [operationGroups, setOperationGroups] = useState<Array<{
    tag: string;
    operations: Array<{
      path: string;
      method: string;
      operationId: string;
      tags: string[];
      summary?: string;
    }>;
  }>>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [transformConfig, setTransformConfig] = useState<{
    tools?: Record<string, { enabled?: boolean; name?: string; description?: string }>;
  }>({});
  const [codePreview, setCodePreview] = useState<string>("");
  const [showTransformUI, setShowTransformUI] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hideDisabled, setHideDisabled] = useState<boolean>(false);
  const [hideInternalAdmin, setHideInternalAdmin] = useState<boolean>(false);

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const updateStatus = (
    step: string, 
    status: StatusStep['status'], 
    message?: string,
    setter?: React.Dispatch<React.SetStateAction<StatusStep[]>>
  ) => {
    const updateFn = setter || setStatusSteps;
    updateFn(prev => {
      const existing = prev.find(s => s.step === step);
      const now = new Date();
      
      if (existing) {
        let updated = { ...existing, status, message, timestamp: now };
        
        // Track start time when step becomes in-progress
        if (status === 'in-progress' && !existing.startTime) {
          updated.startTime = now;
        }
        
        // Calculate duration when step completes
        if (status === 'completed' && existing.startTime) {
          updated.duration = now.getTime() - existing.startTime.getTime();
        }
        
        return prev.map(s => s.step === step ? updated : s);
      }
      
      // New step starting
      const newStep: StatusStep = {
        step,
        status,
        message,
        timestamp: now,
      };
      
      if (status === 'in-progress') {
        newStep.startTime = now;
      }
      
      return [...prev, newStep];
    });
  };

  const updateProgress = (step: string) => {
    const stepMap: Record<string, number> = {
      'Validating OpenAPI spec': 5,
      'Loading OpenAPI spec': 15,
      'Generating MCP project': 30,
      'Installing dependencies': 50,
      'Building project': 70,
      'Deploying to Cloudflare': 90,
      'Complete': 100,
    };
    setProgress(stepMap[step] || 0);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Client-side validation
    const openapiValue = openapiInputMode === "url" 
      ? openapiUrl.trim() 
      : openapiText.trim();
    
    if (!openapiValue) {
      setResult({ ok: false, error: openapiInputMode === "url" ? "OpenAPI URL is required" : "OpenAPI spec text is required" });
      return;
    }
    if (!serviceName.trim()) {
      setResult({ ok: false, error: "Service name is required" });
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    setStatusSteps([]);
    setProgress(0);
    setStartTime(new Date());
    setDeploymentTime(null);
    setMcpTools([]);
    setToolResult(null);
    setToolSearchQuery(""); // Clear tool search
    setSelectedTool(""); // Clear selected tool
    setShowToolDropdown(false); // Hide dropdown
    // Clear deployment state when starting a new generation
    setDeployResult(null);
    setDeployStatusSteps([]);
    setDeployProgress(0);
    setDeployStartTime(null);
    setDeployTime(null);

    // Initialize status steps (only generation steps, not deployment)
    const initialSteps: StatusStep[] = [
      { step: 'Validating OpenAPI spec', status: 'pending' },
      { step: 'Loading OpenAPI spec', status: 'pending' },
      { step: 'Generating MCP project', status: 'pending' },
    ];
    setStatusSteps(initialSteps);

    try {
      updateStatus('Validating OpenAPI spec', 'in-progress');
      updateProgress('Validating OpenAPI spec');

      const requestBody = {
        openapiUrlOrText: openapiValue,
        serviceName: serviceName.trim(),
        authType,
        authHeader: authHeader.trim() || undefined,
      };
      
      const res = await fetch("/api/generate-mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const json = (await res.json()) as GenerateResponse;

      // Handle validation results
      if (json.validation) {
        const { valid, warnings, errors } = json.validation;
        if (errors.length > 0) {
          updateStatus('Validating OpenAPI spec', 'error', `${errors.length} error(s) found: ${errors[0]}`);
          setResult({ ok: false, error: `Validation failed: ${errors.join('; ')}` });
          setIsLoading(false);
          return;
        }
        if (warnings.length > 0) {
          updateStatus('Validating OpenAPI spec', 'completed', `${warnings.length} warning(s)`);
        } else {
          updateStatus('Validating OpenAPI spec', 'completed');
        }
      } else {
        updateStatus('Validating OpenAPI spec', 'completed');
      }

      if (!res.ok) {
        updateStatus('Generating MCP project', 'error', json.error);
        setResult({ ok: false, error: json.error || `HTTP ${res.status}: ${res.statusText}` });
        setIsLoading(false);
        return;
      }

      updateStatus('Loading OpenAPI spec', 'in-progress');
      updateProgress('Loading OpenAPI spec');
      updateStatus('Loading OpenAPI spec', 'completed');
      
      updateStatus('Generating MCP project', 'in-progress');
      updateProgress('Generating MCP project');
      updateStatus('Generating MCP project', 'completed');
      updateProgress('Complete');
      
      if (startTime) {
        const duration = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
        setDeploymentTime(duration);
      }

      setResult(json);
      
      // Load operations for transform UI (local mode only)
      if (mode === "local" && json.ok) {
        try {
          const openapiValue = openapiInputMode === "url" ? openapiUrl.trim() : openapiText.trim();
          const opsRes = await fetch("/api/operations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ openapiUrlOrText: openapiValue }),
          });
          const opsJson = await opsRes.json();
          if (opsJson.ok) {
            // Handle both grouped and flat structure (backward compatibility)
            if (opsJson.groups) {
              setOperationGroups(opsJson.groups);
              // Flatten for backward compatibility
              const flatOps = opsJson.groups.flatMap((g: any) => g.operations);
              setOperations(flatOps);
              // Auto-expand groups with <= 20 operations, collapse larger ones
              const autoExpanded = new Set<string>();
              for (const group of opsJson.groups) {
                if (group.operations.length <= 20) {
                  autoExpanded.add(group.tag);
                }
              }
              setExpandedGroups(autoExpanded);
            } else if (opsJson.operations) {
              setOperations(opsJson.operations);
              // Create a single "all" group for backward compatibility
              setOperationGroups([{ tag: "all", operations: opsJson.operations }]);
              setExpandedGroups(new Set(["all"]));
            }
            setShowTransformUI(true);
          }
        } catch (err) {
          console.error("Failed to load operations:", err);
        }
      }
      
      setIsLoading(false);

    } catch (err: any) {
      updateStatus('Generating MCP project', 'error', err.message);
      setResult({ ok: false, error: err.message || "Network error. Make sure the backend is running on port 4000." });
      setIsLoading(false);
    }
  }

  async function loadMcpTools(mcpUrl: string) {
    setIsLoadingTools(true);
    setToolsError(null);
    setMcpTools([]);
    
    try {
      console.log('Loading tools from:', mcpUrl);
      const response = await fetch(mcpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'tools/list',
          params: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('MCP response:', data);

      if (data.error) {
        throw new Error(data.error.message || 'MCP server returned an error');
      }

      if (data.result && data.result.tools) {
        setMcpTools(data.result.tools);
        console.log('Loaded tools:', data.result.tools.length);
      } else {
        throw new Error('Invalid response format: missing tools array');
      }
    } catch (err: any) {
      console.error('Failed to load MCP tools:', err);
      setToolsError(err.message || 'Failed to load tools. Make sure the MCP server is accessible.');
    } finally {
      setIsLoadingTools(false);
    }
  }

  async function executeTool(mcpUrl: string) {
    if (!selectedTool) return;
    
    setIsExecutingTool(true);
    setToolResult(null);
    
    try {
      // Convert toolArgs to proper types based on schema
      const convertedArgs: Record<string, any> = {};
      const schema = selectedToolSchema?.inputSchema;
      
      if (schema?.properties) {
        for (const [key, value] of Object.entries(toolArgs)) {
          const propSchema = schema.properties[key];
          if (!propSchema) {
            // Unknown property, keep as-is
            convertedArgs[key] = value;
            continue;
          }
          
          // Skip empty strings (treat as undefined)
          if (value === '' || value === null || value === undefined) {
            if (schema.required?.includes(key)) {
              setToolResult({ error: `Required field '${key}' is missing` });
              setIsExecutingTool(false);
              return;
            }
            continue; // Skip optional empty fields
          }
          
          // Convert based on type
          if (propSchema.type === 'number' || propSchema.type === 'integer') {
            const numValue = Number(value);
            if (isNaN(numValue)) {
              setToolResult({ error: `Invalid number for field '${key}': ${value}` });
              setIsExecutingTool(false);
              return;
            }
            convertedArgs[key] = propSchema.type === 'integer' ? Math.floor(numValue) : numValue;
          } else if (propSchema.type === 'boolean') {
            // Boolean should already be converted by select dropdown, but handle string case
            if (typeof value === 'string') {
              convertedArgs[key] = value.toLowerCase() === 'true';
            } else {
              convertedArgs[key] = Boolean(value);
            }
          } else if (propSchema.type === 'object' || propSchema.type === 'array') {
            try {
              convertedArgs[key] = typeof value === 'string' ? JSON.parse(value) : value;
            } catch (parseErr: any) {
              setToolResult({ error: `Invalid JSON for field '${key}': ${parseErr.message}` });
              setIsExecutingTool(false);
              return;
            }
          } else {
            // String or other types - keep as string
            convertedArgs[key] = String(value);
          }
        }
        
        // Check required fields
        if (schema.required) {
          for (const requiredKey of schema.required) {
            if (!(requiredKey in convertedArgs) || convertedArgs[requiredKey] === undefined) {
              setToolResult({ error: `Required field '${requiredKey}' is missing` });
              setIsExecutingTool(false);
              return;
            }
          }
        }
      } else {
        // No schema, send args as-is (convert to proper object)
        Object.assign(convertedArgs, toolArgs);
      }
      
      const response = await fetch(mcpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'tools/call',
          params: {
            name: selectedTool,
            arguments: convertedArgs,
          },
        }),
      });
      const data = await response.json();
      setToolResult(data);
    } catch (err: any) {
      setToolResult({ error: err.message });
    } finally {
      setIsExecutingTool(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  }

  function formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
  }

  async function handleDeploy() {
    if (!result?.outDir) return;
    
    setIsDeploying(true);
    setDeployResult(null);
    setDeployProgress(0);
    const startTime = new Date();
    setDeployStartTime(startTime);
    setDeployTime(null);

    // Initialize deployment status steps
    const initialSteps: StatusStep[] = [
      { step: 'Installing dependencies', status: 'pending' },
      { step: 'Building project', status: 'pending' },
      { step: 'Deploying to Cloudflare', status: 'pending' },
    ];
    setDeployStatusSteps(initialSteps);

    try {
      updateStatus('Installing dependencies', 'in-progress', undefined, setDeployStatusSteps);
      setDeployProgress(20);

      // Simulate progress (backend does these steps)
      setTimeout(() => {
        updateStatus('Installing dependencies', 'completed', undefined, setDeployStatusSteps);
        updateStatus('Building project', 'in-progress', undefined, setDeployStatusSteps);
        setDeployProgress(50);
      }, 1000);

      setTimeout(() => {
        updateStatus('Building project', 'completed', undefined, setDeployStatusSteps);
        updateStatus('Deploying to Cloudflare', 'in-progress', undefined, setDeployStatusSteps);
        setDeployProgress(75);
      }, 2000);

      const res = await fetch("/api/deploy-mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          outDir: result.outDir,
          envVarName: result.envVarName 
        }),
      });

      updateStatus('Deploying to Cloudflare', 'completed', undefined, setDeployStatusSteps);
      setDeployProgress(100);

      const json = (await res.json()) as DeployResponse;
      setDeployResult(json);
      
      if (startTime) {
        const duration = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
        setDeployTime(duration);
      }
      
      if (json.ok && json.mcpUrl) {
        loadMcpTools(json.mcpUrl);
      }
    } catch (err: any) {
      updateStatus('Deploying to Cloudflare', 'error', err.message, setDeployStatusSteps);
      setDeployResult({ ok: false, error: err.message });
    } finally {
      setIsDeploying(false);
    }
  }

  async function handleDownload() {
    // In public mode, use projectId for download
    if (mode === "public" && result?.projectId) {
      window.location.href = `/api/download/${result.projectId}`;
      return;
    }
    
    // In local mode or fallback, use outDir
    if (!result?.outDir) return;
    
    try {
      const res = await fetch("/api/download-mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outDir: result.outDir }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Download failed: ${error.error}`);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mcp-${serviceName}-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`Download failed: ${err.message}`);
    }
  }

  const selectedToolSchema = mcpTools.find(t => t.name === selectedTool);

  return (
    <div className="app-wrapper">
      <div className="app-container">
        <div className="app-header">
          <h1>MCP Hub</h1>
          <p className="subtitle">Generate, deploy, and test MCP servers from any OpenAPI spec — instantly.</p>
          {mode && (
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              Mode: <strong>{mode}</strong>
            </p>
          )}
        </div>

        <div className="main-content">
        {/* Step 1: Generate Card - Always visible */}
        <div className="workflow-card form-card">
          <div className="workflow-step-header">
            <span className="step-number">1</span>
            <div>
              <h2>Generate MCP Server (Local)</h2>
              <p className="card-description" style={{ marginTop: "0.5rem", marginBottom: 0 }}>
                Generates MCP code for you to run locally or deploy yourself.
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label>OpenAPI Source</label>
              <div className="input-mode-toggle">
                <button
                  type="button"
                  className={openapiInputMode === "url" ? "active" : ""}
                  onClick={() => setOpenapiInputMode("url")}
                  disabled={isLoading}
                >
                  URL
                </button>
                <button
                  type="button"
                  className={openapiInputMode === "text" ? "active" : ""}
                  onClick={() => setOpenapiInputMode("text")}
                  disabled={isLoading}
                >
                  Paste Spec
                </button>
              </div>
            </div>

            {openapiInputMode === "url" ? (
              <div className="form-group">
                <label htmlFor="openapi-url">OpenAPI URL</label>
                <input
                  id="openapi-url"
                  type="text"
                  value={openapiUrl}
                  onChange={(e) => setOpenapiUrl(e.target.value)}
                  placeholder="https://api.weather.gov/openapi.json"
                  disabled={isLoading}
                />
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="openapi-text">OpenAPI Spec (JSON or YAML)</label>
                <textarea
                  id="openapi-text"
                  value={openapiText}
                  onChange={(e) => setOpenapiText(e.target.value)}
                  placeholder='{"openapi": "3.0.0", "info": {...}, ...}'
                  rows={10}
                  disabled={isLoading}
                  className="openapi-textarea"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="service-name">Service Name</label>
              <input
                id="service-name"
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="auth-type">Authentication Type</label>
              <select
                id="auth-type"
                value={authType}
                onChange={(e) => setAuthType(e.target.value as any)}
                disabled={isLoading}
              >
                <option value="none">None (public API)</option>
                <option value="apiKey">API Key (custom header)</option>
                <option value="bearer">Bearer Token</option>
              </select>
            </div>

            {authType !== "none" && (
              <div className="form-group">
                <label htmlFor="auth-header">Auth Header Name</label>
                <input
                  id="auth-header"
                  type="text"
                  value={authHeader}
                  onChange={(e) => setAuthHeader(e.target.value)}
                  placeholder={authType === "apiKey" ? "X-API-Key" : "Authorization"}
                  disabled={isLoading}
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading} 
              className="btn-primary"
            >
              {isLoading ? "Generating..." : "Generate MCP"}
            </button>
          </form>

          {/* Transform UI - Show in local mode after initial generation */}
          {mode === "local" && result?.ok && operationGroups.length > 0 && (() => {
            // Filter operations based on search and toggles
            const filteredGroups = operationGroups.map(group => {
              const filteredOps = group.operations.filter(op => {
                const opConfig = transformConfig.tools?.[op.operationId] || {};
                const enabled = opConfig.enabled !== false;
                const toolName = opConfig.name || op.operationId;
                
                // Apply hide disabled filter
                if (hideDisabled && !enabled) return false;
                
                // Apply hide internal/admin filter
                if (hideInternalAdmin && (op.path.startsWith("/admin") || op.path.startsWith("/internal"))) {
                  return false;
                }
                
                // Apply search filter
                if (searchQuery.trim()) {
                  const query = searchQuery.toLowerCase();
                  const matchesName = toolName.toLowerCase().includes(query);
                  const matchesOpId = op.operationId.toLowerCase().includes(query);
                  const matchesPath = op.path.toLowerCase().includes(query);
                  if (!matchesName && !matchesOpId && !matchesPath) {
                    return false;
                  }
                }
                
                return true;
              });
              
              return { ...group, operations: filteredOps };
            }).filter(group => group.operations.length > 0);
            
            // Calculate counts
            const totalOps = operations.length;
            const selectedOps = operations.filter(op => {
              const opConfig = transformConfig.tools?.[op.operationId] || {};
              return opConfig.enabled !== false;
            }).length;
            const visibleOps = filteredGroups.reduce((sum, g) => sum + g.operations.length, 0);
            const hiddenOps = totalOps - visibleOps;
            
            return (
              <div className="transform-section" style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Transform Tools</h3>
                    <p className="card-description" style={{ marginTop: "0.5rem", marginBottom: 0 }}>
                      Customize which operations to include and how they appear as MCP tools.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <label style={{ cursor: "pointer" }}>
                      <input
                        type="file"
                        accept=".yaml,.yml,.json"
                        style={{ display: "none" }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          try {
                            const text = await file.text();
                            const res = await fetch("/api/load-config", {
                              method: "POST",
                              headers: { "Content-Type": "text/plain" },
                              body: text,
                            });
                            const json = await res.json();
                            if (json.ok && json.config) {
                              setTransformConfig(json.config);
                              alert("Config imported successfully!");
                            } else {
                              alert(`Failed to import config: ${json.error}`);
                            }
                          } catch (err: any) {
                            alert(`Error importing config: ${err.message}`);
                          }
                          
                          // Reset file input
                          e.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = ".yaml,.yml,.json";
                          input.onchange = async (e: any) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            try {
                              const text = await file.text();
                              const res = await fetch("/api/load-config", {
                                method: "POST",
                                headers: { "Content-Type": "text/plain" },
                                body: text,
                              });
                              const json = await res.json();
                              if (json.ok && json.config) {
                                setTransformConfig(json.config);
                                alert("Config imported successfully!");
                              } else {
                                alert(`Failed to import config: ${json.error}`);
                              }
                            } catch (err: any) {
                              alert(`Error importing config: ${err.message}`);
                            }
                          };
                          input.click();
                        }}
                      >
                        Import config
                      </button>
                    </label>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/save-config?format=yaml", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(transformConfig),
                          });
                          
                          if (res.ok) {
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "openmcp.config.yaml";
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          } else {
                            const json = await res.json();
                            alert(`Failed to export config: ${json.error}`);
                          }
                        } catch (err: any) {
                          alert(`Error exporting config: ${err.message}`);
                        }
                      }}
                    >
                      Export config
                    </button>
                  </div>
                </div>
                
                {/* Search and Filters */}
                <div style={{ marginBottom: "1rem" }}>
                  <input
                    type="text"
                    placeholder="Search tools…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      marginBottom: "0.75rem",
                      background: "var(--bg)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.25rem",
                      color: "var(--text-primary)",
                      fontSize: "0.9rem"
                    }}
                  />
                  
                  <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={hideDisabled}
                        onChange={(e) => setHideDisabled(e.target.checked)}
                      />
                      Hide disabled
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={hideInternalAdmin}
                        onChange={(e) => setHideInternalAdmin(e.target.checked)}
                      />
                      Hide internal/admin paths
                    </label>
                  </div>
                  
                  {/* Tool Count Display */}
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                    {selectedOps} tools selected · {hiddenOps} hidden
                  </div>
                </div>
                
                <div className="operations-list" style={{ maxHeight: "600px", overflowY: "auto", marginBottom: "1rem" }}>
                  {filteredGroups.map((group) => {
                  const isExpanded = expandedGroups.has(group.tag);
                  const toggleGroup = () => {
                    const newExpanded = new Set(expandedGroups);
                    if (isExpanded) {
                      newExpanded.delete(group.tag);
                    } else {
                      newExpanded.add(group.tag);
                    }
                    setExpandedGroups(newExpanded);
                  };
                  
                  return (
                    <div key={group.tag} className="operation-group" style={{
                      marginBottom: "1rem",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      overflow: "hidden"
                    }}>
                      <button
                        type="button"
                        onClick={toggleGroup}
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem",
                          background: "var(--card-bg)",
                          border: "none",
                          borderBottom: isExpanded ? "1px solid var(--border-color)" : "none",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          color: "var(--text-primary)",
                          fontSize: "0.95rem",
                          fontWeight: "500"
                        }}
                      >
                        <span>
                          {group.tag === "untagged" ? "Untagged" : group.tag} ({group.operations.length})
                        </span>
                        <span style={{ fontSize: "0.75rem" }}>
                          {isExpanded ? "▼" : "▶"}
                        </span>
                      </button>
                      
                      {isExpanded && (
                        <div style={{ padding: "0.5rem" }}>
                          {group.operations.map((op) => {
                            const opConfig = transformConfig.tools?.[op.operationId] || {};
                            const enabled = opConfig.enabled !== false; // Default to enabled
                            const hasCustomName = !!opConfig.name;
                            const hasCustomDesc = !!opConfig.description;
                            const isChanged = hasCustomName || hasCustomDesc;
                            
                            return (
                              <div 
                                key={op.operationId} 
                                className="operation-item" 
                                style={{ 
                                  padding: "0.75rem", 
                                  marginBottom: "0.5rem", 
                                  background: enabled ? "var(--card-bg)" : "rgba(255, 255, 255, 0.05)",
                                  borderRadius: "0.5rem",
                                  border: "1px solid var(--border-color)",
                                  opacity: enabled ? 1 : 0.6
                                }}
                                title={op.operationId}
                              >
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                                  <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={(e) => {
                                      setTransformConfig(prev => ({
                                        ...prev,
                                        tools: {
                                          ...prev.tools,
                                          [op.operationId]: {
                                            ...prev.tools?.[op.operationId],
                                            enabled: e.target.checked,
                                          },
                                        },
                                      }));
                                    }}
                                    style={{ marginTop: "0.25rem" }}
                                  />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                                      <code style={{ fontSize: "0.875rem", color: "var(--accent)" }}>{op.method.toUpperCase()}</code>
                                      <code style={{ fontSize: "0.875rem" }}>{op.path}</code>
                                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{op.operationId}</span>
                                      {isChanged && (
                                        <span style={{
                                          fontSize: "0.7rem",
                                          padding: "0.15rem 0.4rem",
                                          background: "var(--accent)",
                                          color: "white",
                                          borderRadius: "0.25rem"
                                        }}>Changed</span>
                                      )}
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Tool name (auto-generated if empty)"
                                      value={opConfig.name || ""}
                                      onChange={(e) => {
                                        setTransformConfig(prev => ({
                                          ...prev,
                                          tools: {
                                            ...prev.tools,
                                            [op.operationId]: {
                                              ...prev.tools?.[op.operationId],
                                              name: e.target.value || undefined,
                                            },
                                          },
                                        }));
                                      }}
                                      style={{ 
                                        width: "100%", 
                                        padding: "0.5rem", 
                                        marginBottom: "0.5rem",
                                        background: "var(--bg)",
                                        border: "1px solid var(--border-color)",
                                        borderRadius: "0.25rem",
                                        color: "var(--text-primary)"
                                      }}
                                    />
                                    <textarea
                                      placeholder="Tool description (auto-generated if empty)"
                                      value={opConfig.description || ""}
                                      onChange={(e) => {
                                        setTransformConfig(prev => ({
                                          ...prev,
                                          tools: {
                                            ...prev.tools,
                                            [op.operationId]: {
                                              ...prev.tools?.[op.operationId],
                                              description: e.target.value || undefined,
                                            },
                                          },
                                        }));
                                      }}
                                      rows={2}
                                      style={{ 
                                        width: "100%", 
                                        padding: "0.5rem",
                                        background: "var(--bg)",
                                        border: "1px solid var(--border-color)",
                                        borderRadius: "0.25rem",
                                        color: "var(--text-primary)",
                                        fontSize: "0.875rem"
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>

                <button
                type="button"
                className="btn-primary"
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const openapiValue = openapiInputMode === "url" ? openapiUrl.trim() : openapiText.trim();
                    const res = await fetch("/api/generate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        openapiUrlOrText: openapiValue,
                        serviceName: serviceName.trim(),
                        transport: "http",
                        authType,
                        authHeader: authHeader.trim() || undefined,
                        transform: transformConfig,
                      }),
                    });
                    const json = await res.json();
                    if (json.ok) {
                      setCodePreview(json.codePreview || "");
                      if (json.projectId) {
                        setResult(prev => prev ? { ...prev, projectId: json.projectId } : null);
                      }
                    } else {
                      alert(`Generation failed: ${json.error}`);
                    }
                  } catch (err: any) {
                    alert(`Error: ${err.message}`);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
              >
                Apply Transform & Regenerate
              </button>
              </div>
            );
          })()}

          {/* Code Preview */}
          {codePreview && (
            <div className="code-preview-section" style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--border-color)" }}>
              <h3>Generated Code Preview</h3>
              <pre style={{ 
                background: "var(--card-bg)", 
                padding: "1rem", 
                borderRadius: "0.5rem",
                overflow: "auto",
                fontSize: "0.875rem",
                maxHeight: "500px",
                border: "1px solid var(--border-color)"
              }}>
                <code>{codePreview}</code>
              </pre>
            </div>
          )}
        </div>

        {(isLoading || result?.ok) && statusSteps.length > 0 && (
          <div className="status-card">
            {isLoading && (
              <div className="progress-section">
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="progress-text">{progress}%</div>
              </div>
            )}
            <div className="status-steps">
              {statusSteps.map((step, idx) => (
                <div key={idx} className={`status-step status-${step.status}`}>
                  <span className="status-icon">
                    {step.status === 'completed' && '✓'}
                    {step.status === 'in-progress' && '⟳'}
                    {step.status === 'error' && '✗'}
                    {step.status === 'pending' && '○'}
                  </span>
                  <span className="status-text">
                    {step.step}
                    {step.status === 'completed' && step.duration && (
                      <span className="status-duration"> ({formatDuration(step.duration)})</span>
                    )}
                  </span>
                  {step.message && <span className="status-message">{step.message}</span>}
                  {step.timestamp && (
                    <span className="status-time">
                      {step.timestamp.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Generated Card - Appears after generation */}
        {result?.ok && mode === "public" && (
          <div className="workflow-card generated-card">
            <div className="workflow-step-header">
              <span className="step-number">2</span>
              <div>
                <h2>MCP Project Generated ✅</h2>
                {deploymentTime && (
                  <p className="step-time">Generated in {formatTime(deploymentTime)}</p>
                )}
              </div>
            </div>
            
            <p className="card-description">You can download and run or deploy it yourself.</p>
            
            {/* Verification Summary */}
            <div className="verification-summary">
              <h3>Verification Summary</h3>
              <div className="verification-items">
                {result.validation && (
                  <>
                    <div className="verification-item">
                      <span className="check-icon">✅</span>
                      <span>
                        Spec validated ({result.validation.pathCount || 0} paths, {result.validation.operationCount || 0} operations)
                      </span>
                    </div>
                    <div className="verification-item">
                      <span className="check-icon">✅</span>
                      <span>MCP project scaffolded</span>
                    </div>
                  </>
                )}
                {result.manifest && (
                  <div className="verification-item">
                    <span className="check-icon">✅</span>
                    <span>{result.manifest.toolCount} tools inferred</span>
                  </div>
                )}
                {result.schemaValidation && (
                  <div className="verification-item">
                    {result.schemaValidation.ok ? (
                      <>
                        <span className="check-icon">✅</span>
                        <span>Schemas compiled successfully</span>
                      </>
                    ) : (
                      <>
                        <span className="warning-icon">⚠️</span>
                        <span>Some tool schemas have issues</span>
                        <div className="schema-errors">
                          {result.schemaValidation.errors.slice(0, 3).map((err, i) => (
                            <div key={i} className="schema-error">{err}</div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tools Preview */}
            {result.manifest && result.manifest.tools.length > 0 && (
              <div className="tools-preview">
                <h3>Tools Preview ({result.manifest.toolCount} tools)</h3>
                <div className="tools-list">
                  {result.manifest.tools.map((tool, i) => (
                    <div key={i} className="tool-item">
                      <code className="tool-name">{tool.name}</code>
                      <span className="tool-method">{tool.method}</span>
                      <span className="tool-path">{tool.path}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Download Card - Primary in public mode */}
            {result.projectId && (
              <div className="action-section">
                <h3>Download MCP Project</h3>
                <a 
                  href={`/api/download/${result.projectId}`}
                  download
                  className="btn-primary btn-large"
                  style={{ display: "inline-block", textDecoration: "none", marginTop: "1rem" }}
                >
                  Download MCP Project (.zip)
        </a>
      </div>
            )}

            {/* Instructions for running locally */}
            <div className="action-section" style={{ marginTop: "1.5rem" }}>
              <h3>Run locally as MCP (stdio)</h3>
              <pre style={{ 
                background: "var(--card-bg)", 
                padding: "1rem", 
                borderRadius: "0.5rem",
                overflow: "auto",
                fontSize: "0.875rem"
              }}>
{`cd <unzipped-folder>
npm install
npm run mcp:stdio`}
              </pre>
            </div>

            {/* Instructions for deploying to own Cloudflare */}
            <div className="action-section" style={{ marginTop: "1.5rem" }}>
              <h3>Deploy to your own Cloudflare</h3>
              <pre style={{ 
                background: "var(--card-bg)", 
                padding: "1rem", 
                borderRadius: "0.5rem",
                overflow: "auto",
                fontSize: "0.875rem"
              }}>
{`cd <unzipped-folder>
npm install
npx wrangler deploy`}
              </pre>
            </div>

            {/* Note about secrets - Only show if deploy is enabled */}
            {result.envVarName && capabilities?.deployEnabled && (
              <div className="token-help" style={{ marginTop: "1.5rem" }}>
                <p className="help-text">
                  <strong>Note:</strong> If your API needs auth, set secrets with:
                  <br />
                  <code>npx wrangler secret put {result.envVarName}</code>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Generated Card - Local mode */}
        {result?.ok && mode === "local" && (
          <div className="workflow-card generated-card">
            <div className="workflow-step-header">
              <span className="step-number">2</span>
      <div>
                <h2>MCP Generated {capabilities?.deployEnabled && result.mcpUrl ? "& Deployed" : ""} ✅</h2>
                {deploymentTime && (
                  <p className="step-time">Generated in {formatTime(deploymentTime)}</p>
                )}
              </div>
            </div>
            
            {result.mcpUrl && capabilities?.deployEnabled && (
              <>
                <p className="card-description">MCP URL (use in ChatGPT / MCP Inspector):</p>
                <div className="url-display" style={{ marginTop: "1rem" }}>
                  <code>{result.mcpUrl}</code>
                  <button 
                    className="btn-copy"
                    onClick={() => copyToClipboard(result.mcpUrl!)}
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
              </>
            )}

            {!capabilities?.deployEnabled && (
              <>
                <p className="card-description">MCP project generated successfully. Download and run it locally or deploy to your own infrastructure.</p>
                {result.projectId && (
                  <div className="action-section" style={{ marginTop: "1rem" }}>
                    <a 
                      href={`/api/download/${result.projectId}`}
                      download
                      className="btn-primary btn-large"
                      style={{ display: "inline-block", textDecoration: "none" }}
                    >
                      Download MCP Bundle (.zip)
        </a>
      </div>
                )}
              </>
            )}

            {/* Code Preview in local mode */}
            {codePreview && (
              <div className="action-section" style={{ marginTop: "1.5rem" }}>
                <h3>Generated Code Preview</h3>
                <pre style={{ 
                  background: "var(--card-bg)", 
                  padding: "1rem", 
                  borderRadius: "0.5rem",
                  overflow: "auto",
                  fontSize: "0.875rem",
                  maxHeight: "400px",
                  border: "1px solid var(--border-color)"
                }}>
                  <code>{codePreview}</code>
                </pre>
              </div>
            )}

            {/* Download Card - Secondary in local mode */}
            <div className="action-section" style={{ marginTop: "1.5rem" }}>
              <h3>Also available locally</h3>
              <pre style={{ 
                background: "var(--card-bg)", 
                padding: "1rem", 
                borderRadius: "0.5rem",
                overflow: "auto",
                fontSize: "0.875rem"
              }}>
{`cd ${result.outDir || '<dir>'}
npm install
npm run mcp:stdio`}
              </pre>
            </div>
            
            {/* Download button */}
            <div className="action-section" style={{ marginTop: "1rem" }}>
              <button 
                className="btn-secondary btn-medium"
                onClick={handleDownload}
              >
                Download MCP Project (.zip)
        </button>
            </div>

            {/* CLI Commands - Tertiary */}
            <div className="cli-section">
              <button 
                className="cli-toggle"
                onClick={() => setShowCliCommands(!showCliCommands)}
              >
                {showCliCommands ? '▼' : '▶'} Show CLI commands
              </button>
              {showCliCommands && (
                <div className="cli-commands">
                    <div className="cli-command">
                      <label>Generate MCP:</label>
                      <div className="command-display">
                        <code>npx ts-node packages/cli/src/index.ts --openapi {(openapiInputMode === "url" ? openapiUrl : "<spec-text>") || '<url>'} --out &lt;dir&gt; --service-name {serviceName} --transport http</code>
                        <button 
                          className="btn-copy"
                          onClick={() => copyToClipboard(`npx ts-node packages/cli/src/index.ts --openapi ${(openapiInputMode === "url" ? openapiUrl : "<spec-text>") || '<url>'} --out <dir> --service-name ${serviceName} --transport http`)}
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  <div className="cli-command">
                    <label>Deploy:</label>
                    <div className="command-display">
                      <code>cd &lt;dir&gt; && npm install && npm run build && npx wrangler deploy</code>
                      <button 
                        className="btn-copy"
                        onClick={() => copyToClipboard('cd <dir> && npm install && npm run build && npx wrangler deploy')}
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Deploy Card - Only in local mode and if deploy is enabled */}
        {result?.ok && mode === "local" && capabilities?.deployEnabled && (
          <div className="workflow-card deploy-card">
            <div className="workflow-step-header">
              <span className="step-number">3</span>
              <h2>Deploy to Cloudflare (Optional)</h2>
            </div>
            
            {!deployResult && !isDeploying && (
              <>
                <p className="card-description">
                  Uses your Cloudflare account to host the MCP as a Worker.
                </p>
                <button 
                  className="btn-primary btn-large"
                  onClick={handleDeploy}
                  disabled={isDeploying}
                >
                  Deploy to Cloudflare (Optional)
                </button>
              </>
            )}
            
            {(isDeploying || deployResult?.ok) && deployStatusSteps.length > 0 && (
              <div className="deploy-status-panel">
                {isDeploying && (
                  <div className="progress-section">
                    <div className="progress-bar-container">
                      <div className="progress-bar" style={{ width: `${deployProgress}%` }}></div>
      </div>
                    <div className="progress-text">{deployProgress}%</div>
                  </div>
                )}
                <div className="status-steps">
                  {deployStatusSteps.map((step, idx) => (
                    <div key={idx} className={`status-step status-${step.status}`}>
                      <span className="status-icon">
                        {step.status === 'completed' && '✓'}
                        {step.status === 'in-progress' && '⟳'}
                        {step.status === 'error' && '✗'}
                        {step.status === 'pending' && '○'}
                      </span>
                      <span className="status-text">
                        {step.step}
                        {step.status === 'completed' && step.duration && (
                          <span className="status-duration"> ({formatDuration(step.duration)})</span>
                        )}
                      </span>
                      {step.message && <span className="status-message">{step.message}</span>}
                      {step.timestamp && (
                        <span className="status-time">
                          {step.timestamp.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {deployResult?.ok && deployResult.mcpUrl && (
              <div className="deploy-success">
                <p className="success-message">
                  ✓ Deployment successful!
                  {deployTime && (
                    <span className="deployment-time-inline"> (Deployed in {formatTime(deployTime)})</span>
                  )}
                </p>
                <div className="mcp-url-section">
                  <label>Your MCP Server URL</label>
                  <div className="url-display">
                    <code>{deployResult.mcpUrl}</code>
                    <button 
                      className="btn-copy"
                      onClick={() => copyToClipboard(deployResult.mcpUrl!)}
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
      </div>
                  <p className="help-text">Use this URL in ChatGPT or MCP Inspector</p>
                </div>
                {deployResult.envVarName && (
                  <div className="env-var-section">
                    <div className="env-var-header">
                      <h4>Step 4: Set Your API Token</h4>
                      <p className="env-var-description">
                        Your MCP server needs an API token to authenticate with {serviceName}. Run this command in your terminal and paste your token when prompted.
                      </p>
                    </div>
                    <div className="command-display">
                      <code>npx wrangler secret put {deployResult.envVarName}</code>
                      <button 
                        className="btn-copy"
                        onClick={() => copyToClipboard(`npx wrangler secret put ${deployResult.envVarName}`)}
                        title="Copy to clipboard"
                      >
                        📋
        </button>
                    </div>
                    <div className="token-help">
                      <p className="help-text">
                        <strong>Important:</strong> You must set this token before your MCP server can make authenticated API calls. 
                        Get your API token from your {serviceName} account settings or developer portal.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {deployResult && !deployResult.ok && (
              <div className="deploy-error">
                <p className="error-text">Deployment failed: {deployResult.error}</p>
                <button 
                  className="btn-secondary"
                  onClick={handleDeploy}
                >
                  Retry Deployment
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Test Card - Appears after successful deployment */}
        {(() => {
          // Determine the MCP URL to use: prefer result.mcpUrl (auto-deployment) or fall back to deployResult.mcpUrl (manual deployment)
          const mcpUrl = result?.mcpUrl || deployResult?.mcpUrl;
          const hasMcpUrl = (result?.ok && result.mcpUrl) || (deployResult?.ok && deployResult.mcpUrl);
          
          if (!hasMcpUrl) return null;
          
          return (
            <div className="workflow-card test-card">
              <div className="workflow-step-header">
                <span className="step-number">4</span>
                <h2>Test Your MCP Server</h2>
              </div>
              
              {mcpTools.length === 0 && !isLoadingTools && !toolsError && (
                <button 
                  className="btn-secondary"
                  onClick={() => loadMcpTools(mcpUrl!)}
                >
                  Load Available Tools
                </button>
              )}
              
              {isLoadingTools && (
                <div className="loading-tools">
                  <span className="status-icon">⟳</span>
                  <span>Loading tools from MCP server...</span>
                </div>
              )}
              
              {toolsError && (
                <div className="tools-error">
                  <p className="error-text">Error: {toolsError}</p>
                  <button 
                    className="btn-secondary"
                    onClick={() => loadMcpTools(mcpUrl!)}
                  >
                    Retry
                  </button>
                </div>
              )}
              
              {mcpTools.length > 0 && (
                <div className="tool-tester">
                  <div className="tool-selector">
                    <label>Select a tool to test:</label>
                    {/* Search input with real-time filtered dropdown */}
                    <div className="tool-search-wrapper">
                      <input
                        type="text"
                        className="tool-search"
                        placeholder="🔍 Search tools by name or description..."
                        value={toolSearchQuery}
                        onChange={(e) => {
                          setToolSearchQuery(e.target.value);
                          setShowToolDropdown(true);
                          // Clear selection if search query changes and current tool doesn't match
                          if (selectedTool && e.target.value) {
                            const currentTool = mcpTools.find(t => t.name === selectedTool);
                            if (currentTool) {
                              const query = e.target.value.toLowerCase();
                              const matches = currentTool.name.toLowerCase().includes(query) || 
                                            currentTool.description.toLowerCase().includes(query);
                              if (!matches) {
                                setSelectedTool("");
                                setToolArgs({});
                                setToolResult(null);
                              }
                            }
                          }
                        }}
                        onFocus={() => setShowToolDropdown(true)}
                        onBlur={(e) => {
                          // Delay hiding to allow click on dropdown items
                          setTimeout(() => setShowToolDropdown(false), 200);
                        }}
                      />
                      {/* Real-time filtered dropdown */}
                      {showToolDropdown && (
                        <div className="tool-dropdown">
                          {(() => {
                            const filteredTools = mcpTools.filter(tool => {
                              if (!toolSearchQuery.trim()) return true;
                              const query = toolSearchQuery.toLowerCase();
                              return tool.name.toLowerCase().includes(query) || 
                                     tool.description.toLowerCase().includes(query);
                            });
                            
                            if (filteredTools.length === 0) {
                              return (
                                <div className="tool-dropdown-item no-results">
                                  No tools found matching "{toolSearchQuery}"
                                </div>
                              );
                            }
                            
                            return (
                              <>
                                {filteredTools.map(tool => (
                                  <div
                                    key={tool.name}
                                    className={`tool-dropdown-item ${selectedTool === tool.name ? 'selected' : ''}`}
                                    onClick={() => {
                                      setSelectedTool(tool.name);
                                      setToolSearchQuery(tool.name); // Show selected tool name
                                      setToolArgs({});
                                      setToolResult(null);
                                      setShowToolDropdown(false);
                                    }}
                                    onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                                  >
                                    <div className="tool-dropdown-name">{tool.name}</div>
                                    <div className="tool-dropdown-description">{tool.description}</div>
                                  </div>
                                ))}
                                {toolSearchQuery.trim() && (
                                  <div className="tool-dropdown-footer">
                                    {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} found
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedToolSchema && (
                    <div className="tool-args">
                      <label>Arguments:</label>
                      {selectedToolSchema.inputSchema.properties ? (
                        Object.entries(selectedToolSchema.inputSchema.properties).map(([key, schema]: [string, any]) => (
                          <div key={key} className="arg-input">
                            <label>{key} {selectedToolSchema.inputSchema.required?.includes(key) && '*'}</label>
                            {schema.type === 'boolean' ? (
                              <select
                                value={toolArgs[key] === undefined ? '' : String(toolArgs[key])}
                                onChange={(e) => {
                                  const value = e.target.value === '' ? undefined : e.target.value === 'true';
                                  setToolArgs({ ...toolArgs, [key]: value });
                                }}
                                style={{
                                  width: "100%",
                                  padding: "0.5rem",
                                  background: "var(--bg)",
                                  border: "1px solid var(--border-color)",
                                  borderRadius: "0.25rem",
                                  color: "var(--text-primary)"
                                }}
                              >
                                <option value="">-- Select --</option>
                                <option value="true">true</option>
                                <option value="false">false</option>
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={toolArgs[key] !== undefined && toolArgs[key] !== null ? String(toolArgs[key]) : ''}
                                onChange={(e) => {
                                  // Keep as string during typing for all types
                                  // Type conversion will happen on execute
                                  setToolArgs({ ...toolArgs, [key]: e.target.value });
                                }}
                                placeholder={schema.description || `Enter ${key}`}
                              />
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="no-args">This tool requires no arguments</p>
                      )}
                      <button
                        className="btn-primary"
                        onClick={() => executeTool(mcpUrl!)}
                        disabled={isExecutingTool}
                      >
                        {isExecutingTool ? 'Executing...' : 'Execute Tool'}
                      </button>
                    </div>
                  )}

                  {toolResult && (
                    <div className="tool-result">
                      <label>Result:</label>
                      <pre>{JSON.stringify(toolResult, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* Error Card */}
        {result && !result.ok && (
          <div className="workflow-card error-card">
            <div className="workflow-step-header">
              <span className="step-number error">✗</span>
              <h2>Generation Failed</h2>
            </div>
            <div className="error-message">
              <pre>{result.error}</pre>
            </div>
            <button 
              className="btn-secondary"
              onClick={() => {
                setResult(null);
                setStatusSteps([]);
                setProgress(0);
              }}
            >
              Try Again
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default App;
