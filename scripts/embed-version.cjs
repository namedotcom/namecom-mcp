const fs = require("fs");
const path = require("path");

// Read version from package.json
const packageJson = require("../package.json");
const version = packageJson.version;

// Generate version.ts file
const versionFileContent = `// This file is auto-generated during build. Do not edit.
export const VERSION = '${version}';
`;

// Write to src directory
fs.writeFileSync(path.join(__dirname, "../src/version.ts"), versionFileContent);
