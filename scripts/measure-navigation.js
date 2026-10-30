const puppeteer = require("puppeteer-core");
const crypto = require("crypto");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";
const SESSION_SECRET = "sbs_caselab_secure_session_secret_key_2026_dev";

function makeSessionToken(userId, secret = SESSION_SECRET) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 8 * 3600,
  };
  const b64 = (obj) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  const hB64 = b64(header);
  const pB64 = b64(payload);
  const data = `${hB64}.${pB64}`;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${data}.${sig}`;
}

async function runBenchmark() {
  console.log("Launching headless browser for performance benchmarking...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Set auth session cookie
  const token = makeSessionToken("usr-faculty-1");
  await page.setCookie({
    name: "sbs_caselab_session",
    value: token,
    domain: "localhost",
    path: "/",
    httpOnly: true,
  });

  const networkRequests = [];
  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("/api/") || url.includes("/_next/data/")) {
      networkRequests.push({ url, method: req.method(), time: Date.now() });
    }
  });

  console.log("Warming up with initial page load /dashboard...");
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));

  const routesToTest = [
    { name: "/dashboard", selector: "a[href='/dashboard']", expectedUrl: "/dashboard", readySelector: "main" },
    { name: "/create", selector: "a[href='/create']", expectedUrl: "/create", readySelector: "form, textarea, input, h1, h2" },
    { name: "/library", selector: "a[href='/library']", expectedUrl: "/library", readySelector: "input[placeholder*='Search'], main" },
    { name: "/trending", selector: "a[href='/trending']", expectedUrl: "/trending", readySelector: "main" },
    { name: "/analytics", selector: "a[href='/analytics']", expectedUrl: "/analytics", readySelector: "main" },
    { name: "/pricing", selector: "a[href='/pricing']", expectedUrl: "/pricing", readySelector: "main" },
    { name: "/guide", selector: "a[href='/guide']", expectedUrl: "/guide", readySelector: "main" },
    { name: "/cases/[id]", urlDirect: `${BASE_URL}/cases/case-1`, readySelector: "main h1, main h2, main" },
  ];

  const results = [];

  for (const target of routesToTest) {
    const reqsBefore = networkRequests.length;
    let duration = 0;

    if (target.urlDirect) {
      const start = performance.now();
      await page.goto(target.urlDirect, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(target.readySelector, { timeout: 10000 });
      duration = Math.round(performance.now() - start);
    } else {
      const link = await page.$(target.selector);
      if (!link) {
        console.warn(`Link for ${target.name} not found, testing direct goto`);
        const start = performance.now();
        await page.goto(`${BASE_URL}${target.name}`, { waitUntil: "domcontentloaded" });
        await page.waitForSelector(target.readySelector, { timeout: 10000 });
        duration = Math.round(performance.now() - start);
      } else {
        const start = performance.now();
        await link.click();
        await page.waitForFunction(
          (expected) => window.location.pathname.startsWith(expected),
          {},
          target.expectedUrl
        );
        await page.waitForSelector(target.readySelector, { timeout: 10000 });
        duration = Math.round(performance.now() - start);
      }
    }

    const reqsAfter = networkRequests.length;
    const reqsMade = networkRequests.slice(reqsBefore, reqsAfter);
    const apiCalls = reqsMade.map((r) => r.url.replace(BASE_URL, "")).join(", ");

    results.push({
      route: target.name,
      durationMs: duration,
      apiCallsCount: reqsMade.length,
      apiCalls: apiCalls || "none",
    });

    console.log(`Measured ${target.name}: ${duration}ms (${reqsMade.length} API calls: ${apiCalls || "none"})`);
    await new Promise((r) => setTimeout(r, 500));
  }

  await browser.close();

  console.log("\n=======================================================");
  console.log("            NAVIGATION BENCHMARK RESULTS               ");
  console.log("=======================================================");
  console.table(results);
  console.log("=======================================================\n");

  return results;
}

runBenchmark().catch((err) => {
  console.error("Benchmark error:", err);
  process.exit(1);
});
