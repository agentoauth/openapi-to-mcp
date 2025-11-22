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
  const [openapiUrl, setOpenapiUrl] = useState("");
  const [openapiInputMode, setOpenapiInputMode] = useState<"url" | "text">("url");
  const [openapiText, setOpenapiText] = useState("");
  const [serviceName, setServiceName] = useState("weather");
  const [authType, setAuthType] = useState<"none" | "apiKey" | "bearer">("none");
  const [authHeader, setAuthHeader] = useState("");

  // Detect mode on mount
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
      const response = await fetch(mcpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'tools/call',
          params: {
            name: selectedTool,
            arguments: toolArgs,
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
            <h2>Generate MCP Server</h2>
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

            {/* Note about secrets */}
            {result.envVarName && (
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
                <h2>MCP Generated & Deployed ✅</h2>
                {deploymentTime && (
                  <p className="step-time">Generated in {formatTime(deploymentTime)}</p>
                )}
              </div>
            </div>
            
            {result.mcpUrl && (
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

        {/* Step 3: Deploy Card - Only in local mode, for manual re-deployment */}
        {result?.ok && mode === "local" && (
          <div className="workflow-card deploy-card">
            <div className="workflow-step-header">
              <span className="step-number">3</span>
              <h2>Deploy to MCP Cloud</h2>
            </div>
            
            {!deployResult && !isDeploying && (
              <>
                <p className="card-description">Deploy your MCP server to Cloudflare Workers and get a live URL instantly.</p>
                <button 
                  className="btn-primary btn-large"
                  onClick={handleDeploy}
                  disabled={isDeploying}
                >
                  Deploy to MCP Cloud
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
                            <input
                              type="text"
                              value={toolArgs[key] || ''}
                              onChange={(e) => {
                                let value: any = e.target.value;
                                if (schema.type === 'object' || schema.type === 'array') {
                                  try {
                                    value = JSON.parse(e.target.value);
                                  } catch {}
                                } else if (schema.type === 'number' || schema.type === 'integer') {
                                  value = Number(e.target.value);
                                } else if (schema.type === 'boolean') {
                                  value = e.target.value === 'true';
                                }
                                setToolArgs({ ...toolArgs, [key]: value });
                              }}
                              placeholder={schema.description || `Enter ${key}`}
                            />
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
