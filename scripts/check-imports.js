const fs = require("fs");
const path = require("path");

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) {
      const content = fs.readFileSync(p, "utf8");
      const isClient = content.includes('"use client"') || content.includes("'use client'");
      const hasJsPdf = /from\s+['"]jspdf['"]/.test(content);
      const hasDocx = /from\s+['"]docx['"]/.test(content);
      const hasFs = /from\s+['"]fs['"]/.test(content) || /require\(['"]fs['"]\)/.test(content);
      const hasWholeLucide = /from\s+['"]lucide-react['"]/.test(content) && /\*\s+as/.test(content);

      if (hasJsPdf || hasDocx || hasFs || hasWholeLucide) {
        console.log(`[${isClient ? "CLIENT" : "SERVER"}] ${p.replace(/\\/g, "/")}:`);
        if (hasJsPdf) console.log("  - imports jspdf");
        if (hasDocx) console.log("  - imports docx");
        if (hasFs) console.log("  - imports fs");
        if (hasWholeLucide) console.log("  - imports * from lucide-react");
      }
    }
  }
}

walk(path.join(__dirname, "../src"));
