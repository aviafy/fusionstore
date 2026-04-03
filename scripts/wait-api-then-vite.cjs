const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const waitOn = require('wait-on');

const port = Number(process.env.PORT) || 5050;
const resource = `tcp:127.0.0.1:${port}`;
const root = path.join(__dirname, '..');
const viteEntry = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

console.log(`Waiting for API at ${resource} before starting Vite…`);

waitOn({
  resources: [resource],
  timeout: 120_000,
  interval: 200,
  log: false,
})
  .then(() => {
    const child = spawn(process.execPath, [viteEntry], {
      cwd: root,
      stdio: 'inherit',
      env: process.env,
    });
    child.on('exit', (code, signal) => {
      process.exit(code != null ? code : signal ? 1 : 0);
    });
  })
  .catch((err) => {
    console.error(`Timed out waiting for API at ${resource} (${err.message})`);
    process.exit(1);
  });
