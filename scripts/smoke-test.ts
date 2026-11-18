import { spawn } from "child_process";
import http from "http";

async function probeUrl(url: string): Promise<{ statusCode: number; length: number; bodySnippet: string }> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode || 0,
          length: data.length,
          bodySnippet: data.slice(0, 200),
        });
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSmokeTest() {
  console.log("================================================================");
  console.log("PRODUCTION SMOKE TEST: Starting Next.js Production Server");
  console.log("================================================================");

  const port = 3099;
  const proc = spawn("npm.cmd", ["run", "start", "--", "-p", String(port)], {
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(port),
    },
    stdio: "pipe",
  });

  let serverStarted = false;
  proc.stdout.on("data", (data) => {
    const text = data.toString();
    if (text.includes("Ready in") || text.includes("started server on") || text.includes(`:${port}`)) {
      serverStarted = true;
    }
  });

  proc.stderr.on("data", (data) => {
    console.error("Next.js stderr:", data.toString());
  });

  // Wait for server to come up
  console.log(`Waiting for Next.js production server on port ${port}...`);
  for (let i = 0; i < 30; i++) {
    await delay(1000);
    try {
      const res = await probeUrl(`http://localhost:${port}/`);
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log(`Server is ready! (HTTP ${res.statusCode})`);
        serverStarted = true;
        break;
      }
    } catch {
      // Still booting
    }
  }

  if (!serverStarted) {
    if (proc.pid) {
    try {
      process.platform === "win32"
        ? spawn("taskkill", ["/pid", proc.pid.toString(), "/f", "/t"], { shell: true })
        : proc.kill();
    } catch {}
  }
    throw new Error("Next.js production server failed to start within timeout.");
  }

  const endpoints = [
    { path: "/", name: "Landing Page", expectedStatus: [200] },
    { path: "/signup", name: "Signup Page", expectedStatus: [200] },
    { path: "/login", name: "Login Page", expectedStatus: [200] },
    { path: "/create", name: "Create Case Page", expectedStatus: [200, 307, 308] },
    { path: "/admin", name: "Admin Dashboard", expectedStatus: [200, 307, 308] },
    { path: "/privacy", name: "Privacy Policy (DPDP)", expectedStatus: [200] },
  ];

  let allPassed = true;
  for (const ep of endpoints) {
    try {
      const res = await probeUrl(`http://localhost:${port}${ep.path}`);
      const passed = ep.expectedStatus.includes(res.statusCode);
      if (passed) {
        console.log(`  ✅ PASS: ${ep.name} (${ep.path}) -> HTTP ${res.statusCode} (${res.length} bytes)`);
      } else {
        console.error(`  ❌ FAIL: ${ep.name} (${ep.path}) -> HTTP ${res.statusCode} (expected ${ep.expectedStatus.join(",")})`);
        allPassed = false;
      }
    } catch (err: any) {
      console.error(`  ❌ ERROR: ${ep.name} (${ep.path}) -> ${err.message}`);
      allPassed = false;
    }
  }

  if (proc.pid) {
    try {
      process.platform === "win32"
        ? spawn("taskkill", ["/pid", proc.pid.toString(), "/f", "/t"], { shell: true })
        : proc.kill();
    } catch {}
  }
  console.log("Stopped production server process.");

  if (!allPassed) {
    process.exit(1);
  }

  console.log("================================================================");
  console.log("SMOKE TEST COMPLETE: All production routes healthy & responding!");
  console.log("================================================================");
}

runSmokeTest().catch((err) => {
  console.error("Fatal smoke test error:", err);
  process.exit(1);
});
