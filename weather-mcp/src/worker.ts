import { tools, Env } from "./tools";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: any;
}

// CORS headers helper
function getCorsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(),
      });
    }

    // MCP POST /mcp → Request/response JSON-RPC
    if (request.method === "POST" && url.pathname.endsWith("/mcp")) {
      const body = await request.json() as JsonRpcRequest;
      const response = await handleMcpRequest(body, env);
      return new Response(JSON.stringify(response), {
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(),
        }
      });
    }

    // MCP GET /mcp → Server info (like voice-mcp pattern)
    if (request.method === "GET" && url.pathname.endsWith("/mcp")) {
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        result: {
          name: "weather-mcp",
          version: "1.0.0",
          description: "MCP server generated from OpenAPI specification",
          protocol: "json-rpc",
          endpoints: {
            mcp: "/mcp"
          }
        },
        id: null
      }), {
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(),
        }
      });
    }

    return new Response("MCP server running", {
      status: 200,
      headers: getCorsHeaders(),
    });
  }
};

// Tool metadata with schemas and descriptions
const toolMetadata: Record<string, { name: string; description: string; inputSchema: any }> = {
  "alerts_query": {
    name: "alerts_query",
    description: "Returns all alerts (calls GET /alerts)",
    inputSchema: {
  "type": "object",
  "properties": {
    "active": {
      "type": "boolean",
      "description": "List only active alerts (use /alerts/active endpoints instead)"
    }
  },
  "required": [],
  "additionalProperties": false
}
  },
  "alerts_active": {
    name: "alerts_active",
    description: "Returns all currently active alerts (calls GET /alerts/active)",
    inputSchema: {
  "type": "object",
  "properties": {},
  "required": [],
  "additionalProperties": false
}
  },
  "alerts_active_count": {
    name: "alerts_active_count",
    description: "Returns info on the number of active alerts (calls GET /alerts/active/count)",
    inputSchema: {
  "type": "object",
  "properties": {},
  "required": [],
  "additionalProperties": false
}
  },
  "alerts_active_zone": {
    name: "alerts_active_zone",
    description: "Returns active alerts for the given NWS public zone or county (calls GET /alerts/active/zone/{zoneId})",
    inputSchema: {
  "type": "object",
  "properties": {
    "zoneId": {
      "type": "string",
      "description": "Path parameter \"zoneId\""
    }
  },
  "required": [
    "zoneId"
  ],
  "additionalProperties": false
}
  },
  "alerts_active_area": {
    name: "alerts_active_area",
    description: "Returns active alerts for the given area (state or marine area) (calls GET /alerts/active/area/{area})",
    inputSchema: {
  "type": "object",
  "properties": {
    "area": {
      "type": "string",
      "description": "State/area ID"
    }
  },
  "required": [
    "area"
  ],
  "additionalProperties": false
}
  },
  "alerts_active_region": {
    name: "alerts_active_region",
    description: "Returns active alerts for the given marine region (calls GET /alerts/active/region/{region})",
    inputSchema: {
  "type": "object",
  "properties": {
    "region": {
      "type": "string",
      "description": "Marine region ID"
    }
  },
  "required": [
    "region"
  ],
  "additionalProperties": false
}
  },
  "alerts_types": {
    name: "alerts_types",
    description: "Returns a list of alert types (calls GET /alerts/types)",
    inputSchema: {
  "type": "object",
  "properties": {},
  "required": [],
  "additionalProperties": false
}
  },
  "alerts_single": {
    name: "alerts_single",
    description: "Returns a specific alert (calls GET /alerts/{id})",
    inputSchema: {
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Alert identifier"
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false
}
  },
  "cwsu": {
    name: "cwsu",
    description: "Returns metadata about a Center Weather Service Unit (calls GET /aviation/cwsus/{cwsuId})",
    inputSchema: {
  "type": "object",
  "properties": {
    "cwsuId": {
      "type": "string",
      "description": "Path parameter \"cwsuId\""
    }
  },
  "required": [
    "cwsuId"
  ],
  "additionalProperties": false
}
  },
  "cwas": {
    name: "cwas",
    description: "Returns a list of Center Weather Advisories from a CWSU (calls GET /aviation/cwsus/{cwsuId}/cwas)",
    inputSchema: {
  "type": "object",
  "properties": {
    "cwsuId": {
      "type": "string",
      "description": "Path parameter \"cwsuId\""
    }
  },
  "required": [
    "cwsuId"
  ],
  "additionalProperties": false
}
  },
  "cwa": {
    name: "cwa",
    description: "Returns a list of Center Weather Advisories from a CWSU (calls GET /aviation/cwsus/{cwsuId}/cwas/{date}/{sequence})",
    inputSchema: {
  "type": "object",
  "properties": {
    "sequence": {
      "type": "integer",
      "description": "Sequence number"
    },
    "cwsuId": {
      "type": "string",
      "description": "Path parameter \"cwsuId\""
    },
    "date": {
      "type": "string",
      "description": "Date (YYYY-MM-DD format)"
    }
  },
  "required": [
    "sequence",
    "cwsuId",
    "date"
  ],
  "additionalProperties": false
}
  },
  "sigmetquery": {
    name: "sigmetquery",
    description: "Returns a list of SIGMET/AIRMETs (calls GET /aviation/sigmets)",
    inputSchema: {
  "type": "object",
  "properties": {
    "atsu": {
      "type": "string",
      "description": "ATSU identifier"
    },
    "sequence": {
      "type": "string",
      "description": "SIGMET sequence number"
    }
  },
  "required": [],
  "additionalProperties": false
}
  },
  "sigmetsbyatsu": {
    name: "sigmetsbyatsu",
    description: "Returns a list of SIGMET/AIRMETs for the specified ATSU (calls GET /aviation/sigmets/{atsu})",
    inputSchema: {
  "type": "object",
  "properties": {
    "atsu": {
      "type": "string",
      "description": "Path parameter \"atsu\""
    }
  },
  "required": [
    "atsu"
  ],
  "additionalProperties": false
}
  },
  "sigmetsbyatsubydate": {
    name: "sigmetsbyatsubydate",
    description: "Returns a list of SIGMET/AIRMETs for the specified ATSU for the specified date (calls GET /aviation/sigmets/{atsu}/{date})",
    inputSchema: {
  "type": "object",
  "properties": {
    "atsu": {
      "type": "string",
      "description": "Path parameter \"atsu\""
    },
    "date": {
      "type": "string",
      "description": "Date (YYYY-MM-DD format)"
    }
  },
  "required": [
    "atsu",
    "date"
  ],
  "additionalProperties": false
}
  },
  "sigmet": {
    name: "sigmet",
    description: "Returns a specific SIGMET/AIRMET (calls GET /aviation/sigmets/{atsu}/{date}/{time})",
    inputSchema: {
  "type": "object",
  "properties": {
    "atsu": {
      "type": "string",
      "description": "Path parameter \"atsu\""
    },
    "date": {
      "type": "string",
      "description": "Date (YYYY-MM-DD format)"
    },
    "time": {
      "type": "string",
      "description": "Time (HHMM format). This time is always specified in UTC (Zulu) time."
    }
  },
  "required": [
    "atsu",
    "date",
    "time"
  ],
  "additionalProperties": false
}
  },
  "glossary": {
    name: "glossary",
    description: "Returns glossary terms (calls GET /glossary)",
    inputSchema: {
  "type": "object",
  "properties": {},
  "required": [],
  "additionalProperties": false
}
  },
  "gridpoint": {
    name: "gridpoint",
    description: "Returns raw numerical forecast data for a 2.5km grid area (calls GET /gridpoints/{wfo}/{x},{y})",
    inputSchema: {
  "type": "object",
  "properties": {
    "wfo": {
      "type": "string",
      "description": "Path parameter \"wfo\""
    },
    "x": {
      "type": "number",
      "description": "Path parameter \"x\""
    },
    "y": {
      "type": "number",
      "description": "Path parameter \"y\""
    }
  },
  "required": [
    "wfo",
    "x",
    "y"
  ],
  "additionalProperties": false
}
  },
  "gridpoint_forecast": {
    name: "gridpoint_forecast",
    description: "Returns a textual forecast for a 2.5km grid area (calls GET /gridpoints/{wfo}/{x},{y}/forecast)",
    inputSchema: {
  "type": "object",
  "properties": {
    "wfo": {
      "type": "string",
      "description": "Path parameter \"wfo\""
    },
    "x": {
      "type": "number",
      "description": "Path parameter \"x\""
    },
    "y": {
      "type": "number",
      "description": "Path parameter \"y\""
    }
  },
  "required": [
    "wfo",
    "x",
    "y"
  ],
  "additionalProperties": false
}
  },
  "gridpoint_forecast_hourly": {
    name: "gridpoint_forecast_hourly",
    description: "Returns a textual hourly forecast for a 2.5km grid area (calls GET /gridpoints/{wfo}/{x},{y}/forecast/hourly)",
    inputSchema: {
  "type": "object",
  "properties": {
    "wfo": {
      "type": "string",
      "description": "Path parameter \"wfo\""
    },
    "x": {
      "type": "number",
      "description": "Path parameter \"x\""
    },
    "y": {
      "type": "number",
      "description": "Path parameter \"y\""
    }
  },
  "required": [
    "wfo",
    "x",
    "y"
  ],
  "additionalProperties": false
}
  },
  "gridpoint_stations": {
    name: "gridpoint_stations",
    description: "Returns a list of observation stations usable for a given 2.5km grid area (calls GET /gridpoints/{wfo}/{x},{y}/stations)",
    inputSchema: {
  "type": "object",
  "properties": {
    "wfo": {
      "type": "string",
      "description": "Path parameter \"wfo\""
    },
    "x": {
      "type": "number",
      "description": "Path parameter \"x\""
    },
    "y": {
      "type": "number",
      "description": "Path parameter \"y\""
    }
  },
  "required": [
    "wfo",
    "x",
    "y"
  ],
  "additionalProperties": false
}
  },
  "icons": {
    name: "icons",
    description: "Returns a forecast icon. Icon services in API are deprecated. (calls GET /icons/{set}/{timeOfDay}/{first})",
    inputSchema: {
  "type": "object",
  "properties": {
    "set": {
      "type": "string",
      "description": "."
    },
    "timeOfDay": {
      "type": "string",
      "description": "."
    },
    "first": {
      "type": "string",
      "description": "."
    },
    "size": {
      "type": "string",
      "description": "Font size"
    },
    "fontsize": {
      "type": "integer",
      "description": "Font size"
    }
  },
  "required": [
    "set",
    "timeOfDay",
    "first"
  ],
  "additionalProperties": false
}
  },
  "iconsdualcondition": {
    name: "iconsdualcondition",
    description: "Returns a forecast icon. Icon services in API are deprecated. (calls GET /icons/{set}/{timeOfDay}/{first}/{second})",
    inputSchema: {
  "type": "object",
  "properties": {
    "set": {
      "type": "string",
      "description": "."
    },
    "timeOfDay": {
      "type": "string",
      "description": "."
    },
    "first": {
      "type": "string",
      "description": "."
    },
    "second": {
      "type": "string",
      "description": "."
    },
    "size": {
      "type": "string",
      "description": "Font size"
    },
    "fontsize": {
      "type": "integer",
      "description": "Font size"
    }
  },
  "required": [
    "set",
    "timeOfDay",
    "first",
    "second"
  ],
  "additionalProperties": false
}
  },
  "icons_summary": {
    name: "icons_summary",
    description: "Returns a list of icon codes and textual descriptions. Icon services in API are deprecated. (calls GET /icons)",
    inputSchema: {
  "type": "object",
  "properties": {},
  "required": [],
  "additionalProperties": false
}
  },
  "satellite_thumbnails": {
    name: "satellite_thumbnails",
    description: "Returns a thumbnail image for a satellite region. Image services in API are deprecated. (calls GET /thumbnails/satellite/{area})",
    inputSchema: {
  "type": "object",
  "properties": {
    "area": {
      "type": "string",
      "description": "."
    }
  },
  "required": [
    "area"
  ],
  "additionalProperties": false
}
  },
  "station_observation_list": {
    name: "station_observation_list",
    description: "Returns a list of observations for a given station (calls GET /stations/{stationId}/observations)",
    inputSchema: {
  "type": "object",
  "properties": {
    "stationId": {
      "type": "string",
      "description": "Path parameter \"stationId\""
    },
    "limit": {
      "type": "integer",
      "description": "Limit"
    }
  },
  "required": [
    "stationId"
  ],
  "additionalProperties": false
}
  },
  "station_observation_latest": {
    name: "station_observation_latest",
    description: "Returns the latest observation for a station (calls GET /stations/{stationId}/observations/latest)",
    inputSchema: {
  "type": "object",
  "properties": {
    "stationId": {
      "type": "string",
      "description": "Path parameter \"stationId\""
    },
    "require_qc": {
      "type": "boolean",
      "description": "Require QC"
    }
  },
  "required": [
    "stationId"
  ],
  "additionalProperties": false
}
  },
  "station_observation_time": {
    name: "station_observation_time",
    description: "Returns a single observation. (calls GET /stations/{stationId}/observations/{time})",
    inputSchema: {
  "type": "object",
  "properties": {
    "time": {
      "type": "string",
      "description": "Timestamp of requested observation"
    },
    "stationId": {
      "type": "string",
      "description": "Path parameter \"stationId\""
    }
  },
  "required": [
    "time",
    "stationId"
  ],
  "additionalProperties": false
}
  },
  "tafs": {
    name: "tafs",
    description: "Returns Terminal Aerodrome Forecasts for the specified airport station. (calls GET /stations/{stationId}/tafs)",
    inputSchema: {
  "type": "object",
  "properties": {
    "stationId": {
      "type": "string",
      "description": "Path parameter \"stationId\""
    }
  },
  "required": [
    "stationId"
  ],
  "additionalProperties": false
}
  },
  "taf": {
    name: "taf",
    description: "Returns a single Terminal Aerodrome Forecast. (calls GET /stations/{stationId}/tafs/{date}/{time})",
    inputSchema: {
  "type": "object",
  "properties": {
    "stationId": {
      "type": "string",
      "description": "Path parameter \"stationId\""
    },
    "date": {
      "type": "string",
      "description": "Date (YYYY-MM-DD format)"
    },
    "time": {
      "type": "string",
      "description": "Time (HHMM format). This time is always specified in UTC (Zulu) time."
    }
  },
  "required": [
    "stationId",
    "date",
    "time"
  ],
  "additionalProperties": false
}
  },
  "obs_stations": {
    name: "obs_stations",
    description: "Returns a list of observation stations. (calls GET /stations)",
    inputSchema: {
  "type": "object",
  "properties": {
    "id": {
      "type": "array",
      "description": "Filter by observation station ID"
    },
    "state": {
      "type": "array",
      "description": "Filter by state/marine area code"
    }
  },
  "required": [],
  "additionalProperties": false
}
  },
  "obs_station": {
    name: "obs_station",
    description: "Returns metadata about a given observation station (calls GET /stations/{stationId})",
    inputSchema: {
  "type": "object",
  "properties": {
    "stationId": {
      "type": "string",
      "description": "Path parameter \"stationId\""
    }
  },
  "required": [
    "stationId"
  ],
  "additionalProperties": false
}
  },
  "office": {
    name: "office",
    description: "Returns metadata about a NWS forecast office (calls GET /offices/{officeId})",
    inputSchema: {
  "type": "object",
  "properties": {
    "officeId": {
      "type": "string",
      "description": "Path parameter \"officeId\""
    }
  },
  "required": [
    "officeId"
  ],
  "additionalProperties": false
}
  },
  "office_headline": {
    name: "office_headline",
    description: "Returns a specific news headline for a given NWS office (calls GET /offices/{officeId}/headlines/{headlineId})",
    inputSchema: {
  "type": "object",
  "properties": {
    "headlineId": {
      "type": "string",
      "description": "Headline record ID"
    },
    "officeId": {
      "type": "string",
      "description": "Path parameter \"officeId\""
    }
  },
  "required": [
    "headlineId",
    "officeId"
  ],
  "additionalProperties": false
}
  },
  "office_headlines": {
    name: "office_headlines",
    description: "Returns a list of news headlines for a given NWS office (calls GET /offices/{officeId}/headlines)",
    inputSchema: {
  "type": "object",
  "properties": {
    "officeId": {
      "type": "string",
      "description": "Path parameter \"officeId\""
    }
  },
  "required": [
    "officeId"
  ],
  "additionalProperties": false
}
  },
  "point": {
    name: "point",
    description: "Returns metadata about a given latitude/longitude point (calls GET /points/{latitude},{longitude})",
    inputSchema: {
  "type": "object",
  "properties": {
    "latitude": {
      "type": "number",
      "description": "Latitude"
    },
    "longitude": {
      "type": "number",
      "description": "Longitude"
    }
  },
  "required": [
    "latitude",
    "longitude"
  ],
  "additionalProperties": false
}
  },
  "point_radio": {
    name: "point_radio",
    description: "Returns NOAA Weather Radio script for a latitude/longitude point (calls GET /points/{latitude},{longitude}/radio)",
    inputSchema: {
  "type": "object",
  "properties": {
    "latitude": {
      "type": "number",
      "description": "Latitude"
    },
    "longitude": {
      "type": "number",
      "description": "Longitude"
    }
  },
  "required": [
    "latitude",
    "longitude"
  ],
  "additionalProperties": false
}
  },
  "point_stations": {
    name: "point_stations",
    description: "Returns a list of observation stations for a given point (calls GET /points/{latitude},{longitude}/stations)",
    inputSchema: {
  "type": "object",
  "properties": {
    "latitude": {
      "type": "number",
      "description": "Latitude"
    },
    "longitude": {
      "type": "number",
      "description": "Longitude"
    }
  },
  "required": [
    "latitude",
    "longitude"
  ],
  "additionalProperties": false
}
  },
  "radar_servers": {
    name: "radar_servers",
    description: "Returns a list of radar servers (calls GET /radar/servers)",
    inputSchema: {
  "type": "object",
  "properties": {
    "reportingHost": {
      "type": "string",
      "description": "Show records from specific reporting host"
    }
  },
  "required": [],
  "additionalProperties": false
}
  },
  "radar_server": {
    name: "radar_server",
    description: "Returns metadata about a given radar server (calls GET /radar/servers/{id})",
    inputSchema: {
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Server ID"
    },
    "reportingHost": {
      "type": "string",
      "description": "Show records from specific reporting host"
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false
}
  },
  "radar_stations": {
    name: "radar_stations",
    description: "Returns a list of radar stations (calls GET /radar/stations)",
    inputSchema: {
  "type": "object",
  "properties": {
    "stationType": {
      "type": "array",
      "description": "Limit results to a specific station type or types"
    },
    "reportingHost": {
      "type": "string",
      "description": "Show RDA and latency info from specific reporting host"
    },
    "host": {
      "type": "string",
      "description": "Show latency info from specific LDM host"
    }
  },
  "required": [],
  "additionalProperties": false
}
  },
  "radar_station": {
    name: "radar_station",
    description: "Returns metadata about a given radar station (calls GET /radar/stations/{stationId})",
    inputSchema: {
  "type": "object",
  "properties": {
    "stationId": {
      "type": "string",
      "description": "Radar station ID"
    },
    "reportingHost": {
      "type": "string",
      "description": "Show RDA and latency info from specific reporting host"
    },
    "host": {
      "type": "string",
      "description": "Show latency info from specific LDM host"
    }
  },
  "required": [
    "stationId"
  ],
  "additionalProperties": false
}
  },
  "radar_station_alarms": {
    name: "radar_station_alarms",
    description: "Returns metadata about a given radar station alarms (calls GET /radar/stations/{stationId}/alarms)",
    inputSchema: {
  "type": "object",
  "properties": {
    "stationId": {
      "type": "string",
      "description": "Radar station ID"
    }
  },
  "required": [
    "stationId"
  ],
  "additionalProperties": false
}
  },
  "radar_queue": {
    name: "radar_queue",
    description: "Returns metadata about a given radar queue (calls GET /radar/queues/{host})",
    inputSchema: {
  "type": "object",
  "properties": {
    "host": {
      "type": "string",
      "description": "LDM host"
    },
    "limit": {
      "type": "integer",
      "description": "Record limit"
    },
    "arrived": {
      "type": "string",
      "description": "Range for arrival time"
    },
    "created": {
      "type": "string",
      "description": "Range for creation time"
    },
    "published": {
      "type": "string",
      "description": "Range for publish time"
    },
    "station": {
      "type": "string",
      "description": "Station identifier"
    },
    "type": {
      "type": "string",
      "description": "Record type"
    },
    "feed": {
      "type": "string",
      "description": "Originating product feed"
    },
    "resolution": {
      "type": "integer",
      "description": "Resolution version"
    }
  },
  "required": [
    "host"
  ],
  "additionalProperties": false
}
  },
  "radar_profiler": {
    name: "radar_profiler",
    description: "Returns metadata about a given radar wind profiler (calls GET /radar/profilers/{stationId})",
    inputSchema: {
  "type": "object",
  "properties": {
    "stationId": {
      "type": "string",
      "description": "Profiler station ID"
    },
    "time": {
      "type": "string",
      "description": "Time interval"
    },
    "interval": {
      "type": "string",
      "description": "Averaging interval"
    }
  },
  "required": [
    "stationId"
  ],
  "additionalProperties": false
}
  },
  "products_query": {
    name: "products_query",
    description: "Returns a list of text products (calls GET /products)",
    inputSchema: {
  "type": "object",
  "properties": {
    "location": {
      "type": "array",
      "description": "Location id"
    },
    "start": {
      "type": "string",
      "description": "Start time"
    },
    "end": {
      "type": "string",
      "description": "End time"
    },
    "office": {
      "type": "array",
      "description": "Issuing office"
    },
    "wmoid": {
      "type": "array",
      "description": "WMO id code"
    },
    "type": {
      "type": "array",
      "description": "Product code"
    },
    "limit": {
      "type": "integer",
      "description": "Limit"
    }
  },
  "required": [],
  "additionalProperties": false
}
  },
  "product_locations": {
    name: "product_locations",
    description: "Returns a list of valid text product issuance locations (calls GET /products/locations)",
    inputSchema: {
  "type": "object",
  "properties": {},
  "required": [],
  "additionalProperties": false
}
  },
  "product_types": {
    name: "product_types",
    description: "Returns a list of valid text product types and codes (calls GET /products/types)",
    inputSchema: {
  "type": "object",
  "properties": {},
  "required": [],
  "additionalProperties": false
}
  },
  "product": {
    name: "product",
    description: "Returns a specific text product (calls GET /products/{productId})",
    inputSchema: {
  "type": "object",
  "properties": {
    "productId": {
      "type": "string",
      "description": "."
    }
  },
  "required": [
    "productId"
  ],
  "additionalProperties": false
}
  },
  "products_type": {
    name: "products_type",
    description: "Returns a list of text products of a given type (calls GET /products/types/{typeId})",
    inputSchema: {
  "type": "object",
  "properties": {
    "typeId": {
      "type": "string",
      "description": "."
    }
  },
  "required": [
    "typeId"
  ],
  "additionalProperties": false
}
  },
  "products_type_locations": {
    name: "products_type_locations",
    description: "Returns a list of valid text product issuance locations for a given product type (calls GET /products/types/{typeId}/locations)",
    inputSchema: {
  "type": "object",
  "properties": {
    "typeId": {
      "type": "string",
      "description": "."
    }
  },
  "required": [
    "typeId"
  ],
  "additionalProperties": false
}
  },
  "location_products": {
    name: "location_products",
    description: "Returns a list of valid text product types for a given issuance location (calls GET /products/locations/{locationId}/types)",
    inputSchema: {
  "type": "object",
  "properties": {
    "locationId": {
      "type": "string",
      "description": "."
    }
  },
  "required": [
    "locationId"
  ],
  "additionalProperties": false
}
  },
  "products_type_location": {
    name: "products_type_location",
    description: "Returns a list of text products of a given type for a given issuance location (calls GET /products/types/{typeId}/locations/{locationId})",
    inputSchema: {
  "type": "object",
  "properties": {
    "typeId": {
      "type": "string",
      "description": "."
    },
    "locationId": {
      "type": "string",
      "description": "."
    }
  },
  "required": [
    "typeId",
    "locationId"
  ],
  "additionalProperties": false
}
  },
  "latest_product_type_location": {
    name: "latest_product_type_location",
    description: "Returns latest text products of a given type for a given issuance location with product text (calls GET /products/types/{typeId}/locations/{locationId}/latest)",
    inputSchema: {
  "type": "object",
  "properties": {
    "typeId": {
      "type": "string",
      "description": "."
    },
    "locationId": {
      "type": "string",
      "description": "."
    }
  },
  "required": [
    "typeId",
    "locationId"
  ],
  "additionalProperties": false
}
  },
  "zone_list": {
    name: "zone_list",
    description: "Returns a list of zones (calls GET /zones)",
    inputSchema: {
  "type": "object",
  "properties": {
    "id": {
      "type": "array",
      "description": "Zone ID (forecast or county)"
    },
    "area": {
      "type": "array",
      "description": "State/marine area code"
    },
    "region": {
      "type": "array",
      "description": "Region code"
    },
    "type": {
      "type": "array",
      "description": "Zone type"
    },
    "point": {
      "type": "string",
      "description": "Point (latitude,longitude)"
    },
    "include_geometry": {
      "type": "boolean",
      "description": "Include geometry in results (true/false)"
    },
    "limit": {
      "type": "integer",
      "description": "Limit"
    },
    "effective": {
      "type": "string",
      "description": "Effective date/time"
    }
  },
  "required": [],
  "additionalProperties": false
}
  },
  "zone_list_type": {
    name: "zone_list_type",
    description: "Returns a list of zones of a given type (calls GET /zones/{type})",
    inputSchema: {
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "description": "Zone type"
    },
    "id": {
      "type": "array",
      "description": "Zone ID (forecast or county)"
    },
    "area": {
      "type": "array",
      "description": "State/marine area code"
    },
    "region": {
      "type": "array",
      "description": "Region code"
    },
    "query_type": {
      "type": "array",
      "description": "Zone type"
    },
    "point": {
      "type": "string",
      "description": "Point (latitude,longitude)"
    },
    "include_geometry": {
      "type": "boolean",
      "description": "Include geometry in results (true/false)"
    },
    "limit": {
      "type": "integer",
      "description": "Limit"
    },
    "effective": {
      "type": "string",
      "description": "Effective date/time"
    }
  },
  "required": [
    "type"
  ],
  "additionalProperties": false
}
  },
  "zone": {
    name: "zone",
    description: "Returns metadata about a given zone (calls GET /zones/{type}/{zoneId})",
    inputSchema: {
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "description": "Zone type"
    },
    "zoneId": {
      "type": "string",
      "description": "Path parameter \"zoneId\""
    },
    "effective": {
      "type": "string",
      "description": "Effective date/time"
    }
  },
  "required": [
    "type",
    "zoneId"
  ],
  "additionalProperties": false
}
  },
  "zone_forecast": {
    name: "zone_forecast",
    description: "Returns the current zone forecast for a given zone (calls GET /zones/{type}/{zoneId}/forecast)",
    inputSchema: {
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "description": "Zone type"
    },
    "zoneId": {
      "type": "string",
      "description": "Path parameter \"zoneId\""
    }
  },
  "required": [
    "type",
    "zoneId"
  ],
  "additionalProperties": false
}
  },
  "zone_obs": {
    name: "zone_obs",
    description: "Returns a list of observations for a given zone (calls GET /zones/forecast/{zoneId}/observations)",
    inputSchema: {
  "type": "object",
  "properties": {
    "zoneId": {
      "type": "string",
      "description": "Path parameter \"zoneId\""
    },
    "start": {
      "type": "string",
      "description": "Start date/time"
    },
    "end": {
      "type": "string",
      "description": "End date/time"
    },
    "limit": {
      "type": "integer",
      "description": "Limit"
    }
  },
  "required": [
    "zoneId"
  ],
  "additionalProperties": false
}
  },
  "zone_stations": {
    name: "zone_stations",
    description: "Returns a list of observation stations for a given zone (calls GET /zones/forecast/{zoneId}/stations)",
    inputSchema: {
  "type": "object",
  "properties": {
    "zoneId": {
      "type": "string",
      "description": "Path parameter \"zoneId\""
    }
  },
  "required": [
    "zoneId"
  ],
  "additionalProperties": false
}
  },
};

// Basic tool router
async function handleMcpRequest(message: JsonRpcRequest, env: Env): Promise<any> {
  const method = message.method;
  const params = message.params || {};

  // Handle initialize
  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id: message.id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: "weather-mcp",
          version: "1.0.0"
        }
      }
    };
  }

  // Handle tools/list
  if (method === "tools/list") {
    const toolList = Object.keys(toolMetadata).map(name => {
      const meta = toolMetadata[name];
      return {
        name: meta.name,
        description: meta.description,
        inputSchema: meta.inputSchema
      };
    });
    return {
      jsonrpc: "2.0",
      id: message.id,
      result: {
        tools: toolList
      }
    };
  }

  // Handle tools/execute and tools/call (both are aliases for tool execution)
  if (method === "tools/execute" || method === "tools/call") {
    const toolName = params.name;
    const args = params.arguments || {};

    if (!toolName || typeof toolName !== "string" || !(toolName in tools)) {
      return {
        jsonrpc: "2.0",
        id: message.id,
        error: {
          code: -32601,
          message: `Unknown tool: ${toolName}`
        }
      };
    }

    try {
      const tool = tools[toolName as keyof typeof tools];
      const toolResult = await tool(args, env);
      return {
        jsonrpc: "2.0",
        id: message.id,
        result: {
          content: [
            {
              type: "application/json",
              text: JSON.stringify(toolResult)
            }
          ],
          isError: false
        }
      };
    } catch (err: any) {
      return {
        jsonrpc: "2.0",
        id: message.id,
        error: {
          code: -32000,
          message: err?.message || "Tool execution error",
          data: err?.stack
        }
      };
    }
  }

  return {
    jsonrpc: "2.0",
    id: message.id,
    error: { code: -32601, message: "Method not supported" }
  };
}

