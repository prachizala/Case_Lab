const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('public/screenshots/domains');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function waitForServer(port) {
  for (let i = 0; i < 40; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}/create`, (res) => {
          if (res.statusCode === 200 || res.statusCode === 307 || res.statusCode === 302) resolve();
          else reject(new Error(`Status ${res.statusCode}`));
        });
        req.on('error', reject);
        req.setTimeout(1000, () => req.destroy());
      });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error('Server did not start in time');
}

async function run() {
  console.log('Starting Next.js server for domain screenshots...');
  const port = 3456;
  const server = spawn('npx', ['next', 'start', '-p', String(port)], {
    shell: true,
    stdio: 'inherit',
  });

  try {
    await waitForServer(port);
    console.log(`Server ready on port ${port}. Capturing screenshots...`);

    const shots = [
      {
        name: 'domain_selector_1440px_light.png',
        url: `http://localhost:${port}/create`,
        width: 1440,
        height: 1000,
        dark: false,
      },
      {
        name: 'domain_selector_1440px_dark.png',
        url: `http://localhost:${port}/create`,
        width: 1440,
        height: 1000,
        dark: true,
      },
      {
        name: 'domain_selector_390px_light.png',
        url: `http://localhost:${port}/create`,
        width: 390,
        height: 844,
        dark: false,
      },
      {
        name: 'domain_selector_390px_dark.png',
        url: `http://localhost:${port}/create`,
        width: 390,
        height: 844,
        dark: true,
      },
    ];

    for (const shot of shots) {
      const outPath = path.join(outDir, shot.name);
      const darkFlag = shot.dark ? '--blink-settings=forceDarkModeEnabled=true' : '';
      const cmd = `"${chromePath}" --headless=new --disable-gpu ${darkFlag} --window-size=${shot.width},${shot.height} --screenshot="${outPath}" "${shot.url}"`;
      console.log(`Capturing ${shot.name} (${shot.width}x${shot.height}, dark=${shot.dark})...`);
      execSync(cmd);
      console.log(`  ✓ Saved: ${outPath}`);
    }

    console.log('All 4 domain screenshots captured successfully!');
  } finally {
    console.log('Stopping server...');
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${server.pid} /T /F`).catch?.(() => {});
    } else {
      server.kill('SIGTERM');
    }
  }
}

run().catch((err) => {
  console.error('Screenshot run failed:', err);
  process.exit(1);
});
