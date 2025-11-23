export interface Env {
  API_BASE_URL?: string;
  USER_AGENT?: string;
}

export async function alerts_query(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/alerts";

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["active"] !== undefined) {
    if (Array.isArray(args["active"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["active"].length > 0) {
        for (const item of args["active"]) {
          url.searchParams.append("active[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("active", String(args["active"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /alerts failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function alerts_active(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/alerts/active";

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /alerts/active failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function alerts_active_count(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/alerts/active/count";

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /alerts/active/count failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function alerts_active_zone(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/alerts/active/zone/{zoneId}";
  if (args["zoneId"] === undefined) {
    throw new Error("Missing required path parameter: zoneId");
  }
  path = path.replace("{ zoneId }".replace(/ /g, ""), encodeURIComponent(String(args["zoneId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /alerts/active/zone/{zoneId} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function alerts_active_area(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/alerts/active/area/{area}";
  if (args["area"] === undefined) {
    throw new Error("Missing required path parameter: area");
  }
  path = path.replace("{ area }".replace(/ /g, ""), encodeURIComponent(String(args["area"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /alerts/active/area/{area} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function alerts_active_region(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/alerts/active/region/{region}";
  if (args["region"] === undefined) {
    throw new Error("Missing required path parameter: region");
  }
  path = path.replace("{ region }".replace(/ /g, ""), encodeURIComponent(String(args["region"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /alerts/active/region/{region} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function alerts_types(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/alerts/types";

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /alerts/types failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function alerts_single(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/alerts/{id}";
  if (args["id"] === undefined) {
    throw new Error("Missing required path parameter: id");
  }
  path = path.replace("{ id }".replace(/ /g, ""), encodeURIComponent(String(args["id"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /alerts/{id} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function cwsu(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/aviation/cwsus/{cwsuId}";
  if (args["cwsuId"] === undefined) {
    throw new Error("Missing required path parameter: cwsuId");
  }
  path = path.replace("{ cwsuId }".replace(/ /g, ""), encodeURIComponent(String(args["cwsuId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /aviation/cwsus/{cwsuId} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function cwas(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/aviation/cwsus/{cwsuId}/cwas";
  if (args["cwsuId"] === undefined) {
    throw new Error("Missing required path parameter: cwsuId");
  }
  path = path.replace("{ cwsuId }".replace(/ /g, ""), encodeURIComponent(String(args["cwsuId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /aviation/cwsus/{cwsuId}/cwas failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function cwa(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/aviation/cwsus/{cwsuId}/cwas/{date}/{sequence}";
  if (args["sequence"] === undefined) {
    throw new Error("Missing required path parameter: sequence");
  }
  path = path.replace("{ sequence }".replace(/ /g, ""), encodeURIComponent(String(args["sequence"])));
  if (args["cwsuId"] === undefined) {
    throw new Error("Missing required path parameter: cwsuId");
  }
  path = path.replace("{ cwsuId }".replace(/ /g, ""), encodeURIComponent(String(args["cwsuId"])));
  if (args["date"] === undefined) {
    throw new Error("Missing required path parameter: date");
  }
  path = path.replace("{ date }".replace(/ /g, ""), encodeURIComponent(String(args["date"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /aviation/cwsus/{cwsuId}/cwas/{date}/{sequence} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function sigmetquery(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/aviation/sigmets";

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["atsu"] !== undefined) {
    if (Array.isArray(args["atsu"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["atsu"].length > 0) {
        for (const item of args["atsu"]) {
          url.searchParams.append("atsu[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("atsu", String(args["atsu"]));
    }
  }
  if (args["sequence"] !== undefined) {
    if (Array.isArray(args["sequence"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["sequence"].length > 0) {
        for (const item of args["sequence"]) {
          url.searchParams.append("sequence[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("sequence", String(args["sequence"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /aviation/sigmets failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function sigmetsbyatsu(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/aviation/sigmets/{atsu}";
  if (args["atsu"] === undefined) {
    throw new Error("Missing required path parameter: atsu");
  }
  path = path.replace("{ atsu }".replace(/ /g, ""), encodeURIComponent(String(args["atsu"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /aviation/sigmets/{atsu} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function sigmetsbyatsubydate(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/aviation/sigmets/{atsu}/{date}";
  if (args["atsu"] === undefined) {
    throw new Error("Missing required path parameter: atsu");
  }
  path = path.replace("{ atsu }".replace(/ /g, ""), encodeURIComponent(String(args["atsu"])));
  if (args["date"] === undefined) {
    throw new Error("Missing required path parameter: date");
  }
  path = path.replace("{ date }".replace(/ /g, ""), encodeURIComponent(String(args["date"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /aviation/sigmets/{atsu}/{date} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function sigmet(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/aviation/sigmets/{atsu}/{date}/{time}";
  if (args["atsu"] === undefined) {
    throw new Error("Missing required path parameter: atsu");
  }
  path = path.replace("{ atsu }".replace(/ /g, ""), encodeURIComponent(String(args["atsu"])));
  if (args["date"] === undefined) {
    throw new Error("Missing required path parameter: date");
  }
  path = path.replace("{ date }".replace(/ /g, ""), encodeURIComponent(String(args["date"])));
  if (args["time"] === undefined) {
    throw new Error("Missing required path parameter: time");
  }
  path = path.replace("{ time }".replace(/ /g, ""), encodeURIComponent(String(args["time"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /aviation/sigmets/{atsu}/{date}/{time} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function glossary(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/glossary";

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /glossary failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function gridpoint(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/gridpoints/{wfo}/{x},{y}";
  if (args["wfo"] === undefined) {
    throw new Error("Missing required path parameter: wfo");
  }
  path = path.replace("{ wfo }".replace(/ /g, ""), encodeURIComponent(String(args["wfo"])));
  if (args["x"] === undefined) {
    throw new Error("Missing required path parameter: x");
  }
  path = path.replace("{ x }".replace(/ /g, ""), encodeURIComponent(String(args["x"])));
  if (args["y"] === undefined) {
    throw new Error("Missing required path parameter: y");
  }
  path = path.replace("{ y }".replace(/ /g, ""), encodeURIComponent(String(args["y"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /gridpoints/{wfo}/{x},{y} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function gridpoint_forecast(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/gridpoints/{wfo}/{x},{y}/forecast";
  if (args["wfo"] === undefined) {
    throw new Error("Missing required path parameter: wfo");
  }
  path = path.replace("{ wfo }".replace(/ /g, ""), encodeURIComponent(String(args["wfo"])));
  if (args["x"] === undefined) {
    throw new Error("Missing required path parameter: x");
  }
  path = path.replace("{ x }".replace(/ /g, ""), encodeURIComponent(String(args["x"])));
  if (args["y"] === undefined) {
    throw new Error("Missing required path parameter: y");
  }
  path = path.replace("{ y }".replace(/ /g, ""), encodeURIComponent(String(args["y"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /gridpoints/{wfo}/{x},{y}/forecast failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function gridpoint_forecast_hourly(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/gridpoints/{wfo}/{x},{y}/forecast/hourly";
  if (args["wfo"] === undefined) {
    throw new Error("Missing required path parameter: wfo");
  }
  path = path.replace("{ wfo }".replace(/ /g, ""), encodeURIComponent(String(args["wfo"])));
  if (args["x"] === undefined) {
    throw new Error("Missing required path parameter: x");
  }
  path = path.replace("{ x }".replace(/ /g, ""), encodeURIComponent(String(args["x"])));
  if (args["y"] === undefined) {
    throw new Error("Missing required path parameter: y");
  }
  path = path.replace("{ y }".replace(/ /g, ""), encodeURIComponent(String(args["y"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /gridpoints/{wfo}/{x},{y}/forecast/hourly failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function gridpoint_stations(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/gridpoints/{wfo}/{x},{y}/stations";
  if (args["wfo"] === undefined) {
    throw new Error("Missing required path parameter: wfo");
  }
  path = path.replace("{ wfo }".replace(/ /g, ""), encodeURIComponent(String(args["wfo"])));
  if (args["x"] === undefined) {
    throw new Error("Missing required path parameter: x");
  }
  path = path.replace("{ x }".replace(/ /g, ""), encodeURIComponent(String(args["x"])));
  if (args["y"] === undefined) {
    throw new Error("Missing required path parameter: y");
  }
  path = path.replace("{ y }".replace(/ /g, ""), encodeURIComponent(String(args["y"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /gridpoints/{wfo}/{x},{y}/stations failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function icons(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/icons/{set}/{timeOfDay}/{first}";
  if (args["set"] === undefined) {
    throw new Error("Missing required path parameter: set");
  }
  path = path.replace("{ set }".replace(/ /g, ""), encodeURIComponent(String(args["set"])));
  if (args["timeOfDay"] === undefined) {
    throw new Error("Missing required path parameter: timeOfDay");
  }
  path = path.replace("{ timeOfDay }".replace(/ /g, ""), encodeURIComponent(String(args["timeOfDay"])));
  if (args["first"] === undefined) {
    throw new Error("Missing required path parameter: first");
  }
  path = path.replace("{ first }".replace(/ /g, ""), encodeURIComponent(String(args["first"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["size"] !== undefined) {
    if (Array.isArray(args["size"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["size"].length > 0) {
        for (const item of args["size"]) {
          url.searchParams.append("size[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("size", String(args["size"]));
    }
  }
  if (args["fontsize"] !== undefined) {
    if (Array.isArray(args["fontsize"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["fontsize"].length > 0) {
        for (const item of args["fontsize"]) {
          url.searchParams.append("fontsize[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("fontsize", String(args["fontsize"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /icons/{set}/{timeOfDay}/{first} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function iconsdualcondition(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/icons/{set}/{timeOfDay}/{first}/{second}";
  if (args["set"] === undefined) {
    throw new Error("Missing required path parameter: set");
  }
  path = path.replace("{ set }".replace(/ /g, ""), encodeURIComponent(String(args["set"])));
  if (args["timeOfDay"] === undefined) {
    throw new Error("Missing required path parameter: timeOfDay");
  }
  path = path.replace("{ timeOfDay }".replace(/ /g, ""), encodeURIComponent(String(args["timeOfDay"])));
  if (args["first"] === undefined) {
    throw new Error("Missing required path parameter: first");
  }
  path = path.replace("{ first }".replace(/ /g, ""), encodeURIComponent(String(args["first"])));
  if (args["second"] === undefined) {
    throw new Error("Missing required path parameter: second");
  }
  path = path.replace("{ second }".replace(/ /g, ""), encodeURIComponent(String(args["second"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["size"] !== undefined) {
    if (Array.isArray(args["size"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["size"].length > 0) {
        for (const item of args["size"]) {
          url.searchParams.append("size[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("size", String(args["size"]));
    }
  }
  if (args["fontsize"] !== undefined) {
    if (Array.isArray(args["fontsize"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["fontsize"].length > 0) {
        for (const item of args["fontsize"]) {
          url.searchParams.append("fontsize[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("fontsize", String(args["fontsize"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /icons/{set}/{timeOfDay}/{first}/{second} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function icons_summary(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/icons";

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /icons failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function satellite_thumbnails(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/thumbnails/satellite/{area}";
  if (args["area"] === undefined) {
    throw new Error("Missing required path parameter: area");
  }
  path = path.replace("{ area }".replace(/ /g, ""), encodeURIComponent(String(args["area"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /thumbnails/satellite/{area} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function station_observation_list(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/stations/{stationId}/observations";
  if (args["stationId"] === undefined) {
    throw new Error("Missing required path parameter: stationId");
  }
  path = path.replace("{ stationId }".replace(/ /g, ""), encodeURIComponent(String(args["stationId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["limit"] !== undefined) {
    if (Array.isArray(args["limit"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["limit"].length > 0) {
        for (const item of args["limit"]) {
          url.searchParams.append("limit[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("limit", String(args["limit"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /stations/{stationId}/observations failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function station_observation_latest(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/stations/{stationId}/observations/latest";
  if (args["stationId"] === undefined) {
    throw new Error("Missing required path parameter: stationId");
  }
  path = path.replace("{ stationId }".replace(/ /g, ""), encodeURIComponent(String(args["stationId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["require_qc"] !== undefined) {
    if (Array.isArray(args["require_qc"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["require_qc"].length > 0) {
        for (const item of args["require_qc"]) {
          url.searchParams.append("require_qc[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("require_qc", String(args["require_qc"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /stations/{stationId}/observations/latest failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function station_observation_time(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/stations/{stationId}/observations/{time}";
  if (args["time"] === undefined) {
    throw new Error("Missing required path parameter: time");
  }
  path = path.replace("{ time }".replace(/ /g, ""), encodeURIComponent(String(args["time"])));
  if (args["stationId"] === undefined) {
    throw new Error("Missing required path parameter: stationId");
  }
  path = path.replace("{ stationId }".replace(/ /g, ""), encodeURIComponent(String(args["stationId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /stations/{stationId}/observations/{time} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function tafs(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/stations/{stationId}/tafs";
  if (args["stationId"] === undefined) {
    throw new Error("Missing required path parameter: stationId");
  }
  path = path.replace("{ stationId }".replace(/ /g, ""), encodeURIComponent(String(args["stationId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /stations/{stationId}/tafs failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function taf(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/stations/{stationId}/tafs/{date}/{time}";
  if (args["stationId"] === undefined) {
    throw new Error("Missing required path parameter: stationId");
  }
  path = path.replace("{ stationId }".replace(/ /g, ""), encodeURIComponent(String(args["stationId"])));
  if (args["date"] === undefined) {
    throw new Error("Missing required path parameter: date");
  }
  path = path.replace("{ date }".replace(/ /g, ""), encodeURIComponent(String(args["date"])));
  if (args["time"] === undefined) {
    throw new Error("Missing required path parameter: time");
  }
  path = path.replace("{ time }".replace(/ /g, ""), encodeURIComponent(String(args["time"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /stations/{stationId}/tafs/{date}/{time} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function obs_stations(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/stations";

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["id"] !== undefined) {
    if (Array.isArray(args["id"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["id"].length > 0) {
        for (const item of args["id"]) {
          url.searchParams.append("id[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("id", String(args["id"]));
    }
  }
  if (args["state"] !== undefined) {
    if (Array.isArray(args["state"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["state"].length > 0) {
        for (const item of args["state"]) {
          url.searchParams.append("state[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("state", String(args["state"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /stations failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function obs_station(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/stations/{stationId}";
  if (args["stationId"] === undefined) {
    throw new Error("Missing required path parameter: stationId");
  }
  path = path.replace("{ stationId }".replace(/ /g, ""), encodeURIComponent(String(args["stationId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /stations/{stationId} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function office(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/offices/{officeId}";
  if (args["officeId"] === undefined) {
    throw new Error("Missing required path parameter: officeId");
  }
  path = path.replace("{ officeId }".replace(/ /g, ""), encodeURIComponent(String(args["officeId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /offices/{officeId} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function office_headline(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/offices/{officeId}/headlines/{headlineId}";
  if (args["headlineId"] === undefined) {
    throw new Error("Missing required path parameter: headlineId");
  }
  path = path.replace("{ headlineId }".replace(/ /g, ""), encodeURIComponent(String(args["headlineId"])));
  if (args["officeId"] === undefined) {
    throw new Error("Missing required path parameter: officeId");
  }
  path = path.replace("{ officeId }".replace(/ /g, ""), encodeURIComponent(String(args["officeId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /offices/{officeId}/headlines/{headlineId} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function office_headlines(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/offices/{officeId}/headlines";
  if (args["officeId"] === undefined) {
    throw new Error("Missing required path parameter: officeId");
  }
  path = path.replace("{ officeId }".replace(/ /g, ""), encodeURIComponent(String(args["officeId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /offices/{officeId}/headlines failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function point(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/points/{latitude},{longitude}";
  if (args["latitude"] === undefined) {
    throw new Error("Missing required path parameter: latitude");
  }
  path = path.replace("{ latitude }".replace(/ /g, ""), encodeURIComponent(String(args["latitude"])));
  if (args["longitude"] === undefined) {
    throw new Error("Missing required path parameter: longitude");
  }
  path = path.replace("{ longitude }".replace(/ /g, ""), encodeURIComponent(String(args["longitude"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /points/{latitude},{longitude} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function point_radio(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/points/{latitude},{longitude}/radio";
  if (args["latitude"] === undefined) {
    throw new Error("Missing required path parameter: latitude");
  }
  path = path.replace("{ latitude }".replace(/ /g, ""), encodeURIComponent(String(args["latitude"])));
  if (args["longitude"] === undefined) {
    throw new Error("Missing required path parameter: longitude");
  }
  path = path.replace("{ longitude }".replace(/ /g, ""), encodeURIComponent(String(args["longitude"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /points/{latitude},{longitude}/radio failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function point_stations(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/points/{latitude},{longitude}/stations";
  if (args["latitude"] === undefined) {
    throw new Error("Missing required path parameter: latitude");
  }
  path = path.replace("{ latitude }".replace(/ /g, ""), encodeURIComponent(String(args["latitude"])));
  if (args["longitude"] === undefined) {
    throw new Error("Missing required path parameter: longitude");
  }
  path = path.replace("{ longitude }".replace(/ /g, ""), encodeURIComponent(String(args["longitude"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /points/{latitude},{longitude}/stations failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function radar_servers(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/radar/servers";

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["reportingHost"] !== undefined) {
    if (Array.isArray(args["reportingHost"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["reportingHost"].length > 0) {
        for (const item of args["reportingHost"]) {
          url.searchParams.append("reportingHost[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("reportingHost", String(args["reportingHost"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /radar/servers failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function radar_server(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/radar/servers/{id}";
  if (args["id"] === undefined) {
    throw new Error("Missing required path parameter: id");
  }
  path = path.replace("{ id }".replace(/ /g, ""), encodeURIComponent(String(args["id"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["reportingHost"] !== undefined) {
    if (Array.isArray(args["reportingHost"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["reportingHost"].length > 0) {
        for (const item of args["reportingHost"]) {
          url.searchParams.append("reportingHost[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("reportingHost", String(args["reportingHost"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /radar/servers/{id} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function radar_stations(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/radar/stations";

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["stationType"] !== undefined) {
    if (Array.isArray(args["stationType"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["stationType"].length > 0) {
        for (const item of args["stationType"]) {
          url.searchParams.append("stationType[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("stationType", String(args["stationType"]));
    }
  }
  if (args["reportingHost"] !== undefined) {
    if (Array.isArray(args["reportingHost"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["reportingHost"].length > 0) {
        for (const item of args["reportingHost"]) {
          url.searchParams.append("reportingHost[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("reportingHost", String(args["reportingHost"]));
    }
  }
  if (args["host"] !== undefined) {
    if (Array.isArray(args["host"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["host"].length > 0) {
        for (const item of args["host"]) {
          url.searchParams.append("host[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("host", String(args["host"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /radar/stations failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function radar_station(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/radar/stations/{stationId}";
  if (args["stationId"] === undefined) {
    throw new Error("Missing required path parameter: stationId");
  }
  path = path.replace("{ stationId }".replace(/ /g, ""), encodeURIComponent(String(args["stationId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["reportingHost"] !== undefined) {
    if (Array.isArray(args["reportingHost"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["reportingHost"].length > 0) {
        for (const item of args["reportingHost"]) {
          url.searchParams.append("reportingHost[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("reportingHost", String(args["reportingHost"]));
    }
  }
  if (args["host"] !== undefined) {
    if (Array.isArray(args["host"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["host"].length > 0) {
        for (const item of args["host"]) {
          url.searchParams.append("host[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("host", String(args["host"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /radar/stations/{stationId} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function radar_station_alarms(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/radar/stations/{stationId}/alarms";
  if (args["stationId"] === undefined) {
    throw new Error("Missing required path parameter: stationId");
  }
  path = path.replace("{ stationId }".replace(/ /g, ""), encodeURIComponent(String(args["stationId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /radar/stations/{stationId}/alarms failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function radar_queue(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/radar/queues/{host}";
  if (args["host"] === undefined) {
    throw new Error("Missing required path parameter: host");
  }
  path = path.replace("{ host }".replace(/ /g, ""), encodeURIComponent(String(args["host"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["limit"] !== undefined) {
    if (Array.isArray(args["limit"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["limit"].length > 0) {
        for (const item of args["limit"]) {
          url.searchParams.append("limit[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("limit", String(args["limit"]));
    }
  }
  if (args["arrived"] !== undefined) {
    if (Array.isArray(args["arrived"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["arrived"].length > 0) {
        for (const item of args["arrived"]) {
          url.searchParams.append("arrived[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("arrived", String(args["arrived"]));
    }
  }
  if (args["created"] !== undefined) {
    if (Array.isArray(args["created"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["created"].length > 0) {
        for (const item of args["created"]) {
          url.searchParams.append("created[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("created", String(args["created"]));
    }
  }
  if (args["published"] !== undefined) {
    if (Array.isArray(args["published"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["published"].length > 0) {
        for (const item of args["published"]) {
          url.searchParams.append("published[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("published", String(args["published"]));
    }
  }
  if (args["station"] !== undefined) {
    if (Array.isArray(args["station"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["station"].length > 0) {
        for (const item of args["station"]) {
          url.searchParams.append("station[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("station", String(args["station"]));
    }
  }
  if (args["type"] !== undefined) {
    if (Array.isArray(args["type"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["type"].length > 0) {
        for (const item of args["type"]) {
          url.searchParams.append("type[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("type", String(args["type"]));
    }
  }
  if (args["feed"] !== undefined) {
    if (Array.isArray(args["feed"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["feed"].length > 0) {
        for (const item of args["feed"]) {
          url.searchParams.append("feed[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("feed", String(args["feed"]));
    }
  }
  if (args["resolution"] !== undefined) {
    if (Array.isArray(args["resolution"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["resolution"].length > 0) {
        for (const item of args["resolution"]) {
          url.searchParams.append("resolution[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("resolution", String(args["resolution"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /radar/queues/{host} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function radar_profiler(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/radar/profilers/{stationId}";
  if (args["stationId"] === undefined) {
    throw new Error("Missing required path parameter: stationId");
  }
  path = path.replace("{ stationId }".replace(/ /g, ""), encodeURIComponent(String(args["stationId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["time"] !== undefined) {
    if (Array.isArray(args["time"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["time"].length > 0) {
        for (const item of args["time"]) {
          url.searchParams.append("time[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("time", String(args["time"]));
    }
  }
  if (args["interval"] !== undefined) {
    if (Array.isArray(args["interval"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["interval"].length > 0) {
        for (const item of args["interval"]) {
          url.searchParams.append("interval[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("interval", String(args["interval"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /radar/profilers/{stationId} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function products_query(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/products";

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["location"] !== undefined) {
    if (Array.isArray(args["location"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["location"].length > 0) {
        for (const item of args["location"]) {
          url.searchParams.append("location[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("location", String(args["location"]));
    }
  }
  if (args["start"] !== undefined) {
    if (Array.isArray(args["start"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["start"].length > 0) {
        for (const item of args["start"]) {
          url.searchParams.append("start[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("start", String(args["start"]));
    }
  }
  if (args["end"] !== undefined) {
    if (Array.isArray(args["end"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["end"].length > 0) {
        for (const item of args["end"]) {
          url.searchParams.append("end[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("end", String(args["end"]));
    }
  }
  if (args["office"] !== undefined) {
    if (Array.isArray(args["office"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["office"].length > 0) {
        for (const item of args["office"]) {
          url.searchParams.append("office[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("office", String(args["office"]));
    }
  }
  if (args["wmoid"] !== undefined) {
    if (Array.isArray(args["wmoid"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["wmoid"].length > 0) {
        for (const item of args["wmoid"]) {
          url.searchParams.append("wmoid[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("wmoid", String(args["wmoid"]));
    }
  }
  if (args["type"] !== undefined) {
    if (Array.isArray(args["type"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["type"].length > 0) {
        for (const item of args["type"]) {
          url.searchParams.append("type[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("type", String(args["type"]));
    }
  }
  if (args["limit"] !== undefined) {
    if (Array.isArray(args["limit"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["limit"].length > 0) {
        for (const item of args["limit"]) {
          url.searchParams.append("limit[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("limit", String(args["limit"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /products failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function product_locations(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/products/locations";

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /products/locations failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function product_types(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/products/types";

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /products/types failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function product(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/products/{productId}";
  if (args["productId"] === undefined) {
    throw new Error("Missing required path parameter: productId");
  }
  path = path.replace("{ productId }".replace(/ /g, ""), encodeURIComponent(String(args["productId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /products/{productId} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function products_type(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/products/types/{typeId}";
  if (args["typeId"] === undefined) {
    throw new Error("Missing required path parameter: typeId");
  }
  path = path.replace("{ typeId }".replace(/ /g, ""), encodeURIComponent(String(args["typeId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /products/types/{typeId} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function products_type_locations(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/products/types/{typeId}/locations";
  if (args["typeId"] === undefined) {
    throw new Error("Missing required path parameter: typeId");
  }
  path = path.replace("{ typeId }".replace(/ /g, ""), encodeURIComponent(String(args["typeId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /products/types/{typeId}/locations failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function location_products(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/products/locations/{locationId}/types";
  if (args["locationId"] === undefined) {
    throw new Error("Missing required path parameter: locationId");
  }
  path = path.replace("{ locationId }".replace(/ /g, ""), encodeURIComponent(String(args["locationId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /products/locations/{locationId}/types failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function products_type_location(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/products/types/{typeId}/locations/{locationId}";
  if (args["typeId"] === undefined) {
    throw new Error("Missing required path parameter: typeId");
  }
  path = path.replace("{ typeId }".replace(/ /g, ""), encodeURIComponent(String(args["typeId"])));
  if (args["locationId"] === undefined) {
    throw new Error("Missing required path parameter: locationId");
  }
  path = path.replace("{ locationId }".replace(/ /g, ""), encodeURIComponent(String(args["locationId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /products/types/{typeId}/locations/{locationId} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function latest_product_type_location(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/products/types/{typeId}/locations/{locationId}/latest";
  if (args["typeId"] === undefined) {
    throw new Error("Missing required path parameter: typeId");
  }
  path = path.replace("{ typeId }".replace(/ /g, ""), encodeURIComponent(String(args["typeId"])));
  if (args["locationId"] === undefined) {
    throw new Error("Missing required path parameter: locationId");
  }
  path = path.replace("{ locationId }".replace(/ /g, ""), encodeURIComponent(String(args["locationId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /products/types/{typeId}/locations/{locationId}/latest failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function zone_list(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/zones";

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["id"] !== undefined) {
    if (Array.isArray(args["id"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["id"].length > 0) {
        for (const item of args["id"]) {
          url.searchParams.append("id[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("id", String(args["id"]));
    }
  }
  if (args["area"] !== undefined) {
    if (Array.isArray(args["area"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["area"].length > 0) {
        for (const item of args["area"]) {
          url.searchParams.append("area[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("area", String(args["area"]));
    }
  }
  if (args["region"] !== undefined) {
    if (Array.isArray(args["region"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["region"].length > 0) {
        for (const item of args["region"]) {
          url.searchParams.append("region[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("region", String(args["region"]));
    }
  }
  if (args["type"] !== undefined) {
    if (Array.isArray(args["type"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["type"].length > 0) {
        for (const item of args["type"]) {
          url.searchParams.append("type[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("type", String(args["type"]));
    }
  }
  if (args["point"] !== undefined) {
    if (Array.isArray(args["point"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["point"].length > 0) {
        for (const item of args["point"]) {
          url.searchParams.append("point[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("point", String(args["point"]));
    }
  }
  if (args["include_geometry"] !== undefined) {
    if (Array.isArray(args["include_geometry"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["include_geometry"].length > 0) {
        for (const item of args["include_geometry"]) {
          url.searchParams.append("include_geometry[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("include_geometry", String(args["include_geometry"]));
    }
  }
  if (args["limit"] !== undefined) {
    if (Array.isArray(args["limit"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["limit"].length > 0) {
        for (const item of args["limit"]) {
          url.searchParams.append("limit[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("limit", String(args["limit"]));
    }
  }
  if (args["effective"] !== undefined) {
    if (Array.isArray(args["effective"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["effective"].length > 0) {
        for (const item of args["effective"]) {
          url.searchParams.append("effective[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("effective", String(args["effective"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /zones failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function zone_list_type(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/zones/{type}";
  if (args["type"] === undefined) {
    throw new Error("Missing required path parameter: type");
  }
  path = path.replace("{ type }".replace(/ /g, ""), encodeURIComponent(String(args["type"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["id"] !== undefined) {
    if (Array.isArray(args["id"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["id"].length > 0) {
        for (const item of args["id"]) {
          url.searchParams.append("id[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("id", String(args["id"]));
    }
  }
  if (args["area"] !== undefined) {
    if (Array.isArray(args["area"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["area"].length > 0) {
        for (const item of args["area"]) {
          url.searchParams.append("area[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("area", String(args["area"]));
    }
  }
  if (args["region"] !== undefined) {
    if (Array.isArray(args["region"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["region"].length > 0) {
        for (const item of args["region"]) {
          url.searchParams.append("region[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("region", String(args["region"]));
    }
  }
  if (args["type"] !== undefined) {
    if (Array.isArray(args["type"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["type"].length > 0) {
        for (const item of args["type"]) {
          url.searchParams.append("type[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("type", String(args["type"]));
    }
  }
  if (args["point"] !== undefined) {
    if (Array.isArray(args["point"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["point"].length > 0) {
        for (const item of args["point"]) {
          url.searchParams.append("point[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("point", String(args["point"]));
    }
  }
  if (args["include_geometry"] !== undefined) {
    if (Array.isArray(args["include_geometry"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["include_geometry"].length > 0) {
        for (const item of args["include_geometry"]) {
          url.searchParams.append("include_geometry[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("include_geometry", String(args["include_geometry"]));
    }
  }
  if (args["limit"] !== undefined) {
    if (Array.isArray(args["limit"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["limit"].length > 0) {
        for (const item of args["limit"]) {
          url.searchParams.append("limit[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("limit", String(args["limit"]));
    }
  }
  if (args["effective"] !== undefined) {
    if (Array.isArray(args["effective"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["effective"].length > 0) {
        for (const item of args["effective"]) {
          url.searchParams.append("effective[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("effective", String(args["effective"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /zones/{type} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function zone(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/zones/{type}/{zoneId}";
  if (args["type"] === undefined) {
    throw new Error("Missing required path parameter: type");
  }
  path = path.replace("{ type }".replace(/ /g, ""), encodeURIComponent(String(args["type"])));
  if (args["zoneId"] === undefined) {
    throw new Error("Missing required path parameter: zoneId");
  }
  path = path.replace("{ zoneId }".replace(/ /g, ""), encodeURIComponent(String(args["zoneId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["effective"] !== undefined) {
    if (Array.isArray(args["effective"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["effective"].length > 0) {
        for (const item of args["effective"]) {
          url.searchParams.append("effective[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("effective", String(args["effective"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /zones/{type}/{zoneId} failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function zone_forecast(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/zones/{type}/{zoneId}/forecast";
  if (args["type"] === undefined) {
    throw new Error("Missing required path parameter: type");
  }
  path = path.replace("{ type }".replace(/ /g, ""), encodeURIComponent(String(args["type"])));
  if (args["zoneId"] === undefined) {
    throw new Error("Missing required path parameter: zoneId");
  }
  path = path.replace("{ zoneId }".replace(/ /g, ""), encodeURIComponent(String(args["zoneId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /zones/{type}/{zoneId}/forecast failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function zone_obs(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/zones/forecast/{zoneId}/observations";
  if (args["zoneId"] === undefined) {
    throw new Error("Missing required path parameter: zoneId");
  }
  path = path.replace("{ zoneId }".replace(/ /g, ""), encodeURIComponent(String(args["zoneId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params
  if (args["start"] !== undefined) {
    if (Array.isArray(args["start"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["start"].length > 0) {
        for (const item of args["start"]) {
          url.searchParams.append("start[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("start", String(args["start"]));
    }
  }
  if (args["end"] !== undefined) {
    if (Array.isArray(args["end"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["end"].length > 0) {
        for (const item of args["end"]) {
          url.searchParams.append("end[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("end", String(args["end"]));
    }
  }
  if (args["limit"] !== undefined) {
    if (Array.isArray(args["limit"])) {
      // Handle array parameters with [] notation (e.g., expand[]=value1&expand[]=value2)
      if (args["limit"].length > 0) {
        for (const item of args["limit"]) {
          url.searchParams.append("limit[]", String(item));
        }
      }
      // Empty arrays are skipped - don't add parameter
    } else {
      url.searchParams.set("limit", String(args["limit"]));
    }
  }

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /zones/forecast/{zoneId}/observations failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}



export async function zone_stations(args: any, env: Env): Promise<any> {
  const baseUrl = env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL env var is required");
  }

  // Build URL with path params
  let path = "/zones/forecast/{zoneId}/stations";
  if (args["zoneId"] === undefined) {
    throw new Error("Missing required path parameter: zoneId");
  }
  path = path.replace("{ zoneId }".replace(/ /g, ""), encodeURIComponent(String(args["zoneId"])));

  // Construct full URL: combine baseUrl with operation path
  // If baseUrl has a path, we need to handle it properly
  const baseUrlObj = new URL(baseUrl);
  const fullPath = baseUrlObj.pathname + (baseUrlObj.pathname.endsWith("/") ? "" : "/") + path.replace(/^\//, "");
  const url = new URL(fullPath, baseUrlObj.origin);

  // Add query params

  const init: any = {
    method: "get".toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": env.USER_AGENT || "weather-mcp/1.0.0",
    },
  };



  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP get /zones/forecast/{zoneId}/stations failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}




export const tools: Record<string, (args: any, env: Env) => Promise<any>> = {
  "alerts_query": alerts_query,
  "alerts_active": alerts_active,
  "alerts_active_count": alerts_active_count,
  "alerts_active_zone": alerts_active_zone,
  "alerts_active_area": alerts_active_area,
  "alerts_active_region": alerts_active_region,
  "alerts_types": alerts_types,
  "alerts_single": alerts_single,
  "cwsu": cwsu,
  "cwas": cwas,
  "cwa": cwa,
  "sigmetquery": sigmetquery,
  "sigmetsbyatsu": sigmetsbyatsu,
  "sigmetsbyatsubydate": sigmetsbyatsubydate,
  "sigmet": sigmet,
  "glossary": glossary,
  "gridpoint": gridpoint,
  "gridpoint_forecast": gridpoint_forecast,
  "gridpoint_forecast_hourly": gridpoint_forecast_hourly,
  "gridpoint_stations": gridpoint_stations,
  "icons": icons,
  "iconsdualcondition": iconsdualcondition,
  "icons_summary": icons_summary,
  "satellite_thumbnails": satellite_thumbnails,
  "station_observation_list": station_observation_list,
  "station_observation_latest": station_observation_latest,
  "station_observation_time": station_observation_time,
  "tafs": tafs,
  "taf": taf,
  "obs_stations": obs_stations,
  "obs_station": obs_station,
  "office": office,
  "office_headline": office_headline,
  "office_headlines": office_headlines,
  "point": point,
  "point_radio": point_radio,
  "point_stations": point_stations,
  "radar_servers": radar_servers,
  "radar_server": radar_server,
  "radar_stations": radar_stations,
  "radar_station": radar_station,
  "radar_station_alarms": radar_station_alarms,
  "radar_queue": radar_queue,
  "radar_profiler": radar_profiler,
  "products_query": products_query,
  "product_locations": product_locations,
  "product_types": product_types,
  "product": product,
  "products_type": products_type,
  "products_type_locations": products_type_locations,
  "location_products": location_products,
  "products_type_location": products_type_location,
  "latest_product_type_location": latest_product_type_location,
  "zone_list": zone_list,
  "zone_list_type": zone_list_type,
  "zone": zone,
  "zone_forecast": zone_forecast,
  "zone_obs": zone_obs,
  "zone_stations": zone_stations,
};

