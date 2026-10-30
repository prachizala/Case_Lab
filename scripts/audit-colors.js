const fs = require("fs");
const path = require("path");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const files = [];
walkDir(path.join(__dirname, "../src"), (filePath) => {
  if (/\.(tsx|ts|css|html)$/.test(filePath)) {
    files.push(filePath);
  }
});

let sameLineViolations = [];
let containerViolations = [];
let blueBgElements = [];

files.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  const relPath = path.relative(path.join(__dirname, ".."), file).replace(/\\/g, "/");
  const lines = content.split(/\r?\n/);

  lines.forEach((line, i) => {
    const lineNum = i + 1;
    const isNavy = /\bbg-primary\b(?!\-soft)/.test(line) || /\bbg-navy\b/.test(line);

    if (isNavy) {
      blueBgElements.push({ file: relPath, line: lineNum, content: line.trim() });

      // Check same-line forbidden colors
      if (/\btext-accent\b/.test(line) || /\btext-red-\d+\b/.test(line) || /\btext-primary-soft\b/.test(line)) {
        sameLineViolations.push({ file: relPath, line: lineNum, content: line.trim() });
      }
    }
  });
});

console.log("=================================================");
console.log("   SHANTI BUSINESS SCHOOL (SBS) COLOR AUDIT");
console.log("=================================================");
console.log(`Total Solid Primary/Navy Elements: ${blueBgElements.length}`);
console.log(`Same-Line Contrast Violations:     ${sameLineViolations.length}`);

if (sameLineViolations.length > 0) {
  console.log("\nViolations found:");
  sameLineViolations.forEach((v) => {
    console.log(`  ${v.file}:${v.line} -> ${v.content}`);
  });
} else {
  console.log("\nPASS: ZERO same-line red-on-navy or low-contrast text violations found!");
}

console.log("\n=================================================");
