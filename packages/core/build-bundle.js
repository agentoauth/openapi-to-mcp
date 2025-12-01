#!/usr/bin/env node

/**
 * Build script to bundle generator code and templates into openmcp-core
 * This makes the package self-contained for npm publishing
 */

const fs = require("fs");
const path = require("path");

const coreDir = __dirname;
const distDir = path.join(coreDir, "dist");
const bundledDir = path.join(distDir, "bundled");
// Try to copy from compiled dist first, fall back to source
const generatorDistDir = path.join(coreDir, "..", "..", "dist", "generator", "src");
const generatorSrcDir = path.join(coreDir, "..", "generator", "src");
const templatesDir = path.join(coreDir, "..", "templates");

// Create bundled directory
if (!fs.existsSync(bundledDir)) {
  fs.mkdirSync(bundledDir, { recursive: true });
}

// Copy generator compiled files (prefer dist, fall back to source)
const generatorFiles = [
  "index.js",
  "openapiLoader.js",
  "operationExtractor.js",
  "toolInferer.js",
  "transform.js",
  "config.js",
  "models.js",
  "schemaUtils.js",
  "types.js",
  "projectRenderer.js",
  "httpRenderer.js",
];

const bundledGeneratorDir = path.join(bundledDir, "generator");
if (!fs.existsSync(bundledGeneratorDir)) {
  fs.mkdirSync(bundledGeneratorDir, { recursive: true });
}

console.log("📦 Bundling generator code...");
// Determine source directory (prefer compiled dist)
const sourceGeneratorDir = fs.existsSync(generatorDistDir) ? generatorDistDir : generatorSrcDir;
console.log(`  Using source: ${path.relative(coreDir, sourceGeneratorDir)}`);

for (const file of generatorFiles) {
  // Try .js first (compiled), then .ts (source)
  let src = path.join(sourceGeneratorDir, file);
  if (!fs.existsSync(src)) {
    src = path.join(sourceGeneratorDir, file.replace(".js", ".ts"));
  }
  const dest = path.join(bundledGeneratorDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  ✓ ${file}`);
  } else {
    console.warn(`  ⚠ ${file} not found`);
  }
}

// Copy projectRenderer directory if it exists
const projectRendererSourceDir = path.join(sourceGeneratorDir, "projectRenderer");
const bundledProjectRendererDir = path.join(bundledGeneratorDir, "projectRenderer");
if (fs.existsSync(projectRendererSourceDir)) {
  if (!fs.existsSync(bundledProjectRendererDir)) {
    fs.mkdirSync(bundledProjectRendererDir, { recursive: true });
  }
  const files = fs.readdirSync(projectRendererSourceDir);
  for (const file of files) {
    const src = path.join(projectRendererSourceDir, file);
    const dest = path.join(bundledProjectRendererDir, file);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, dest);
      console.log(`  ✓ projectRenderer/${file}`);
    }
  }
}

// Copy templates
const bundledTemplatesDir = path.join(bundledDir, "templates");
if (!fs.existsSync(bundledTemplatesDir)) {
  fs.mkdirSync(bundledTemplatesDir, { recursive: true });
}

console.log("📦 Bundling templates...");
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✓ ${path.relative(bundledTemplatesDir, destPath)}`);
    }
  }
}

copyDir(templatesDir, bundledTemplatesDir);

// Patch projectRenderer to use bundled templates
const projectRendererFile = path.join(bundledGeneratorDir, "projectRenderer.js");
if (fs.existsSync(projectRendererFile)) {
  console.log("📝 Patching projectRenderer.js to use bundled templates...");
  let content = fs.readFileSync(projectRendererFile, "utf8");
  // Replace template path resolution to check bundled location first
  // Look for the template path resolution code and update it
  // This is a bit fragile but necessary for the bundled version
  // When bundled: __dirname is dist/bundled/generator, so templates are at ../templates (dist/bundled/templates)
  const oldPattern = /let templatesDir = path\.join\(__dirname, "\.\.", "templates"\);/g;
  const newCode = `// Check bundled templates first (for published package)
  // __dirname is dist/bundled/generator, so ../templates = dist/bundled/templates
  let templatesDir = path.join(__dirname, "..", "templates");`;
  
  // Try to replace the template resolution block
  if (oldPattern.test(content)) {
    content = content.replace(oldPattern, newCode);
    fs.writeFileSync(projectRendererFile, content, "utf8");
    console.log("  ✓ Patched projectRenderer.js");
  } else {
    // Try a more flexible replacement
    const flexiblePattern = /let templatesDir[^;]+;/g;
    if (flexiblePattern.test(content)) {
      content = content.replace(flexiblePattern, `let templatesDir = path.join(__dirname, "..", "..", "..", "bundled", "templates");`);
      fs.writeFileSync(projectRendererFile, content, "utf8");
      console.log("  ✓ Patched projectRenderer.js (flexible match)");
    } else {
      console.warn("  ⚠ Could not patch projectRenderer.js - template paths may need manual update");
    }
  }
}

console.log("✅ Bundling complete!");

