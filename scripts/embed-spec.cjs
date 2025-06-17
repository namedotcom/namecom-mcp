#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

try {
  // Read the YAML file
  const yamlPath = path.join(__dirname, "../assets/namecom.api.yaml");
  const yamlContent = fs.readFileSync(yamlPath, "utf8");

  // Parse YAML to JavaScript object
  const spec = yaml.load(yamlContent);

  // Generate TypeScript file
  const tsContent = `// Auto-generated from assets/namecom.api.yaml - DO NOT EDIT DIRECTLY
// Update assets/namecom.api.yaml and run 'npm run build' to regenerate

export const EMBEDDED_SPEC = ${JSON.stringify(spec, null, 2)} as const;
`;

  // Write to src directory
  const outputPath = path.join(__dirname, "../src/embedded-spec.ts");
  fs.writeFileSync(outputPath, tsContent);
} catch (error) {
  process.stderr.write(`Failed to embed OpenAPI spec: ${error.message}\n`);
  process.exit(1);
}
