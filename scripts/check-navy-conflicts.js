const fs = require("fs");
const path = require("path");

function walkDir(dir, cb) {
  fs.readdirSync(dir).forEach((f) => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walkDir(p, cb);
    else cb(p);
  });
}

const files = [];
walkDir(path.join(__dirname, "../src"), (p) => {
  if (/\.(tsx|ts|css|html)$/.test(p)) files.push(p);
});

console.log("=== SAME LINE CONFLICTS ===");
let sameLineCount = 0;
files.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  const relPath = path.relative(path.join(__dirname, ".."), file).replace(/\\/g, "/");
  const lines = content.split(/\r?\n/);
  lines.forEach((line, i) => {
    const hasNavyBg = /\bbg-primary\b(?!\-soft)/.test(line) || /\bbg-navy\b/.test(line);
    const hasBadText = /\btext-(accent|primary-soft|red-\d+)\b/.test(line);
    if (hasNavyBg && hasBadText) {
      sameLineCount++;
      console.log(`${relPath}:${i + 1} -> ${line.trim()}`);
    }
  });
});
console.log(`Total same-line conflicts: ${sameLineCount}\n`);

console.log("=== CONTAINER CONFLICTS (Red/Accent text/icons inside solid navy containers) ===");
let containerConflictCount = 0;
files.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  const relPath = path.relative(path.join(__dirname, ".."), file).replace(/\\/g, "/");
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/\bbg-primary\b(?!\-soft)/.test(line) || /\bbg-navy\b/.test(line)) {
      // Look within next 20 lines
      for (let j = i + 1; j < Math.min(lines.length, i + 25); j++) {
        const subLine = lines[j];
        // If subLine closes main container (not foolproof but indentation/tag check)
        // If subLine has text-accent or text-red-* or stroke-accent or fill-accent
        if (/\b(text-accent|text-red-\d+|fill-accent)\b/.test(subLine) && !/\bbg-surface|\bbg-background|\bbg-white\b/.test(subLine)) {
          // Check if subLine has its own separate background that is NOT navy
          containerConflictCount++;
          console.log(`${relPath}: Container L${i + 1} -> Child L${j + 1}`);
          console.log(`  Container: ${line.trim()}`);
          console.log(`  Child:     ${subLine.trim()}\n`);
        }
      }
    }
  }
});
console.log(`Total potential container conflicts: ${containerConflictCount}`);

