import fs from "fs";
import path from "path";

interface Violation {
  file: string;
  line: number;
  pattern: string;
  match: string;
}

const PATTERNS_TO_FLAG = [
  { name: "Live Groq API Key", regex: /gsk_[a-zA-Z0-9]{20,}/g },
  { name: "Live Supabase Service Key / JWT", regex: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]{50,}\.[a-zA-Z0-9_-]{30,}/g },
  { name: "Hardcoded Demo Password (password123)", regex: new RegExp(["pass", "word123"].join(""), "gi") },
  { name: "Verification Code Auto-Detect Banner", regex: new RegExp(["Verification code auto", "-detected"].join(""), "gi") },
];

function scanDirectory(dir: string, violations: Violation[], isStaticBundle = false) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git" || (!isStaticBundle && entry.name === ".next")) {
        continue;
      }
      scanDirectory(fullPath, violations, isStaticBundle || fullPath.includes(".next"));
    } else if (entry.isFile()) {
      // Skip environment files and test files from source scan
      const relPath = path.relative(process.cwd(), fullPath).replace(/\\/g, "/");
      if (relPath.startsWith(".env") && !relPath.endsWith(".example")) continue;
      if (relPath.includes("scripts/test-password-security.ts")) continue; // test file testing string absence
      if (relPath.includes("scripts/secret-scan.ts")) continue; // scanner script itself

      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        for (const pattern of PATTERNS_TO_FLAG) {
          // If searching for debug_otp, only flag inside .next/static or client components
          if (pattern.name.includes("debug_otp") && !isStaticBundle) {
            continue;
          }

          pattern.regex.lastIndex = 0;
          let match;
          while ((match = pattern.regex.exec(line)) !== null) {
            violations.push({
              file: relPath,
              line: i + 1,
              pattern: pattern.name,
              match: match[0].slice(0, 30) + "...",
            });
          }
        }
      }
    }
  }
}

async function runSecretScan() {
  console.log("================================================================");
  console.log("SECRET & CREDENTIAL LEAK SCAN (STEP 5)");
  console.log("================================================================");

  const violations: Violation[] = [];

  console.log("Scanning source directory: src/ ...");
  scanDirectory(path.join(process.cwd(), "src"), violations);

  console.log("Scanning static production bundle: .next/static/ ...");
  scanDirectory(path.join(process.cwd(), ".next", "static"), violations, true);

  console.log("Scanning public directory: public/ ...");
  scanDirectory(path.join(process.cwd(), "public"), violations);

  console.log("Scanning scripts directory: scripts/ ...");
  scanDirectory(path.join(process.cwd(), "scripts"), violations);

  console.log("\nScan complete.");
  console.log(`Total security violations detected: ${violations.length}`);

  if (violations.length > 0) {
    console.error("\n❌ VIOLATIONS FOUND:");
    for (const v of violations) {
      console.error(`  • [${v.pattern}] in ${v.file}:${v.line} -> ${v.match}`);
    }
    process.exit(1);
  } else {
    console.log("✅ PASS: Clean! No live API keys, service role keys, leaked OTPs, or demo passwords found in repo or .next/static.");
  }
  console.log("================================================================");
}

runSecretScan().catch((err) => {
  console.error(err);
  process.exit(1);
});
