import * as fs from "fs";
import * as path from "path";
// @ts-ignore - js-yaml doesn't have type definitions
import * as yaml from "js-yaml";
import { TransformConfig } from "./types";

/**
 * Load transform configuration from a JSON or YAML file.
 * 
 * @param configPath - Path to the config file (must be .json, .yaml, or .yml)
 * @returns The parsed TransformConfig
 * @throws Error if file doesn't exist or parsing fails
 */
export function loadTransformConfig(configPath: string): TransformConfig {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Transform config file not found: ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, "utf8");
  const ext = path.extname(configPath).toLowerCase();

  try {
    if (ext === ".yaml" || ext === ".yml") {
      const parsed = yaml.load(raw);
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("YAML file must contain an object");
      }
      return parsed as TransformConfig;
    } else if (ext === ".json") {
      return JSON.parse(raw) as TransformConfig;
    } else {
      throw new Error(
        `Unsupported config file format: ${ext}. Use .json, .yaml, or .yml`
      );
    }
  } catch (err: any) {
    if (err instanceof SyntaxError || err.message.includes("parse")) {
      throw new Error(`Failed to parse config file ${configPath}: ${err.message}`);
    }
    throw err;
  }
}

